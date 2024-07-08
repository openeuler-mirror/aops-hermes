<script lang="ts" setup>
function toHelp() {
  window.open('https://docs.openeuler.org/zh/docs/22.03_LTS_SP2/docs/A-Ops/overview.html')
}
</script>

<template>
  <div class="footer">
    <div>
      <a target="_blank" @click="toHelp">帮助</a>
    </div>
    <div class="copyright">
      版权所有 © 2023 openEuler 保留一切权利
    </div>
    <a-space>
      <img class="openeuler-logo" src="@/assets/imgs/openeuler_logo.png" alt="openeuler-logo">
      <img src="@/assets/imgs/openeuler.png" class="openeuler" alt="openeuler">
    </a-space>
  </div>
</template>

<style lang="less" scoped>
a {
  color: var(--text-color);
  user-select: none;
}

.openeuler-logo {
  height: 20px
}
.openeuler {
  height: 20px;
  filter:var(--openeuler-logo-filter)
}

.footer {
  color: var(--text-color);
  user-select: none;
}
</style>
