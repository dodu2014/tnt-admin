<template>
  <div class="h-100 d-flex flex-column">
    <t-row justify="space-between" class="mb-3">
      <t-form layout="inline" label-width="0" @submit="search()">
        <t-form-item>
          <t-input v-model="query.keyword" placeholder="按关键词搜索" clearable>
            <template #suffix-icon>
              <search-icon size="20px" />
            </template>
          </t-input>
        </t-form-item>
        <t-form-item class="w-auto">
          <t-button theme="default" type="submit">
            <template #icon><t-icon name="search" /></template>
            查询
          </t-button>
        </t-form-item>
      </t-form>

      <t-button v-if="false" @click="create">
        <template #icon><t-icon name="add" /></template>
        新增角色
      </t-button>
    </t-row>

    <div v-loading="loading" class="main-content-box flex-fill py-0">
      <t-table v-if="dataList.length" :data="dataList" :columns="COLUMNS" header-affixed-top class="flex-fill h-0" hover max-height="100%" row-key="id" size="small">
        <template #name="scope">
          <div>{{ scope.row.name }}</div>
        </template>
        <template #description="scope">
          <small>{{ scope.row.description }}</small>
        </template>
        <template #op="scope">
          <t-button theme="primary" size="small" variant="text" @click="edit(scope.row.id)">
            <template #icon>
              <t-icon name="edit"></t-icon>
            </template>
          </t-button>
          <t-button theme="primary" size="small" variant="text" @click="remove(scope.row.id)">
            <template #icon>
              <t-icon name="delete"></t-icon>
            </template>
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
      width="500px"
    >
      <template v-if="editDialog.visible" #body>
        <t-form ref="form" label-align="top" colon :data="editDialog.formData" :disabled="editDialog.loading" :rules="FormRules" label-width="90px" @submit="onSubmit">
          <t-form-item label="角色名称" name="name">
            <t-input v-model="editDialog.formData.name" placeholder="角色名称"></t-input>
          </t-form-item>

          <t-form-item label="描述" name="description">
            <t-textarea v-model="editDialog.formData.description" placeholder="请输入描述"></t-textarea>
          </t-form-item>
        </t-form>
      </template>
    </t-dialog>
  </div>
</template>

<script lang="ts">
export default {
  name: 'RolesList',
}
</script>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { SearchIcon } from 'tdesign-icons-vue-next'
import { DialogPlugin, MessagePlugin } from 'tdesign-vue-next'
import { purifyObject } from '@/utils/common'

import { COLUMNS, FormRules } from './constants'
import EmptyIcon from '@/assets/assets-empty.svg?component'
import { useTabsRouterStore } from '@/store'
import { guid } from '@/utils/guid'
import { RolesApiClient } from '@/api/base/roles/roles'
import { RoleEntity } from '@/api/base/roles'

const router = useRouter()
const tabsRouterStore = useTabsRouterStore()

// #region ########## table ##########

const loading = ref(false)
const dataList = ref([])

const query = reactive({
  keyword: '',
  page: 1,
  pageSize: 20,
})

/**
 * 加载数据
 */
const fetchData = async () => {
  loading.value = true
  try {
    const { error, message, result } = await RolesApiClient.list(query)
    if (error) {
      MessagePlugin.error(message)
      return
    }
    console.log('fetchData: ', result.list)
    dataList.value = result.list
    pagination.total = result.totalItemCount
    pagination.totalPage = result.totalPageCount
  } catch (error) {
    MessagePlugin.error(error?.message || error?.code || error)
  } finally {
    loading.value = false
  }
}

/**
 * 搜索
 * @param page 页码，默认：1
 */
const search = (page = 1) => {
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

// #endregion

// #region ##########  pagination ##########

const pagination = reactive({
  total: 0,
  totalPage: 0,
})

const pageChange = (pageInfo: { current: number; pageSize: number }) => {
  query.page = pageInfo.current
  query.pageSize = pageInfo.pageSize
  search(pageInfo.current)
}

// #endregion

// #region 增删改

const initEntity = (): RoleEntity => ({
  name: '',
  description: '',
  id: guid.new(),
  rights: '',
  rightsList: [],
  concurrencyStamp: '',
})

enum Mode {
  create,
  edit,
}
const editDialog = reactive({
  visible: false,
  title: '',
  loading: false,
  mode: Mode.create,
  formData: initEntity(),
})

const form = ref(null)

const create = () => {
  editDialog.title = '新增角色'
  editDialog.mode = Mode.create
  editDialog.formData = initEntity()
  editDialog.visible = true
}

const edit = async (id: string) => {
  try {
    loading.value = true
    const { error, message, result } = await RolesApiClient.get(id)
    if (error) {
      MessagePlugin.error(message)
      return
    }
    editDialog.title = `编辑角色`
    editDialog.mode = Mode.edit
    editDialog.formData = initEntity()
    editDialog.formData = result.entity
    editDialog.visible = true
  } catch (error) {
    MessagePlugin.error(error?.message || error?.code || error)
  } finally {
    loading.value = false
  }
}

const remove = (id: string) => {
  const dataIndex = dataList.value.findIndex(i => i.id === id)
  if (dataIndex < 0) {
    MessagePlugin.error('未找到对应记录')
    return
  }
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
        const { error, message } = await RolesApiClient.delete(id)
        if (error) {
          MessagePlugin.error(message)
          return
        }
        MessagePlugin.success('删除成功！')
        dataList.value.splice(dataIndex, 1)
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
    const { error, message } = editDialog.mode === Mode.create ? await RolesApiClient.create(editDialog.formData) : await RolesApiClient.update(editDialog.formData)
    if (error) {
      MessagePlugin.error(message)
      return
    }
    MessagePlugin.success('创建成功！')
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

onMounted(() => {
  const routeQuery = purifyObject(router.currentRoute.value.query)
  query.keyword = routeQuery.keyword || ''
  query.page = +routeQuery.page || 1
  query.pageSize = +routeQuery.pageSize || 20

  fetchData()
})
</script>

<style lang="less" scoped>
@import '@/style/pagination.less';
</style>
