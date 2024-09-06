<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { isDark, toggleDark } from '@/composables/dark'
import actions from '@/actions'

function changeTheme(e: MouseEvent) {
  toggleDark(e)
  actions.setGlobalState({ theme: isDark.value ? 'light' : 'dark' })
}
</script>

<template>
  <button class="button" @click="changeTheme">
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
  font-size: 16px;
  width: 30px;
  height: 30px;
  display: grid;
  place-content: center;
  place-items: center;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.5s ease;
  &:hover {
    background-color: var(--bg-hover);
  }
}
</style>

