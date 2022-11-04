/**
 * 类别的类型
 */
export enum ArticleCategoryTypeEnum {
  分类 = 1,
  专题 = 2,
}

/**
 * 资讯分类 实体模型
 */
interface ArticleCategoryEntity {
  num: string
  type: ArticleCategoryTypeEnum
  name: string
  remark?: string
  visible: boolean
  parentNum: string
}

/**
 * 资讯标签 实体模型
 */
interface ArticleTagEntity {
  id: string
  name: string
  count: number
}

/**
 * 资讯分类映射 实体模型
 */
interface ArticleCategoryMapEntity {
  articleId: string
  categoryNum: string
  category?: ArticleCategoryEntity
}

/**
 * 资讯标签映射 实体模型
 */
interface ArticleTagMapEntity {
  articleId: string
  tagId: string
  tag?: ArticleTagEntity
}

/**
 * 资讯 实体模型
 */
interface ArticleEntity {
  id: string
  title: string
  content: string
  img?: string
  editor: string
  hits: number
  agree: number
  disAgree: number
  creationDate: Date | string
  tagMaps?: Array<ArticleTagMapEntity>
  categoryMaps?: Array<ArticleCategoryMapEntity>
}
