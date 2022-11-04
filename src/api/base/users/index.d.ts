/**
 * 用户档案模型
 */
export interface UserProfileModel {
  id?: string
  email?: string
  userName: string
  name?: string
  avatarUrl?: string
  phoneNumber?: string
  description?: string
  rights?: string
  rightsList?: string[]
  signature?: string
  date: string | Date
}

/**
 * 登录模型
 */
export interface LoginModel {
  userName: string
  password: string
}

/**
 * 创建用户模型
 */
export interface RegisterModel extends LoginModel {
  confirmPassword: string
}

/**
 * 用户档案模型
 */
export interface CreateModel extends RegisterModel, UserProfileModel {
  role: string
}

/**
 * 修改密码模型
 */
export interface ChangePasswordModel extends LoginModel {
  newPassword: string
  confirmPassword: string
}

/**
 * 重置密码模型
 */
export interface ResetPasswordModel extends LoginModel {
  confirmPassword: string
  code?: string
}
