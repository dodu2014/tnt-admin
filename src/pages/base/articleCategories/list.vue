<template>
  <div class="h-100 d-flex flex-column">
    <t-row justify="space-between" class="mb-3">
      <t-form layout="inline" label-width="0">
        <t-form-item>
          <t-input v-model="query.keyword" placeholder="关键词筛选" clearable @change="filter">
            <template #prefix-icon><t-icon name="search" /></template>
          </t-input>
        </t-form-item>

        <t-form-item class="w-auto"></t-form-item>
      </t-form>

      <t-button @click="create()">
        <template #icon><t-icon name="add" /></template>
        添加类目
      </t-button>
    </t-row>

    <div class="main-content-box main-content-scrollbar">
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
        expand-on-click-node
        expand-all
      >
        <template #label="{ node }">{{ `${node.value}：${node.label}` }}</template>
        <template #operations="{ node }">
          <t-button size="small" variant="text" @click.stop="create(node)">
            <template #icon><t-icon name="add" /></template>
            添加子类目
          </t-button>
          <t-button size="small" variant="text" @click.stop="edit(node)">
            <template #icon><t-icon name="edit" /></template>
            编辑
          </t-button>
          <t-button size="small" variant="text" theme="danger" @click.stop="remove(node)">
            <template #icon><t-icon name="close" /></template>
            删除
          </t-button>
        </template>
      </t-tree>
    </div>

    <t-dialog
      v-model:visible="editDialog.visible"
      :close-on-overlay-click="false"
      :header="editDialog.title"
      :confirm-btn="{
        content: '确定',
        theme: 'primary',
        loading: editDialog.loading,
      }"
      :on-confirm="onConfirm"
      confirm-on-enter
      width="640px"
    >
      <template #body>
        <t-form v-if="editDialog.visible" ref="form" label-align="left" colon :data="editDialog.formData" :disabled="editDialog.loading" :rules="rules" label-width="90px" @submit="onSubmit">
          <t-form-item label="上级类目" name="parentNum">
            {{ editDialog.formData.parentNum || '无(表示顶级类目)' }}
          </t-form-item>

          <t-form-item label="编号" :help="editDialog.formData.parentNum ? '子级类目已自动填充前缀(父级编号)，只需跟着输入子级编号' : ''" name="num">
            <t-input
              v-model="editDialog.formData.num"
              placeholder="请输入类目编号(2位有序整数)"
              class="input-has-label"
              :maxlength="editDialog.mode === Mode.edit ? 0 : 2"
              :label="editDialog.mode === Mode.edit ? '' : editDialog.formData.parentNum"
              :disabled="editDialog.mode === Mode.edit"
            ></t-input>
          </t-form-item>

          <t-form-item label="名称" name="name">
            <t-input v-model="editDialog.formData.name" placeholder="请输入类目名称"></t-input>
          </t-form-item>

          <t-form-item label="可见性" name="visible">
            <t-switch v-model="editDialog.formData.visible"></t-switch>
          </t-form-item>

          <t-form-item label="描述" name="remark">
            <t-textarea v-model="editDialog.formData.remark" placeholder="请输入类目描述"></t-textarea>
          </t-form-item>
        </t-form>
      </template>
    </t-dialog>
  </div>
</template>

<script lang="ts">
export default {
  name: 'ArticlesCategories',
}
</script>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { DialogPlugin, MessagePlugin } from 'tdesign-vue-next'
import { ArticleCategoryEntity, ArticleCategoryTypeEnum } from '@/api/base/articles/index.d'
import { ArticleCategoryApiClient } from '@/api/base/articles/articleCategories'

const initAtricleCategory = (parentNum = ''): ArticleCategoryEntity => ({
  num: '',
  parentNum,
  name: '',
  type: ArticleCategoryTypeEnum.分类,
  visible: true,
  remark: '',
})

// #region 列表，加载|过滤|删除

const treeData = ref([])
const tree = ref(null)

const fetchData = async (pid = '') => {
  const res = await ArticleCategoryApiClient.nodeList({ pid })
  return res.result.list || []
}

const treeLoad = node =>
  new Promise(resolve => {
    fetchData(node.value)
      .then(res => {
        // 这里直接使用res，fetchData 中返回的是 res.result.list
        resolve(res)
      })
      .catch(err => console.error(err))
  })

const query = reactive({
  keyword: '',
})

