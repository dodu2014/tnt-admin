<template>
  <div class="h-100 d-flex flex-column">
    <t-row justify="space-between" class="mb-3">
      <t-form layout="inline" label-width="0" @submit="doSearch()">
        <t-form-item>
          <t-date-range-picker v-model="dateRange" :presets="PRE_SETS_2" clearable @change="dateRangeChange" />
        </t-form-item>
        <t-form-item>
          <t-input v-model="query.keyword" placeholder="请输入你需要搜索的内容" clearable>
            <template #suffix-icon>
              <search-icon size="20px" />
            </template>
          </t-input>
        </t-form-item>
        <t-form-item style="min-width: auto; margin-right: auto">
          <t-button theme="default" type="submit">
            <template #icon><t-icon name="search" /></template>
            查询
          </t-button>
        </t-form-item>
      </t-form>

      <t-button @click="create">
        <template #icon><t-icon name="add" /></template>
        新增用户
      </t-button>
    </t-row>

    <div v-loading="loading" class="main-content-box flex-fill py-0">
      <t-tabs v-model="query.role">
        <t-tab-panel :label="`全部`" :value="``"></t-tab-panel>
        <t-tab-panel v-for="(item, index) in tabsList" :key="index" :value="`${item.label}`" :label="`${item.value}`"></t-tab-panel>
      </t-tabs>

      <t-table v-if="dataList.length" :data="dataList" :columns="COLUMNS" header-affixed-top class="flex-fill h-0" hover max-height="100%" row-key="id" size="small">
        <template #avatarUrl="scope">
          <t-avatar :image="scope.row.avatarUrl">
            <template #icon><t-icon name="user" /></template>
          </t-avatar>
        </template>
        <template #userName="scope">
          <div>{{ scope.row.userName }}</div>
        </template>
        <template #date="scope">
          <span>{{ formatDate(scope.row.date, 'YYYY-MM-DD HH:mm:ss') }}</span>
        </template>
        <template #op="scope">
          <t-button theme="primary" size="small" variant="text" @click="reset(scope.row.userName)">
            <template #icon>
              <t-icon name="refresh"></t-icon>
            </template>
            重置密码
          </t-button>
          <t-button theme="primary" size="small" variant="text" @click="edit(scope.row.userName)">
            <template #icon>
              <t-icon name="edit-1"></t-icon>
            </template>
            编辑
          </t-button>
          <t-button theme="primary" size="small" variant="text" :disabled="scope.row.userName === 'admin'" @click="remove(scope.row.userName)">
            <template #icon>
              <t-icon name="delete"></t-icon>
            </template>
            删除
          </t-button>
        </template>
      </t-table>

      <div v-else class="flex-fill d-flex flex-column align-items-center justify-content-center">
        <empty-icon></empty-icon>
        <p class="mt-3">空空如也</p>
      </div>

      <t-pagination :total="pagination.total" :current="query.page" :page-size="query.pageSize" size="small" :disabled="loading" show-first-and-last-page-btn class="py-4 pagination-center" @change="pageChange" />
    </div>

    <t-dialog
      v-model:visible="editDialog.visible"
      :close-on-overlay-click="false"
      :header="editDialog.title"
      :confirm-btn="{
        content: '保存',
        theme: 'primary',
        loading: editDialog.loading,
      }"
      :on-confirm="() => form.submit()"
      :z-index="1900"
      width="500px"
    >
      <template v-if="editDialog.visible" #body>
        <!-- 新增用户档案 -->
        <t-form v-if="editDialog.mode === Mode.create" ref="form" label-align="top" colon :data="editDialog.createFormData" :disabled="editDialog.loading" :rules="rules" label-width="90px" @submit="onSubmit">
          <t-form-item label="角色" name="role">
            <t-select v-model="editDialog.createFormData.role" :options="tabsList" placeholder="请选择用户角色" clearable />
          </t-form-item>

          <t-form-item label="登录名称" name="userName">
            <t-input v-model="editDialog.createFormData.userName" placeholder="登录名称"></t-input>
          </t-form-item>

          <t-form-item label="登录密码" name="password">
            <t-input v-model="editDialog.createFormData.password" type="password" autocomplete></t-input>
          </t-form-item>

          <t-form-item label="确认密码" name="confirmPassword">
            <t-input v-model="editDialog.createFormData.confirmPassword" type="password" autocomplete></t-input>
          </t-form-item>

          <t-form-item label="头像" name="avatarUrl">
            <t-upload v-model="avatarUrl" theme="image" tips="要求文件大小在 1M 以内" accept="image/*" auto-upload :abridge-name="[6, 6]" :action="uploadUrl" @success="avatarUrlUploadSuccess" @remove="avatarUrlRemove"></t-upload>
          </t-form-item>

          <t-form-item label="姓名" name="name">
            <t-input v-model="editDialog.createFormData.name" placeholder="真实姓名"></t-input>
          </t-form-item>

          <t-form-item label="手机号" name="phoneNumber">
            <t-input v-model="editDialog.createFormData.phoneNumber" placeholder="手机号"></t-input>
          </t-form-item>

          <t-form-item label="电子邮箱" name="email">
            <t-input v-model="editDialog.createFormData.email" placeholder="email 地址"></t-input>
          </t-form-item>

          <t-form-item label="描述" name="remark">
            <t-textarea v-model="editDialog.createFormData.description" placeholder="请输入描述"></t-textarea>
          </t-form-item>
        </t-form>

        <!-- 编辑用户档案 -->
        <t-form v-else-if="editDialog.mode === Mode.edit" ref="form" label-align="top" colon :data="editDialog.editFormData" :disabled="editDialog.loading" :rules="rules" label-width="90px" @submit="onSubmit">
          <t-form-item label="登录名称" name="userName">
            <t-input v-model="editDialog.editFormData.userName" disabled placeholder="登录名称"></t-input>
          </t-form-item>

          <t-form-item label="头像" name="avatarUrl">
            <t-upload v-model="avatarUrl" theme="image" tips="要求文件大小在 1M 以内" accept="image/*" auto-upload :abridge-name="[6, 6]" :action="uploadUrl" @success="avatarUrlUploadSuccess" @remove="avatarUrlRemove"></t-upload>
          </t-form-item>

          <t-form-item label="姓名" name="name">
            <t-input v-model="editDialog.editFormData.name" placeholder="真实姓名"></t-input>
          </t-form-item>

          <t-form-item label="手机号" name="phoneNumber">
            <t-input v-model="editDialog.editFormData.phoneNumber" placeholder="手机号"></t-input>
          </t-form-item>

          <t-form-item label="电子邮箱" name="email">
            <t-input v-model="editDialog.editFormData.email" placeholder="email 地址"></t-input>
          </t-form-item>

          <t-form-item label="描述" name="remark">
            <t-textarea v-model="editDialog.editFormData.description" placeholder="请输入描述"></t-textarea>
          </t-form-item>
        </t-form>

        <!-- 重置用户密码 -->
        <t-form v-else-if="editDialog.mode === Mode.reset" ref="form" label-align="top" colon :data="editDialog.resetFormData" :disabled="editDialog.loading" :rules="rules" label-width="90px" @submit="onSubmit">
          <t-form-item label="登录名称" name="userName">
            <t-input v-model="editDialog.resetFormData.userName" disabled placeholder="登录名称"></t-input>
          </t-form-item>

          <t-form-item label="登录密码" name="password">
            <t-input v-model="editDialog.resetFormData.password" type="password" autocomplete></t-input>
          </t-form-item>

          <t-form-item label="确认密码" name="confirmPassword">
            <t-input v-model="editDialog.resetFormData.confirmPassword" type="password" autocomplete></t-input>
          </t-form-item>
        </t-form>
      </template>
    </t-dialog>
  </div>
