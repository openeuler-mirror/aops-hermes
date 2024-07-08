<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { isDark, toggleDark } from '@/composables/dark'
</script>

<template>
  <button class="button" @click="toggleDark">
    <Icon v-if="isDark" icon="carbon-moon" />
    <Icon v-else icon="carbon-sun" />
  </button>
</template>

<style lang="less" scoped>
.button {
  outline: 2px solid transparent !important;
  outline-offset: 2px !important;
  border: none;
  background: transparent;
  cursor: pointer;
}
</style>
