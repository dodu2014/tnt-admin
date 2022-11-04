<template>
  <t-form ref="form" :class="['login-form', `login-${type}`]" :data="formData" :rules="FORM_RULES" label-width="0" @submit="onSubmit">
    <template v-if="type == 'password'">
      <t-form-item name="account">
        <t-input v-model="formData.account" size="large" placeholder="请输入登录账号">
          <template #prefix-icon>
            <t-icon name="user" />
          </template>
        </t-input>
      </t-form-item>

      <t-form-item name="password">
        <t-input v-model="formData.password" size="large" :type="showPsw ? 'text' : 'password'" clearable placeholder="请输入登录密码">
          <template #prefix-icon>
            <t-icon name="lock-on" />
          </template>
          <template #suffix-icon>
            <t-icon :name="showPsw ? 'browse' : 'browse-off'" @click="showPsw = !showPsw" />
          </template>
        </t-input>
      </t-form-item>

      <div class="check-container remember-pwd">
        <t-checkbox v-model="formData.checked">记住账号</t-checkbox>
        <a class="tip">忘记账号？</a>
      </div>
    </template>

    <!-- 扫码登陆 -->
    <template v-else-if="type == 'qrcode'">
      <div class="tip-container">
        <span class="tip">请使用微信扫一扫登录</span>
        <a class="refresh">刷新 <t-icon name="refresh" /></a>
      </div>
      <qrcode-vue value="" :size="192" level="H" />
    </template>

    <!-- 手机号登陆 -->
    <template v-else>
      <t-form-item class="verification-code" name="verifyCode">
        <t-input v-model="formData.verifyCode" size="large" placeholder="请输入验证码" />
        <t-button theme="primary" variant="outline" :disabled="countDown > 0" @click="handleCounter">
          {{ countDown == 0 ? '发送验证码' : `${countDown}秒后可重发` }}
        </t-button>
      </t-form-item>
    </template>

    <t-form-item v-if="type !== 'qrcode'" class="btn-container">
      <t-button block size="large" type="submit"> 登录 </t-button>
    </t-form-item>

    <div class="switch-container">
      <a v-if="type !== 'password'" class="tip" @click="switchType('password')">使用账号密码登录</a>
      <a v-if="type !== 'qrcode'" class="tip" @click="switchType('qrcode')">使用微信扫码登录</a>
      <a v-if="type !== 'phone'" class="tip" @click="switchType('phone')">使用手机号登录</a>
    </div>
  </t-form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import QrcodeVue from 'qrcode.vue'
import { MessagePlugin } from 'tdesign-vue-next'
import { useCounter } from '@/hooks'
import { useUserStore } from '@/store'

const userStore = useUserStore()

const FORM_RULES = {
  phone: [{ required: true, message: '手机号必填', type: 'error' }],
  account: [{ required: true, message: '账号必填', type: 'error' }],
  password: [{ required: true, message: '密码必填', type: 'error' }],
  verifyCode: [{ required: true, message: '验证码必填', type: 'error' }],
}

const type = ref('password')

const formData = ref({
  phone: '',
  account: localStorage.getItem('tnt-admin-account') || '',
  password: '',
  verifyCode: '',
  checked: false,
})
const showPsw = ref(false)

const [countDown, handleCounter] = useCounter()

const switchType = (val: string) => {
  type.value = val
}

const router = useRouter()

const onSubmit = async ({ validateResult }) => {
  if (validateResult === true) {
    try {
      const loginResult = await userStore.login(formData.value)
      if (loginResult.error !== 0) {
        MessagePlugin.error(loginResult.message)
        return
      }
      // 根据是否记住账号密码，进而缓存
      if (formData.value.checked) localStorage.setItem('tnt-admin-account', formData.value.account)
      MessagePlugin.closeAll()
      MessagePlugin.success('登陆成功')
      router.push({ path: '/dashboard/base' })
    } catch (e) {
      console.log(e)
      MessagePlugin.error(e.message)
    }
  }
}
</script>

<style lang="less" scoped>
@import url('../index.less');
</style>
