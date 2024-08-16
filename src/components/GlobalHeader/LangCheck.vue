<script setup lang='ts'>
import { Icon } from '@iconify/vue'
import { storeToRefs } from 'pinia'
import { useLangStore } from '@/store'

const { lang } = storeToRefs(useLangStore())
const { setLang } = useLangStore()

function onClick(e: PointerEvent) {
  let val = lang.value === 'en' ? 'zh_cn' : 'en'
  if (e.target)
    val = (e.target as SVGElement).getAttribute('data-lang') || val
  setLang(val)
}
</script>

<template>
  <div class="icon" @click="onClick">
    <Icon v-if="lang === 'en'" data-lang="zh_cn" class="icon-inner" icon="ri:english-input" />
    <span v-else style="font-size: 14px;">中文</span>
  </div>
</template>

<style lang="less" scoped>
.icon {
  width: 32px;
  height: 32px;
  display: grid;
  place-content: center;
  place-items: center;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.5s ease;
  user-select: none;
  &:hover {
    background-color: var(--bg-hover )
  }
  &-inner {
    font-size: 16px;
  }
}
</style>
