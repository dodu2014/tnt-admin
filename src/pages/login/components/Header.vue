<template>
  <header class="login-header">
    <logo-full-icon class="logo" />
    <div class="operations-container">
      <t-button theme="default" shape="square" variant="text" @click="navToHome">
        <t-icon name="home" size="20" />
      </t-button>
      <t-button theme="default" shape="square" variant="text" @click="navToHelper">
        <t-icon name="help-circle" size="20" />
      </t-button>
      <t-button theme="default" shape="square" variant="text" @click="toggleSettingPanel">
        <t-icon name="setting" size="20" />
      </t-button>
    </div>
  </header>
</template>

<script setup lang="ts">
import LogoFullIcon from '@/assets/assets-logo-full.svg?component'
import { useSettingStore } from '@/store'

const settingStore = useSettingStore()
const toggleSettingPanel = () => {
  settingStore.updateConfig({
    showSettingPanel: true,
  })
}

const navToHome = () => {
  window.open('https://www.5shiguang.net')
}

const navToHelper = () => {
  window.open('https://tdesign.tencent.com/vue-next')
}
</script>

<style lang="less" scoped>
.login-header {
  height: 64px;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  backdrop-filter: blur(5px);
  color: var(--td-text-color-primary);

  .logo {
    width: 188px;
    height: 64px;
  }

  .operations-container {
    display: flex;
    align-items: center;
  }
}
</style>
