export const COLUMNS = [
  {
    title: '角色名称',
    width: 150,
    colKey: 'name',
  },
  {
    title: '描述',
    align: 'left',
    colKey: 'description',
  },
  {
    title: '操作',
    align: 'left',
    width: 100,
    colKey: 'op',
  },
]

// 表单校验规则
export const FormRules = {
  name: [
    { required: true, message: 'key 必填', type: 'error' },
    { whitespace: true, message: '不能为空' },
  ],
}
