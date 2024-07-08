<script lang="ts" setup>
import { QuestionCircleOutlined } from '@ant-design/icons-vue'
import DarkTogger from '../DarkTogger.vue'
import AvatarDropdown from './AvatarDropdown.vue'

function toSupportFile() {
  window.open('https://docs.openeuler.org/zh/docs/22.03_LTS_SP2/docs/A-Ops/overview.html')
}
</script>

<template>
  <div class="right-content">
    <a-space>
      <DarkTogger class="dark-togger" />
      <span class="support" @click="toSupportFile"> <QuestionCircleOutlined /> 帮助文档 </span>
      <AvatarDropdown />
    </a-space>
  </div>
</template>

<style lang="less" scoped>
.right-content {
  display: flex;
  align-items: center
}
.support {
  cursor: pointer;
}

.dark-togger {
  transform: translate(0, 2px);
}
</style>
