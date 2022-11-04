import { request } from '@/utils/request'
import { ApiResult } from '../../apiResult'

export const UserApiClient = {
  /**
   * 请求登录
   * @param data 登录实体模型
   * @returns {ApiResult} ApiResult
   */
  login(data: any) {
    return request.post<ApiResult>({ url: '/base/user/login', data })
  },

  /**
   * 获取用户信息
   * @param token 授权token
   * @returns {ApiResult} ApiResult
   */
  getUserInfo(token: string) {
    return request.get<ApiResult>({ url: '/base/user/getinfo', params: { token } })
  },

  /**
   * 注销请求
   * @returns {ApiResult} ApiResult
   */
  logout() {
    return request.post<ApiResult>({ url: '/base/user/logout' })
  },
}
