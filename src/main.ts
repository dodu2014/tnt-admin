import { createApp } from 'vue'
import { useRegisterSW } from 'virtual:pwa-register/vue'

import TDesign from 'tdesign-vue-next'
// import 'tdesign-vue-next/es/style/index.css'

import { store } from './store'
import router from './router'
import '@/style/index.less'
import './permission'
import App from './App.vue'

useRegisterSW({
  onRegistered(e) {
    console.log('onRegistered', e)
  },
  onRegisterError(error) {
    console.log('onRegisterError', error)
  },
  onOfflineReady() {
    console.log('onOfflineReady')
  },
})

const app = createApp(App)

app.use(TDesign)
app.use(store)
app.use(router)

app.mount('#app')
