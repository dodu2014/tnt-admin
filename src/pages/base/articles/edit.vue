<template>
  <t-form ref="formRef" class="base-form" :data="formData" :rules="FormRules" label-align="top" :label-width="100" @submit="doSubmit">
    <div class="base-form-body">
      <!-- <div class="base-form-body-title">标题</div> -->

      <t-row class="row-gap" :gutter="[16, 24]">
        <t-col :span="6">
          <t-form-item label="资讯标题" name="title">
            <t-input v-model="formData.title" placeholder="请输入资讯标题" clearable />
          </t-form-item>
        </t-col>

        <t-col :span="6">
          <t-form-item label="所属分类" name="categoryMaps">
            <t-cascader
              v-if="!editMode || needSetCategory"
              v-model="categoryList"
              :options="initCategoryList"
              :keys="{ label: 'name', value: 'num', children: 'children' }"
              :show-all-levels="false"
              :load="dynamicLoadCategoryList"
              clearable
              multiple
              @change="categoryListChanged"
            />
            <template v-else>
              <template v-if="formData.categoryMaps.length">
                <t-tag v-for="(item, index) in formData.categoryMaps" :key="index" size="small" class="mr-2 mb-1">{{ item?.category?.name }}</t-tag>
              </template>
              <t-button size="small" theme="warning" class="mb-1" title="切换/变更所属分类" @click="needSetCategory = true">
                <template #icon>
                  <t-icon name="swap"></t-icon>
                </template>
              </t-button>
            </template>
          </t-form-item>
        </t-col>

        <t-col :span="12">
          <t-form-item label="正文" name="content">
            <tinymce-editor v-model="formData.content"></tinymce-editor>
          </t-form-item>
        </t-col>

        <t-col :span="12">
          <t-form-item label="封面（正文中上传有图片，则会列出，可以选择其一作为封面）">
            <div v-if="imageList.length || formData.img" class="d-flex flex-wrap">
              <t-badge v-for="(item, index) in imageList" :key="index" color="#00A870" size="small" class="mr-2" :count="formData.img === item ? '✔️' : ''" :offset="[15, 10]">
                <t-image :url="item" height="80" class="d-block poster-img" title="点击 设置/取消 为封面" @click="formData.img = formData.img === item ? '' : item" />
              </t-badge>
              <template v-if="formData.img && !imageList.includes(formData.img)">
                <t-badge color="#00A870" size="small" count="✔️" :offset="[15, 10]">
                  <t-image :url="formData.img" height="80" class="d-block poster-img" title="点击 设置/取消 为封面" />
                </t-badge>
              </template>
            </div>
            <div v-else class="text-color-gray">正文中无上传图片</div>
          </t-form-item>
        </t-col>

        <t-col :span="6">
          <t-form-item label="作者" name="editor">
            <t-input v-model="formData.editor" placeholder="请输入 作者/编辑" clearable />
          </t-form-item>
        </t-col>

        <t-col :span="6">
          <t-form-item label="发布时间">
            <t-date-picker v-model="formData.creationDate" allow-input enable-time-picker value-type="YYYY-MM-DD HH:mm:ss" />
          </t-form-item>
        </t-col>
      </t-row>
    </div>

    <div class="base-form-submit">
      <div class="base-form-submit-body">
        <t-button theme="primary" type="submit">
          <template #icon>
            <t-icon name="check" />
          </template>
          提交
        </t-button>
        <t-button theme="default" @click="closeCurrentTab">
          <template #icon>
            <t-icon name="close" />
          </template>
          关闭
        </t-button>
      </div>
    </div>
  </t-form>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, inject } from 'vue'
import { MessagePlugin } from 'tdesign-vue-next'
import { useRoute, useRouter } from 'vue-router'
import { InitEntity, FormRules } from './constants'
import { AtricleApiClient } from '@/api/base/articles/articles'
import { ArticleCategoryApiClient } from '@/api/base/articles/articleCategories'
import TinymceEditor from '@/components/tinymce-editor/index.vue'
import TImage from '@/components/t-image/index.vue'
import { ArticleCategoryMapEntity } from '@/api/base/articles/index.d'

