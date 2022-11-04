import { MessagePlugin } from 'tdesign-vue-next'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style

import dayjs from 'dayjs'
import { getPermissionStore, getUserStore } from '@/store'
import router from '@/router'
import { TOKEN_NAME, TOKEN_EXPIRATION_NAME } from '@/config/global'

NProgress.configure({ showSpinner: false })

router.beforeEach(async (to, from, next) => {
  NProgress.start()

  const userStore = getUserStore()
  const permissionStore = getPermissionStore()
  const { whiteListRouters } = permissionStore

  const { token, expiration } = userStore
  const tokenStorage = localStorage.getItem(TOKEN_NAME) || ''
  const tokenExpirationStorage = localStorage.getItem(TOKEN_EXPIRATION_NAME) || ''

  // 如果无 token 或 token 失效
  if (!token || !expiration || expiration < dayjs() || !tokenStorage || !tokenExpirationStorage || dayjs(tokenExpirationStorage) < dayjs()) {
    // 判断是否在白名单内
    // eslint-disable-next-line no-unused-expressions
    whiteListRouters.includes(to.path) ? next() : next(`/login?redirect=${to.path}`)
    NProgress.done()
  }

  // 如果是登录页，退出
  if (to.path === '/login') {
    next()
    return
  }

  const { roles } = userStore // 从 store 中拿到 roles

  // 如果用户存储信息无角色信息，重新获取用户档案并作出判断
  if (!roles || !roles.length) {
    try {
      const result = await userStore.getUserInfo()
      if (result.error) {
        MessagePlugin.error(result.message)
        return
      }
      const { roles } = userStore
      await permissionStore.initRoutes(roles)
      // eslint-disable-next-line no-unused-expressions
      router.hasRoute(to.name) ? next() : next(`/`)
    } catch (error) {
      MessagePlugin.error(error)
      next(`/login?redirect=${to.path}`)
    } finally {
      NProgress.done()
    }
  }

  next()
})

router.afterEach(to => {
  if (to.path === '/login') {
    const userStore = getUserStore()
    const permissionStore = getPermissionStore()

    userStore.logout()
    permissionStore.restore()
  }
  NProgress.done()
})