</template>

<script lang="ts">
export default {
  name: 'UsersList',
}
</script>

<script setup lang="ts">
import { ref, onMounted, watch, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { SearchIcon } from 'tdesign-icons-vue-next'
import { DialogPlugin, MessagePlugin } from 'tdesign-vue-next'
import dayjs from 'dayjs'
import { PRE_SETS_2, formatDate } from '@/utils/date'
import { purifyObject } from '@/utils/common'

import { COLUMNS } from './constants'
import EmptyIcon from '@/assets/assets-empty.svg?component'
import { useTabsRouterStore } from '@/store'
import { UsersApiClient } from '@/api/base/users/users'
import { CreateModel, ResetPasswordModel, UserProfileModel } from '@/api/base/users'
import { guid } from '@/utils/guid'
import { RolesApiClient } from '@/api/base/roles/roles'

const router = useRouter()
const tabsRouterStore = useTabsRouterStore()

// #region ########## table ##########

const loading = ref(false)
const dataList = ref([])
const tabsList = ref([])

const query = reactive({
  role: '',
  startDate: '',
  endDate: '',
  keyword: '',
  page: 1,
  pageSize: 20,
})

// 日期范围和日期变更事件
const dateRange = ref([])
const dateRangeChange = (val: any) => {
  let newVal = [...val]
  if (!newVal || newVal.length === 0) newVal = ['', '']
  // eslint-disable-next-line prefer-destructuring
  query.startDate = newVal[0]
  // eslint-disable-next-line prefer-destructuring
  query.endDate = newVal[1]
}

/**
 * 获取数据
 */
const fetchData = async () => {
  loading.value = true
  try {
    const { error, message, result } = await UsersApiClient.list(query)
    if (error) {
      MessagePlugin.error(message)
      return
    }
    dataList.value = result.list
    pagination.total = result.totalItemCount
    pagination.totalPage = result.totalPageCount
  } catch (error) {
    MessagePlugin.error(error.message || error.code || error)
  } finally {
    loading.value = false
  }
}

/**
 * 搜索
 * @param page 页码，默认：1
 */
const doSearch = (page = 1) => {
  query.page = page
  fetchData()
  // 替换当前路由，使支持刷新
  const purifyQuery = purifyObject(query)
  router.replace({
    path: router.currentRoute.value.path,
    query: purifyQuery,
  })
  // 更新标签查询
  tabsRouterStore.updateTabRouterQuery(router.currentRoute.value.path, purifyQuery)
}

const roleList = ref([])
const fetchRoleData = async () => {
  try {
    const { error, message, result } = await RolesApiClient.list({ pagesize: 99 })
    if (error) {
      MessagePlugin.error(message)
      return
    }
    console.log(result.list)
    roleList.value = result.list
    tabsList.value = tabsList.value.concat(...result.list.map(i => ({ label: i.name, value: i.name })))
  } catch (error) {
    MessagePlugin.error(error.message || error.code || error)
  }
}

// #endregion

// #region ##########  pagination ##########

const pagination = reactive({
  total: 0,
  totalPage: 0,
})

const pageChange = (pageInfo: { current: number; pageSize: number }) => {
  // console.log('分页变化', pageInfo)
  query.page = pageInfo.current
  query.pageSize = pageInfo.pageSize
  doSearch(pageInfo.current)
}

// #endregion

// #region ########## tabs #########

watch(
  () => query.role,
  () => doSearch(1),
)

// #endregion

// #region dialog | 增删改 重置

const form = ref(null)

// 表单校验规则
const rules = {
  role: [{ required: true, message: '角色 必填' }],
  userName: [
    { required: true, message: '登录名称 必填' },
    { whitespace: true, message: '登录名称 不能为空' },
  ],
  password: [{ required: true, message: '登录密码 必填' }],
  confirmPassword: [
    { required: true, message: '确认密码 必填' },
    {
      validator: (val: string) =>
        new Promise(resolve => {
          switch (editDialog.mode) {
            case Mode.create:
              resolve(editDialog.createFormData.password === val)
              break
            case Mode.reset:
            default:
              resolve(editDialog.resetFormData.password === val)
              break
          }
        }),
      message: '两次密码不一致',
    },
  ],
  email: [{ email: { ignore_max_length: true }, message: '邮箱地址格式有误', type: 'warning' }],
}

const initCreateEntity = (): CreateModel => ({
  confirmPassword: '',
  date: dayjs().format('YYYY-MM-DD HH:mm:ss'),
  password: '',
  role: '',
  userName: '',
  avatarUrl: '',
  description: '',
  email: '',
  id: guid.new(),
  name: '',
  phoneNumber: '',
  rights: '',
  rightsList: [],
  signature: '',
})
const initEditEntity = (userName: string): UserProfileModel => null
const initResetEntity = (userName: string): ResetPasswordModel => ({
  userName,
  password: '',
  confirmPassword: '',
  code: '',
})

enum Mode {
  create,
  edit,
  reset,
}
const editDialog = reactive({
  visible: false,
  title: '',
  loading: false,
  mode: Mode.create,
  createFormData: initCreateEntity(),
  editFormData: initEditEntity(''),
  resetFormData: initResetEntity(''),
})

const create = () => {
  editDialog.title = '新建用户档案'
  editDialog.mode = Mode.create
  editDialog.createFormData = initCreateEntity()
  editDialog.loading = false
  editDialog.visible = true
}

const reset = (userName: string) => {
  editDialog.title = '重置登录密码'
  editDialog.mode = Mode.reset
  editDialog.resetFormData = initResetEntity(userName)
  editDialog.loading = false
  editDialog.visible = true
}

const edit = async (userName: string) => {
  try {
    loading.value = true
    editDialog.loading = true
    const { error, message, result } = await UsersApiClient.getByName(userName)
    if (error) {
      MessagePlugin.error(message)
      return
    }
    editDialog.title = `编辑用户档案`
    editDialog.mode = Mode.edit
    editDialog.editFormData = result.entity
    editDialog.visible = true
  } catch (error) {
    MessagePlugin.error(error?.message || error?.code || error)
  } finally {
    loading.value = false
    editDialog.loading = false
  }
}

const remove = (userName: string) => {
  const dialog = DialogPlugin.confirm({
    header: '删除确认？',
    body: `此删除操作不可逆，无法恢复，是否继续？`,
    confirmBtn: {
      content: '确认删除',
      theme: 'danger',
    },
    cancelBtn: '取消',
    theme: 'warning',
    confirmOnEnter: true,
    async onConfirm() {
      try {
        const { error, message } = await UsersApiClient.deleteByName(userName)
        if (error) {
          MessagePlugin.error(message)
          return
        }
        MessagePlugin.success('删除成功！')
        const index = dataList.value.findIndex(i => i.userName === userName)
        // eslint-disable-next-line no-unused-expressions
        index >= 0 && dataList.value.splice(index, 1)
      } catch (error) {
        MessagePlugin.error(error?.message || error?.code || error)
      } finally {
        dialog.hide()
      }
    },
    onClose() {
      dialog.hide()
    },
  })
}

const onSubmit = async ({ e, validateResult, firstError }) => {
  e.preventDefault()
  if (validateResult !== true) {
    MessagePlugin.warning(firstError)
    return
  }

  editDialog.loading = true
  try {
    const error = 0
    const message = ''
    switch (editDialog.mode) {
      case Mode.create: {
        const { error, message } = await UsersApiClient.create(editDialog.createFormData)
        if (error) {
          MessagePlugin.error(message)
          return
        }
        MessagePlugin.success('创建成功！')
        break
      }
      case Mode.edit: {
        const { error, message } = await UsersApiClient.update(editDialog.editFormData)
        if (error) {
          MessagePlugin.error(message)
          return
        }
        MessagePlugin.success('更新成功！')
        break
      }
      case Mode.reset:
      default: {
        const res = await UsersApiClient.resetPassword(editDialog.resetFormData)
        if (error) {
          MessagePlugin.error(message)
          return
        }
        MessagePlugin.success('重置成功！')
        break
      }
    }
    fetchData()
  } catch (error) {
    MessagePlugin.error(error?.message || error?.code || error)
    return
  } finally {
    editDialog.loading = false
  }
  editDialog.visible = false
}

// #endregion

// #region upload

const { VITE_PROXY_HOST, VITE_UPLOADFILE_URL } = import.meta.env
const uploadUrl = `${VITE_PROXY_HOST}${VITE_UPLOADFILE_URL}`

const avatarUrl = computed(() => {
  const url = editDialog.mode === Mode.create ? editDialog.createFormData.avatarUrl : editDialog.editFormData.avatarUrl
  if (!url) return []
  const name = url.replace(/(.*\/)*([^.]+)(.*)/gi, '$2$3') // 获取文件名和扩展名 aa.jpg
  return [{ name, url }]
})

const avatarUrlUploadSuccess = ({ file }) => {
  MessagePlugin.success(`文件 ${file.name} 上传成功`)
  switch (editDialog.mode) {
    case Mode.create:
      editDialog.createFormData.avatarUrl = file.response.absUrl
      break
    case Mode.edit:
    default:
      editDialog.editFormData.avatarUrl = file.response.absUrl
      break
  }
}

const avatarUrlRemove = (e: any) => {
  console.log(e)
  switch (editDialog.mode) {
    case Mode.create:
      editDialog.createFormData.avatarUrl = ''
      break
    case Mode.edit:
    default:
      editDialog.editFormData.avatarUrl = ''
      break
  }
}

// #endregion

onMounted(() => {
  const routeQuery = purifyObject(router.currentRoute.value.query)
  query.startDate = routeQuery.startDate || ''
  query.endDate = routeQuery.endDate || ''
  dateRange.value = [query.startDate, query.endDate]
  query.keyword = routeQuery.keyword || ''
  query.role = routeQuery.role || ''
  query.page = +routeQuery.page || 1
  query.pageSize = +routeQuery.pageSize || 20

  fetchData()
  fetchRoleData()
})
</script>

<style lang="less" scoped>
@import '@/style/pagination.less';
</style>
