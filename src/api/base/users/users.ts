import { request } from '@/utils/request'
import { ChangePasswordModel, CreateModel, ResetPasswordModel, UserProfileModel } from '.'
import { ApiResult, ApiResultOfEntity } from '../../apiResult'

export interface UserResult {
  user: UserProfileModel
}

export const UsersApiClient = {
  /**
   * 获取用户信息
   * @param params 授权token
   * @returns {ApiResult} ApiResult
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
    params: any,
  ) {
    return request.get<ApiResult>({ url: '/base/users/list', params })
  },

  /**
   * 获取用户详细资料
   * @param {string} id 用户id
   * @returns {ApiResult} api 统一返回结果
   */
  get(id: string) {
    return request.get<ApiResultOfEntity<UserProfileModel>>({ url: `/base/users/get/${id}` })
  },

  /**
   * 获取用户详细资料(by用户名)
   * @param {string} username 登录名称
   * @returns {ApiResult} api 统一返回结果
   */
  getByName(username: string) {
    return request.get<ApiResultOfEntity<UserProfileModel>>({ url: `/base/users/getByName/${username}` })
  },

  /**
   * 创建新用户
   */
  create(data: CreateModel) {
    return request.post<ApiResultOfEntity<UserProfileModel>>({ url: '/base/users/create', data })
  },

  /**
   * 更新用户资料
   */
  update(data: UserProfileModel) {
    return request.put<ApiResultOfEntity<UserProfileModel>>({ url: '/base/users/update', data })
  },

  /**
   * 修改登录密码
   */
  changePassword(data: ChangePasswordModel) {
    return request.post<ApiResult>({ url: '/base/users/changePassword', data })
  },

  /**
   * 修改登录密码
   */
  resetPassword(data: ResetPasswordModel) {
    return request.post<ApiResult>({ url: '/base/users/resetPassword', data })
  },

  /**
   * 删除指定用户
   */
  delete(id: string) {
    return request.delete<ApiResultOfEntity<UserProfileModel>>({ url: `/base/users/delete/${id}` })
  },

  /**
   * 删除指定用户, by username
   */
  deleteByName(userName: string) {
    return request.delete<ApiResultOfEntity<UserProfileModel>>({ url: `/base/users/deleteByName/${userName}` })
  },
}
