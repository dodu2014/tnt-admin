/**
 * 用户角色模型
 */
export interface RoleEntity {
  id?: string
  name: string
  description?: string
  rights?: string
  rightsList?: string[]
  concurrencyStamp?: string
}
