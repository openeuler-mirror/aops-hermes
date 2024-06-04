<template>
  <div>
    <a target="_blank" @click="toHelp">帮助</a>
  </div>
  <div>版权所有 © 2023 openEuler 保留一切权利</div>
  <div>
    <img src="@/assets/imgs/horizontal-left.png" style="height: 20px" class="logo" alt="logo" />
  </div>
</template>

<script lang="ts" setup>
const toHelp = () => {
  window.open('https://docs.openeuler.org/zh/docs/22.03_LTS_SP2/docs/A-Ops/overview.html');
};
</script>

<style lang="less" scoped>
a {
  color: #797474;
  user-select: none;
}
</style>
