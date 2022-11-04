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

      <t-space>
        <t-button @click="create">
          <template #icon><t-icon name="add" /></template>
          新增资讯
        </t-button>
        <t-button theme="danger" :disabled="!selectedDataKeys.length" @click="batchRemove">
          <template #icon><t-icon name="delete" /></template>
          批量删除
          <span v-if="!!selectedDataKeys.length">({{ selectedDataKeys.length }})</span>
        </t-button>
      </t-space>
    </t-row>

    <div v-loading="loading" class="main-content-box flex-fill flex-row p-0">
      <div style="width: 200px; min-width: 200px; max-width: 200px; border-right: 1px solid #00000033" class="p-4 d-flex flex-column h-auto main-content-scrollbar">
        <t-input v-model="treeFilterKeyword" placeholder="关键词筛选" clearable class="mb-3" @change="filter">
          <template #prefix-icon><t-icon name="search" /></template>
        </t-input>

        <t-tree
          ref="tree"
          :data="treeData"
          :keys="{
            value: 'num',
            label: 'name',
            children: 'notLeaf',
          }"
          :filter="treeFilterByKeyword"
          :load="treeLoad"
          activable
          hover
          line
          transition
          lazy
          expand-all
          @active="treeActive"
        >
          <!-- <template #label="{ node }">{{ `${node.value}：${node.label}` }}</template> -->
        </t-tree>
      </div>

      <div class="flex-fill d-flex flex-column p-4">
        <t-table v-if="dataList.length" :data="dataList" :columns="COLUMNS" :selected-row-keys="selectedDataKeys" header-affixed-top class="flex-fill h-0" hover max-height="100%" row-key="id" size="small" @select-change="tableSelectChange">
          <template #img="scope">
            <t-image :url="scope.row.img" width="120" height="60" icon-size="20" class="d-block"></t-image>
          </template>
          <template #title="scope">
            <div>{{ scope.row.title }}</div>
            <div class="mt-2 text-gray text-sm d-flex align-items-center text-color-gray">
              <t-icon name="user" size="14"></t-icon>
              <small class="ml-2 mr-3">
                {{ scope.row.editor }}
              </small>
              <t-icon name="browse" size="14"></t-icon>
              <small class="ml-2 mr-3">
                {{ scope.row.hits }}
              </small>
              <t-icon name="thumb-up" size="14"></t-icon>
              <small class="ml-2 mr-3">
                {{ scope.row.agree }}
              </small>
              <t-icon name="thumb-down" size="14"></t-icon>
              <small class="ml-2 mr-3">
                {{ scope.row.disAgree }}
              </small>
            </div>
          </template>
          <template #creationDate="scope">
            <small>{{ formatDate(scope.row.creationDate, 'YYYY-MM-DD HH:mm') }}</small>
          </template>
          <template #op="scope">
            <t-button theme="primary" size="small" variant="text" @click="toEdit(scope.row.id)">
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

        <t-pagination :total="pagination.total" :current="query.page" :page-size="query.pageSize" size="small" :disabled="loading" show-first-and-last-page-btn class="pt-4 pagination-center" @change="pageChange" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'ArticlesList',
}
</script>

