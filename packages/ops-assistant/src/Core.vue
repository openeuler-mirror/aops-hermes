<script setup lang="ts">
import { ref, shallowRef } from 'vue'
import Display from './pages/display/Display.vue'
import Chat from './pages/chat/Chat.vue'
import { Icon } from '@iconify/vue'

const emits = defineEmits<{
  (e: 'changePage', page: string, content?: string, pluginList?: string[]): void
}>()

const { displayRef, chatRef, containerRef, leftStyle, rightStyle, proportion, updatePaneStyles, startResize } =
  useScanDrag()

function useScanDrag() {
  const proportion = ref(1)
  const displayRef = shallowRef<HTMLDivElement | null>(null)
  const chatRef = shallowRef<HTMLDivElement | null>(null)
  const containerRef = shallowRef<HTMLDivElement | null>(null)

  const leftStyle: any = ref({})
  const rightStyle: any = ref({})

  function updatePaneStyles(newRatio: any) {
    leftStyle.value = { width: `calc(${newRatio * 100}% - 5px)` }
    rightStyle.value = { width: `calc(${(1 - newRatio) * 100}% - 5px)` }
  }

  function startResize(e: MouseEvent) {
    chatRef.value?.classList.add('select-none')
    displayRef.value?.classList.add('select-none')

    const containerWidth = containerRef.value!.clientWidth
    const rect = containerRef.value!.getBoundingClientRect()
    const initX = rect.left

    if (containerRef.value) {
      containerRef.value.style.cursor = 'ew-resize'
    }
    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault()
      const moveScale = (e.clientX - initX) / containerWidth
      const newRatio = moveScale
      if (newRatio > 0.05 && newRatio < 0.95) {
        proportion.value = newRatio
        updatePaneStyles(newRatio)
      }
    }

    const handleMouseUp = (e: MouseEvent) => {
      if (containerRef.value) {
        containerRef.value.style.cursor = 'auto'
      }

      chatRef.value?.classList.remove('select-none')
      displayRef.value?.classList.remove('select-none')
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  return {
    proportion,
    displayRef,
    chatRef,
    containerRef,
    leftStyle,
    rightStyle,
    updatePaneStyles,
    startResize,
  }
}

const isChatVisible = ref(true)
function handleVisible(visible: boolean) {
  isChatVisible.value = visible
  if (!visible) {
    updatePaneStyles(1)
  } else {
    updatePaneStyles(proportion.value)
  }
}

updatePaneStyles(1)

function onDisPlayChange(pageKey: string) {
  if (!pageKey) {
    emits('changePage', pageKey)
  }
}
</script>
<template>
  <div ref="containerRef" class="flex h-full w-full relative">
    <div ref="displayRef" class="min-w-[800px]" :style="leftStyle">
      <Display class="h-full" @change="onDisPlayChange"></Display>
    </div>
    <div class="w-[2px] bg-[var(--ops-divider-color)] cursor-ew-resize" @mousedown="startResize" />
    <div
      ref="chatRef"
      class="flex-1"
      :class="{ 'min-w-[600px]': isChatVisible }"
      :style="rightStyle"
      v-if="isChatVisible"
    >
      <Chat class="h-full" @change-visible="handleVisible"></Chat>
    </div>
    <div
      v-show="!isChatVisible"
      class="absolute right-[10px] bottom-[10%] z-10 w-[50px] h-[50px] bg-[var(--ops-divider-color)] rounded-full cursor-pointer flex justify-center items-center hover:bg-[var(--bg-hover)]"
      @click="handleVisible(true)"
    >
      <Icon class="w-[24px] h-[24px]" icon="material-symbols:assistant-rounded" />
    </div>
  </div>
</template>
<style scoped>
.select-none {
  user-select: none;
}
</style>
