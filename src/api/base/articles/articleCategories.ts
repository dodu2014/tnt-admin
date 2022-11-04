import { request } from '@/utils/request'
import { ArticleCategoryEntity } from './index.d'
import { ApiResult, ApiResultOfEntity } from '../../apiResult'

export const ArticleCategoryApiClient = {
  list(data: any) {
    return request.get<ApiResult>({ url: '/base/articleCategories/list', params: data })
  },

  nodeList(data: any) {
    return request.get<ApiResult>({ url: '/base/articleCategories/getNodes', params: data })
  },

  get(num: string) {
    return request.get<ApiResultOfEntity<ArticleCategoryEntity>>({ url: `/base/articleCategories/get/${num}` })
  },

  create(model: ArticleCategoryEntity) {
    return request.post<ApiResultOfEntity<ArticleCategoryEntity>>({ url: '/base/articleCategories/create', data: model })
  },

  update(model: ArticleCategoryEntity) {
    return request.put<ApiResultOfEntity<ArticleCategoryEntity>>({ url: '/base/articleCategories/update', data: model })
  },

  delete(id: string) {
    return request.delete<ApiResultOfEntity<ArticleCategoryEntity>>({ url: `/base/articleCategories/delete/${id}` })
  },
}