<script setup lang="ts">
import { ref, onMounted, watch, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { SearchIcon } from 'tdesign-icons-vue-next'
import { DialogPlugin, MessagePlugin } from 'tdesign-vue-next'
// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
import { PRE_SETS_1, PRE_SETS_2, formatDate } from '@/utils/date'
import { purifyObject } from '@/utils/common'

import { COLUMNS } from './constants'
import { AtricleApiClient } from '@/api/base/articles/articles'
import { ArticleCategoryApiClient } from '@/api/base/articles/articleCategories'
import EmptyIcon from '@/assets/assets-empty.svg?component'
import TImage from '@/components/t-image/index.vue'
import { useTabsRouterStore } from '@/store'

const router = useRouter()
const tabsRouterStore = useTabsRouterStore()

// #region ########## table ##########

const loading = ref(false)
const dataList = ref([])
const selectedDataKeys = ref([])

const query = reactive({
  startDate: '',
  endDate: '',
  categoryNum: '',
  keyword: '',
  page: 1,
  pageSize: 20,
})

// 日期范围和日期变更事件
const dateRange = ref([])
const dateRangeChange = val => {
  let newVal = [...val]
  if (!newVal || newVal.length === 0) newVal = ['', '']
  const [startDate, endDate] = newVal
  query.startDate = startDate
  query.endDate = endDate
}

/**
 * 获取数据
 */
const fetchData = async () => {
  loading.value = true
  selectedDataKeys.value = []
  try {
    const { error, message, result } = await AtricleApiClient.list(query)
    if (error) {
      MessagePlugin.error(message)
      return
    }
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

// table 选择项变更事件
const tableSelectChange = (val: number[]) => {
  selectedDataKeys.value = val
}

const create = () => router.push('./create')
const toEdit = (id: string) => router.push(`./edit?id=${id}`)
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
        const { error, message } = await AtricleApiClient.delete(id)
        if (error) {
          MessagePlugin.error(message)
          return
        }
        dialog.hide()
        MessagePlugin.success('删除成功！')
        dataList.value.splice(dataIndex, 1)
      } catch (error) {
        MessagePlugin.error(error?.message || error?.code || error)
      }
    },
    onClose() {
      dialog.hide()
    },
  })
}
const batchRemove = () => {
  const dialog = DialogPlugin.confirm({
    header: '批量删除确认？',
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
        const { error, message, result } = await AtricleApiClient.batchDelete(selectedDataKeys.value)
        if (error) {
          MessagePlugin.error(message)
          return
        }
        MessagePlugin.success(`批量删除成功（${result?.count || 0}）！`)
        dialog.hide()
        await fetchData() // 重新加载列表
      } catch (error) {
        MessagePlugin.error(error?.message || error?.code || error)
      }
    },
    onClose() {
      dialog.hide()
    },
  })
}

// #endregion

// #region ##########  pagination ##########

const pagination = reactive({
  total: 0,
  totalPage: 0,
})

const pageChange = pageInfo => {
  // console.log('分页变化', pageInfo)
  query.page = pageInfo.current
  query.pageSize = pageInfo.pageSize
  doSearch(pageInfo.current)
}

// #endregion

// #region ########## tree & category #########

const treeData = ref([])

const fetchCategoryData = async (pid = '') => {
  const { error, message, result } = await ArticleCategoryApiClient.nodeList({ pid })
  if (error) {
    MessagePlugin.error(message)
    return []
  }
  return result.list || []
}

const treeLoad = node =>
  new Promise(resolve => {
    fetchCategoryData(node.value)
      .then(res => {
        // 这里直接使用res，fetchData 中返回的是 res.result.list
        resolve(res)
      })
      .catch(err => console.error(err))
  })

const treeFilterKeyword = ref('')
const treeFilterByKeyword = ref()
const filter = () => {
  treeFilterByKeyword.value = node => node.label.indexOf(treeFilterKeyword.value) >= 0
}
const treeActive = (value, { node }) => {
  console.log({ value, node })
  query.categoryNum = value.length ? value[0] : ''
}

// #endregion

watch(
  () => query.categoryNum,
  () => doSearch(1),
)

onMounted(async () => {
  const routeQuery = purifyObject(router.currentRoute.value.query)
  query.startDate = routeQuery.startDate || ''
  query.endDate = routeQuery.endDate || ''
  dateRange.value = [query.startDate, query.endDate]
  query.keyword = routeQuery.keyword || ''
  query.categoryNum = routeQuery.categoryNum || ''
  query.page = +routeQuery.page || 1
  query.pageSize = +routeQuery.pageSize || 20

  treeData.value = await fetchCategoryData()
  fetchData()
})
</script>

<style lang="less" scoped>
@import '@/style/pagination.less';
</style>
