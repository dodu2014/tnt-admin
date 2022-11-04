import dayjs from 'dayjs'
import { ArticleEntity } from '@/api/base/articles'
import { guid } from '@/utils/guid'

export const COLUMNS = [
  { colKey: 'row-select', type: 'multiple', width: 36, fixed: 'left' },
  {
    title: '封面',
    width: 134,
    colKey: 'img',
  },
  {
    title: '标题',
    align: 'left',
    // width: 300,
    colKey: 'title',
  },
  {
    title: '日期',
    width: 180,
    ellipsis: true,
    colKey: 'creationDate',
  },
  {
    align: 'left',
    fixed: 'right',
    width: 100,
    colKey: 'op',
    title: '操作',
  },
]

export const InitEntity: ArticleEntity = {
  id: guid.new(),
  title: '',
  content: '',
  img: '',
  editor: '',
  hits: 0,
  agree: 0,
  disAgree: 0,
  creationDate: dayjs().format('YYYY-MM-DD HH:mm:ss'),
  tagMaps: [],
  categoryMaps: [],
}

export const FormRules = {
  title: [{ required: true, message: '标题必填' }],
  categoryMaps: [{ required: true, message: '分类必填' }],
  content: [{ required: true, message: '正文必填' }],
  editor: [{ required: true, message: '作者必填' }],
  creationDate: [{ required: true, message: '发布时间必填' }],
}