const treeFilterByKeyword = ref()
const filter = () => {
  treeFilterByKeyword.value = node => node.label.indexOf(query.keyword) >= 0
}

const remove = async node => {
  const dialog = DialogPlugin.confirm({
    header: '删除确认？',
    body: `此删除操作不可逆，无法恢复，且一并删除子类别，是否继续？`,
    confirmBtn: {
      content: '确认删除',
      theme: 'danger',
    },
    theme: 'warning',
    confirmOnEnter: true,
    async onConfirm() {
      try {
        const res = await ArticleCategoryApiClient.delete(node.value)
        if (res.error) {
          MessagePlugin.error(res.message)
          return
        }
        dialog.hide()
        MessagePlugin.success('删除成功！')
        tree.value.remove(node.value)
      } catch (error) {
        MessagePlugin.error(error.message)
      }
    },
    onClose() {
      dialog.hide()
    },
  })
}

// #endregion

// #region 对话框, 增|改

const form = ref(null)

enum Mode {
  create,
  edit,
}
const editDialog = reactive({
  visible: false,
  title: '',
  loading: false,
  mode: Mode.create,
  formData: { ...initAtricleCategory() },
  activeId: '', // 当前操作 node 的 value
})

// 表单校验规则
const rules = {
  num: [
    { required: true, message: '编号必填', type: 'error', trigger: 'blur' },
    { required: true, message: '编号必填', type: 'error', trigger: 'change' },
    { whitespace: true, message: '编号不能为空' },
    { min: 2, message: '编号必须为2位长度', type: 'error', trigger: 'blur' },
    { min: 2, message: '编号必须为2位长度', type: 'error', trigger: 'change' },
  ],
  name: [
    { required: true, message: '名称必填', type: 'error', trigger: 'blur' },
    { required: true, message: '名称必填', type: 'error', trigger: 'change' },
    { whitespace: true, message: '名称不能为空' },
  ],
}

const create = (node = null) => {
  editDialog.title = '添加类目'
  editDialog.mode = Mode.create
  editDialog.formData = initAtricleCategory(node?.value || '')
  editDialog.loading = false
  editDialog.activeId = node?.value || ''
  editDialog.visible = true
}

const edit = async node => {
  try {
    const { error, message, result } = await ArticleCategoryApiClient.get(node.value)
    if (error) {
      MessagePlugin.error(message)
      return
    }
    editDialog.title = `编辑类目(${node.value})`
    editDialog.mode = Mode.edit
    editDialog.formData = result.entity
    editDialog.activeId = node?.value || ''
    editDialog.visible = true
  } catch (error) {
    MessagePlugin.error(error?.message || error?.code || error)
  }
}

const onSubmit = async ({ e, validateResult, firstError }) => {
  e.preventDefault()
  if (validateResult !== true) {
    MessagePlugin.warning(firstError)
    return
  }

  editDialog.loading = true
  switch (editDialog.mode) {
    case Mode.create: {
      const data = { ...editDialog.formData }
      if (data.parentNum) data.num = `${data.parentNum}${data.num}`
      try {
        const res = await ArticleCategoryApiClient.create(data)
        editDialog.loading = false
        if (res.error) {
          MessagePlugin.error(res.message)
          return
        }
        // 插入节点
        tree.value.appendTo(editDialog.activeId, res.result.entity)
        MessagePlugin.success('创建成功！')
      } catch (error) {
        editDialog.loading = false
        MessagePlugin.error(error.message)
        return
      }
      break
    }
    case Mode.edit:
    default: {
      try {
        const res = await ArticleCategoryApiClient.update(editDialog.formData)
        editDialog.loading = false
        if (res.error) {
          MessagePlugin.error(res.message)
          return
        }
        // 更新节点
        const { name } = res.result.entity
        const node = tree.value.getItem(editDialog.activeId)
        node.setData(editDialog.activeId, { label: name })
        MessagePlugin.success('更新成功！')
      } catch (error) {
        editDialog.loading = false
        MessagePlugin.error(error.message)
        return
      }
      break
    }
  }
  editDialog.visible = false
}
const onConfirm = () => {
  form.value.submit()
}

// #endregion

onMounted(async () => {
  treeData.value = await fetchData()
})
</script>

<style lang="less" scoped>
// 编辑对话框 编号前缀样式
.input-has-label :deep(.t-input.t-input--prefix > .t-input__prefix) {
  margin-right: 0.25em;
}
</style>