const route = useRoute()
const router = useRouter()
const formData = ref(InitEntity)

const imageList = computed(() => {
  if (!formData.value.content) return []
  // 获取所有匹配的img元素
  // 这里只关心拿到<img>的整个标签，所以用非贪婪模式找到最近的关闭标签 >
  const imgs = formData.value.content.match(/<img.*?>/g)
  if (!imgs) return []
  // 获取每个img url
  return imgs.map(url => url.match(/\ssrc=['"](.*?)['"]/)[1])
})

const editMode = ref(false)
const needSetCategory = ref(false)

const loadAtricleDetail = async (id: string) => {
  try {
    const { error, message, result } = await AtricleApiClient.get(id)
    if (error) {
      MessagePlugin.error(message)
      return
    }
    formData.value = result.entity
    // 如果存在无分类数据的情况下，初始化 needSetCategory = true
    needSetCategory.value = result.entity.categoryMaps.length === 0
  } catch (error) {
    MessagePlugin.error(error?.message || error?.code || error)
  }
}

// 从注入中拿到关闭当前标签页方法
const removeCurrentTabRouter: Function = inject('removeCurrentTabRouter')
const closeCurrentTab = () => {
  removeCurrentTabRouter(route.path)
}

const doSubmit = async ({ e, validateResult, firstError }) => {
  e.preventDefault()
  if (validateResult !== true) {
    MessagePlugin.warning(firstError)
    return
  }
  try {
    const { error, message } = !editMode.value ? await AtricleApiClient.create(formData.value) : await AtricleApiClient.update(formData.value)
    if (error) {
      MessagePlugin.error(message)
      return
    }
    // 关闭标签页
    closeCurrentTab()
  } catch (error) {
    MessagePlugin.error((error && error.message) || error.code)
  }
}

// #region 分类相关

// 存储分类字段的编号数组
const categoryList = ref([])
// 分类列表的初始化数组(注意：必须有1个且 children 为 true)
const initCategoryList = ref([
  {
    num: '',
    name: '所有分类',
    children: true,
  },
])

// 加载nodelist
const loadArticleCategoryNodeList = async (pid = '') => {
  try {
    const { error, message, result } = await ArticleCategoryApiClient.nodeList({ pid })
    if (error) {
      MessagePlugin.error(message)
      return
    }
    console.log(result)
    initCategoryList.value = result.list.map(i => ({ num: i.num, name: i.name, children: !i.leaf }))
  } catch (error) {
    MessagePlugin.error(error.message || error.code)
  }
}
// 动态加载分类列表
const dynamicLoadCategoryList = node => {
  console.log('dynamicLoadCategoryList node:', node)
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async resolve => {
    let nodes = []
    const { error, result } = await ArticleCategoryApiClient.nodeList({ pid: node.value })
    if (!error && result.list && result.list.length) {
      nodes = result.list.map(i => ({ num: i.num, name: i.name, children: !i.leaf }))
    }
    resolve(nodes)
  })
}
// 分类字段的编号变更事件
const categoryListChanged = e => {
  formData.value.categoryMaps = e.map((i: string) => {
    // eslint-disable-next-line no-undef
    const item: ArticleCategoryMapEntity = {
      articleId: formData.value.id,
      categoryNum: i,
      category: null,
    }
    return item
  })
}

// #endregion

onMounted(async () => {
  // 加载资讯分类
  await loadArticleCategoryNodeList()

  // 编辑模式，加载资讯详情
  editMode.value = router.currentRoute.value.path.includes('/edit')
  if (editMode.value) {
    const { id } = router.currentRoute.value.query
    await loadAtricleDetail(id as string)
  }
})
</script>

<style lang="less" scoped>
@import '@/style/form.less';

.poster-img {
  z-index: 1;
  cursor: pointer;
}
</style>
