import { request } from '@/utils/request'
import { CarouselEntity } from './index.d'
import { ApiResult, ApiResultOfEntity } from '../../apiResult'

export const CarouselsApiClient = {
  /**
   * 获取轮播图列表
   * @param {any} data 参数对象
   */
  list(
    /**
     * ``` js
     * {
     *   keyword: String, // 关键词
     *   page: 1, // 页码
     *   pagesize: 20, // 页面大小
     * }
     * ```
     */
    data: any,
  ) {
    return request.get<ApiResult>({ url: '/base/carousels/list', params: data })
  },

  /**
   * 获取轮播图详情
   * @param {string} id 轮播图id
   * @returns {ApiResult} api 统一返回结果
   */
  get(id: string) {
    return request.get<ApiResultOfEntity<CarouselEntity>>({ url: `/base/carousels/get/${id}` })
  },

  /**
   * 获取轮播图详情
   * @param {string} key 轮播图id
   * @returns {ApiResult} api 统一返回结果
   */
  getByKey(key: string) {
    return request.get<ApiResultOfEntity<CarouselEntity>>({ url: `/base/carousels/getByKey/${key}` })
  },

  /**
   * 创建轮播图
   */
  create(model: CarouselEntity) {
    return request.post<ApiResultOfEntity<CarouselEntity>>({ url: '/base/carousels/create', data: model })
  },

  /**
   * 更新轮播图
   */
  update(model: CarouselEntity) {
    return request.put<ApiResultOfEntity<CarouselEntity>>({ url: '/base/carousels/update', data: model })
  },

  /**
   * 删除轮播图
   */
  delete(id: string) {
    return request.delete<ApiResultOfEntity<CarouselEntity>>({ url: `/base/carousels/delete/${id}` })
  },
}
