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
    </t-row>

    <div v-loading="loading" class="main-content-box flex-fill py-0">
      <t-tabs v-model="query.type">
        <t-tab-panel v-for="(item, index) in tabsList" :key="index" :value="`${item.value}`" :label="`${item.label}(${item.count})`"></t-tab-panel>
      </t-tabs>

      <t-table v-if="data.length" :data="data" :columns="COLUMNS" header-affixed-top class="flex-fill h-0" hover max-height="100%" row-key="id" size="small">
        <template #requestUrl="scope">
          <div>
            <t-tag>{{ showUserOperateLogTypeName(scope.row.type) }}</t-tag>
            {{ scope.row.content }}
          </div>
          <div>
            {{ scope.row.requestMethod }}: {{ scope.row.requestUrl }}，耗时：<span class="text-orange">{{ scope.row.requestMilliseconds }}</span> ms
          </div>
        </template>
        <template #ipAddress="scope">
          <div>{{ scope.row.ipAddress }}({{ scope.row.ipInfo }})</div>
        </template>
        <template #clientInfo="scope">
          <div>{{ scope.row.os }}</div>
          <div>{{ scope.row.ua }}</div>
        </template>
        <template #creationDate="scope">
          <small>{{ formatDate(scope.row.creationDate, 'YYYY-MM-DD HH:mm:ss') }}</small>
        </template>
      </t-table>

      <div v-else class="flex-fill d-flex flex-column align-items-center justify-content-center">
        <empty-icon></empty-icon>
        <p class="mt-3">空空如也</p>
      </div>

      <t-pagination :total="pagination.total" :current="query.page" :page-size="query.pageSize" size="small" :disabled="loading" show-first-and-last-page-btn class="py-4 pagination-center" @change="pageChange" />
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'UserOperateLogsList',
}
</script>

<script setup lang="ts">
import { ref, onMounted, watch, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { SearchIcon } from 'tdesign-icons-vue-next'
import { MessagePlugin } from 'tdesign-vue-next'
// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
import { PRE_SETS_1, PRE_SETS_2, formatDate } from '@/utils/date'
import { purifyObject } from '@/utils/common'

import { COLUMNS } from './constants'
import EmptyIcon from '@/assets/assets-empty.svg?component'
import { useTabsRouterStore } from '@/store'
import { UserOperateLogsApiClient, UserOperateLogTypeEnumList, showUserOperateLogTypeName } from '@/api/base/userOperateLogs/userOperateLogs'

const router = useRouter()
const tabsRouterStore = useTabsRouterStore()

// #region ########## table ##########

const loading = ref(false)
const data = ref([])
const tabsList = ref([{ label: '全部', value: '', count: 0 }, ...UserOperateLogTypeEnumList].map(i => ({ ...i, count: 0 })))

const query = reactive({
  type: '',
  startDate: '',
  endDate: '',
  keyword: '',
  page: 1,
  pageSize: 20,
})

// 日期范围和日期变更事件
const dateRange = ref([])
const dateRangeChange = val => {
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
    const { error, message, result } = await UserOperateLogsApiClient.list(query)
    if (error) {
      MessagePlugin.error(message)
      return
    }
    data.value = result.list
    pagination.total = result.totalItemCount
    pagination.totalPage = result.totalPageCount

    // 合并统计结果到状态中
    const typeGroup = result.typeGroup as Array<any>
    // eslint-disable-next-line no-unused-expressions
    typeGroup &&
      typeGroup.length &&
      tabsList.value.forEach(item => {
        item.count = 0
        const group = typeGroup.find(g => g.type === item.value)
        if (group) item.count = group.count
      })
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

// #region ########## tabs #########

watch(
  () => query.type,
  () => doSearch(1),
)

// #endregion

onMounted(() => {
  const routeQuery = purifyObject(router.currentRoute.value.query)
  query.startDate = routeQuery.startDate || ''
  query.endDate = routeQuery.endDate || ''
  dateRange.value = [query.startDate, query.endDate]
  query.keyword = routeQuery.keyword || ''
  query.type = routeQuery.type || ''
  query.page = +routeQuery.page || 1
  query.pageSize = +routeQuery.pageSize || 20

  fetchData()
})
</script>

<style lang="less" scoped>
@import '@/style/pagination.less';
</style>
