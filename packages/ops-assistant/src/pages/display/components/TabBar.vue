<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { Icon } from '@iconify/vue'

export interface Tab {
  key: string
  title: string
  flowId?: string
}

defineProps<{
  activeKey?: string
  tabList: Tab[]
}>()

const emits = defineEmits<{
  (e: 'change', key: Tab): void
  (e: 'close', key: string): void
}>()

const barRef = ref<HTMLElement | null>(null)

const barWidth = ref(0)

const resizeObserver = new ResizeObserver(entries => {
  barWidth.value = barRef.value?.clientWidth || 0
})

onMounted(() => {
  if (!barRef.value) return
  resizeObserver.observe(barRef.value)
})

onBeforeUnmount(() => {
  if (!barRef.value) return
  resizeObserver.unobserve(barRef.value!)
})
</script>
<template>
  <div class="w-full h-[36px] items-center">
    <ul ref="barRef" class="flex h-full items-start">
      <li
        class="w-full h-full flex items-start justify-start"
        :style="{ width: `${barWidth / 8}px` }"
        v-for="item in tabList"
        :key="item.key"
        @click="emits('change', item)"
      >
        <div class="tab-item" :class="{ 'tab-item--active': activeKey === item.key }">
          <div
            class="flex w-full rounded-[4px] pl-[16px] py-[8px] relative"
            :class="{
              'hover:bg-[var(--ops-tabbar-bg--active)]': activeKey !== item.key,
              'tab-item': activeKey !== item.key,
            }"
          >
            <div class="w-[85%] whitespace-nowrap text-ellipsis overflow-hidden">{{ item.title }}</div>
            <div
              @click.stop="emits('close', item.key)"
              class="absolute flex items-center right-[8px] hover:bg-[var(--ops-bg-color--secondary)]"
            >
              <Icon class="w-[16px] h-[16px] text-[#8d98aa]" icon="material-symbols:close-rounded" />
            </div>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>
<style scoped lang="less">
.tab-item {
  width: 96%;
  height: 94%;
  background-color: var(--ops-tabbar-bg);
  color: var(--ops-text-color__base);
  display: flex;
  align-items: center;
}
.tab-item--active {
  background-color: var(--ops-tabbar-bg--active);
  height: 100%;
  width: 100%;
}
</style>
