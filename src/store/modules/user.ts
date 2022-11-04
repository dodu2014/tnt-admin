import { defineStore } from 'pinia'
import dayjs from 'dayjs'
import { TOKEN_NAME, TOKEN_EXPIRATION_NAME } from '@/config/global'
import { store, usePermissionStore } from '@/store'
import { UserApiClient } from '@/api/base/users/user'

const InitUserInfo = {
  userName: '',
  name: '',
  roles: [], // 角色名称数组
  rights: [], // 用户权限
}

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem(TOKEN_NAME) || '', // 默认 token: main-token 不走权限
    expiration: (localStorage.getItem(TOKEN_EXPIRATION_NAME) && dayjs(localStorage.getItem(TOKEN_EXPIRATION_NAME))) || dayjs().subtract(1, 'day'), // 过期时间, dayjs.Dayjs
    userInfo: InitUserInfo, // 用户资料
  }),
  getters: {
    userName: state => {
      return state.userInfo?.userName
    },
    name: state => {
      return state.userInfo?.name
    },
    roles: state => {
      return state.userInfo?.roles
    },
    rights: state => {
      return state.userInfo?.rights
    },
  },
  actions: {
    async login(userInfo: Record<string, unknown>) {
      // 登录请求流程
      const { account, password } = userInfo
      const loginResult = await UserApiClient.login({ username: account, password })
      if (loginResult.error === 0) {
        const { token, expiration } = loginResult.result
        this.token = token
        this.expiration = dayjs(expiration)
        localStorage.setItem(TOKEN_NAME, token)
        localStorage.setItem(TOKEN_EXPIRATION_NAME, expiration)
      }
      return loginResult
    },

    async getUserInfo() {
      const getUserInfoResult = await UserApiClient.getUserInfo(this.token)
      // if (result.roles && result.roles.includes('系统管理员')) result.roles = ['all']
      if (getUserInfoResult.error === 0) this.userInfo = getUserInfoResult.result
      return getUserInfoResult
    },

    async logout() {
      const { error, message } = await UserApiClient.logout()
      if (error !== 0) throw message
      localStorage.removeItem(TOKEN_NAME)
      this.token = ''
      this.expiration = dayjs().subtract(1, 'day')
      this.userInfo = InitUserInfo
    },

    async removeToken() {
      this.token = ''
      this.expiration = dayjs().subtract(1, 'day')
    },
  },
  persist: {
    afterRestore: ctx => {
      if (ctx.store.roles && ctx.store.roles.length > 0) {
        const permissionStore = usePermissionStore()
        permissionStore.initRoutes(ctx.store.roles)
      }
    },
  },
})

export function getUserStore() {
  return useUserStore(store)
}
