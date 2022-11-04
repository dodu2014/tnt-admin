<template>
  <div class="login-wrapper">
    <login-header />

    <div class="login-container">
      <div class="title-container">
        <h1 class="title mt-0">登录到</h1>
        <h1 class="title">TNT Admin</h1>
        <div class="sub-title">
          <p class="tip text-color-gary">{{ type == 'register' ? '已有账号?' : '没有账号吗?' }}</p>
          <a class="tip text-color-brand" @click="switchType(type == 'register' ? 'login' : 'register')">
            {{ type == 'register' ? '登录' : '注册新账号' }}
          </a>
        </div>
      </div>

      <login v-if="type === 'login'" />
      <register v-else-if="type === 'register'" @register-success="switchType('login')" />
      <tdesign-setting />
    </div>

    <footer class="copyright">Copyright ©2014-2022 TNTGroup. All Rights Reserved</footer>
  </div>
</template>
<script lang="ts">
export default {
  name: 'LoginIndex',
}
</script>
<script setup lang="ts">
import { ref } from 'vue'

import Login from './components/Login.vue'
import Register from './components/Register.vue'
import LoginHeader from './components/Header.vue'
import TdesignSetting from '@/layouts/setting.vue'

const type = ref('login')
const switchType = (val: string) => {
  type.value = val
}
</script>

<style lang="less" scoped>
@import url('./index.less');
</style>
