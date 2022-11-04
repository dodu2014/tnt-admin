import { request } from '@/utils/request'
import { RoleEntity } from '.'
import { ApiResult, ApiResultOfEntity } from '../../apiResult'

export const RolesApiClient = {
  /**
   * 获取角色列表
   * @param params 授权token
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
    params: any,
  ) {
    return request.get<ApiResult>({ url: '/base/roles/list', params })
  },

  /**
   * 获取角色详细
   * @param {string} id 角色id
   */
  get(id: string) {
    return request.get<ApiResultOfEntity<RoleEntity>>({ url: `/base/roles/get/${id}` })
  },

  /**
   * 获取角色详细资料(by name)
   * @param {string} name 名称
   */
  getByName(name: string) {
    return request.get<ApiResultOfEntity<RoleEntity>>({ url: `/base/roles/getByName/${name}` })
  },

  /**
   * 新增角色
   */
  create(data: RoleEntity) {
    return request.put<ApiResultOfEntity<RoleEntity>>({ url: '/base/roles/create', data })
  },

  /**
   * 更新角色资料
   */
  update(data: RoleEntity) {
    return request.put<ApiResultOfEntity<RoleEntity>>({ url: '/base/roles/update', data })
  },

  /**
   * 删除指定角色
   */
  delete(id: string) {
    return request.delete<ApiResultOfEntity<RoleEntity>>({ url: `/base/roles/delete/${id}` })
  },

  /**
   * 删除指定角色, by name
   */
  deleteByName(name: string) {
    return request.delete<ApiResultOfEntity<RoleEntity>>({ url: `/base/roles/deleteByName/${name}` })
  },

  /**
   * 同步权限到全部指定角色用户
   */
  syncRightsToUsers(name: string) {
    return request.post<ApiResultOfEntity<RoleEntity>>({ url: `/base/roles/syncRightsToUsers/${name}` })
  },
}
