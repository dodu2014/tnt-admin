import { request } from '@/utils/request'
import { ArticleEntity } from './index.d'
import { ApiResult, ApiResultOfEntity } from '../../apiResult'

export const AtricleApiClient = {
  /**
   * 查询接口
   * @param {any} data 查询参数对象
   */
  list(data: any) {
    return request.get<ApiResult>({ url: '/base/articles/list', params: data })
  },

  /**
   * 详情接口
   * @param id id
   */
  get(id: string) {
    return request.get<ApiResultOfEntity<ArticleEntity>>({ url: `/base/articles/get/${id}` })
  },

  /**
   * 详情接口 (by num)
   * @param num 编号
   */
  getByNum(num: string) {
    return request.get<ApiResultOfEntity<ArticleEntity>>({ url: `/base/articles/getByNum/${num}` })
  },

  /**
   * 创建接口
   * @param model 实体对象
   */
  create(model: ArticleEntity) {
    return request.post<ApiResultOfEntity<ArticleEntity>>({ url: '/base/articles/create', data: model })
  },

  /**
   * 更新接口
   * @param model 实体对象
   */
  update(model: ArticleEntity) {
    return request.put<ApiResultOfEntity<ArticleEntity>>({ url: '/base/articles/update', data: model })
  },

  /**
   * 删除接口
   * @param id id
   */
  delete(id: string) {
    return request.delete<ApiResultOfEntity<ArticleEntity>>({ url: `/base/articles/delete/${id}` })
  },

  /**
   * 批量删除接口
   * @param idlist id列表
   */
  batchDelete(idlist: string[]) {
    return request.delete<ApiResult>({ url: `/base/articles/batchDelete`, data: idlist })
  },
}
