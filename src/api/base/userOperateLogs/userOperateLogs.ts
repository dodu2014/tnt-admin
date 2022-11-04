import { convertEnumEntriesToArray } from '@/utils/common'
import { request } from '@/utils/request'
import { UserOperateLogEntity, UserOperateLogTypeEnum } from './index.d'
import { ApiResult, ApiResultOfEntity } from '../../apiResult'

// 枚举类型的对象数组
export const UserOperateLogTypeEnumList = convertEnumEntriesToArray(Object.entries(UserOperateLogTypeEnum))

// 显示枚举label的方法，可做为 filter 使用
export const showUserOperateLogTypeName = val => {
  if (!val && val !== 0) return ''
  const m = UserOperateLogTypeEnumList.find(i => i.value === val)
  return (m && m.label) || val
}

export const UserOperateLogsApiClient = {
  /**
   * 获取用户操作日志列表
   * @param {any} data 参数对象
   */
  list(
    /**
     * ``` js
     * {
     *   type: string, // 日志类型
     *   startdate: String, // 开始时间
     *   enddate: String, // 结束时间
     *   keyword: String, // 关键词
     *   page: 1, // 页码
     *   pagesize: 20, // 页面大小
     * }
     * ```
     */
    data: any,
  ) {
    return request.get<ApiResult>({ url: '/base/UserOperateLogs/list', params: data })
  },

  /**
   * 获取用户操作日志详情
   * @param {string} id 用户操作日志id
   * @returns {ApiResult} api 统一返回结果
   */
  get(id: string) {
    return request.get<ApiResultOfEntity<UserOperateLogEntity>>({ url: `/base/UserOperateLogs/get/${id}` })
  },

  /**
   * 创建用户操作日志
   */
  create(model: UserOperateLogEntity) {
    return request.post<ApiResultOfEntity<UserOperateLogEntity>>({ url: '/base/UserOperateLogs/create', data: model })
  },

  /**
   * 更新用户操作日志
   */
  update(model: UserOperateLogEntity) {
    return request.put<ApiResultOfEntity<UserOperateLogEntity>>({ url: '/base/UserOperateLogs/update', data: model })
  },

  /**
   * 删除用户操作日志
   */
  delete(id: string) {
    return request.delete<ApiResultOfEntity<UserOperateLogEntity>>({ url: `/base/UserOperateLogs/delete/${id}` })
  },

  /**
   * 清除用户操作日志列表
   * @param {any} data 参数对象
   */
  clear(
    /**
     * ``` js
     * {
     *   type: string, // 日志类型
     *   startdate: String, // 开始时间
     *   enddate: String, // 结束时间
     *   keyword: String, // 关键词
     * }
     * ```
     */
    data: any,
  ) {
    return request.delete<ApiResult>({ url: '/base/UserOperateLogs/clear', params: data })
  },
}
