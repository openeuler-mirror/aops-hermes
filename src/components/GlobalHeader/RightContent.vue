<template>
  <div class="right-content">
    <span class="support" @click="toSupportFile"> <QuestionCircleOutlined /> 帮助文档 </span>
    <AvatarDropdown />
  </div>
</template>

<script lang="ts" setup>
import { QuestionCircleOutlined } from '@ant-design/icons-vue';
import AvatarDropdown from './AvatarDropdown.vue';

const toSupportFile = () => {
  window.open('https://docs.openeuler.org/zh/docs/22.03_LTS_SP2/docs/A-Ops/overview.html');
};
</script>

<style lang="less" scoped>
.support {
  cursor: pointer;
  margin-right: 20px;
}
</style>
