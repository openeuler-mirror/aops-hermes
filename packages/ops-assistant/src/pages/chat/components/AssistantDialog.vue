<script setup lang="ts">
import { computed } from 'vue'
import marked from '@aops-assistant/utils/marked'
import { onHtmlEventDispatch } from '@aops-assistant/utils/global'

const props = defineProps<{
  content: string
  isGenerating: boolean
}>()

const emits = defineEmits<{
  (e: 'innerOperateClick', exectueStr: string): void
}>()

const afterMarkedContent = computed(() => (props.content ? marked.parse(props.content) : ''))

window.onHtmlEventDispatch = onHtmlEventDispatch as any

function onInnerOperateClick(e: any) {
  const attr = (e.target.attributes as NamedNodeMap).getNamedItem('operate')
  const desc = (e.target.attributes as NamedNodeMap).getNamedItem('desc')
  if (!attr) return
  emits('innerOperateClick', desc ? desc.value : '')
}
</script>
<template>
  <div class="flex items-start mt-2">
    <img class="w-[42px] h-[42px] mr-[16px]" src="../../../images/robot.png" alt="" />
    <div
      class="content-container p-[24px] break-all min-h-[42px] box-border bg-[var(--ops-bg-color--panel)] rounded-r-[6px] rounded-bl-[6px]"
    >
      <div v-if="afterMarkedContent" v-html="afterMarkedContent" class="break-all"></div>
      <div class="loading flex items-center" v-else>
        <img class="loading-icon w-[20px]" src="../../../images/loading.png" alt="" />
        <span class="ml-1">正在生成回答...</span>
      </div>
      <div v-if="afterMarkedContent && !isGenerating" class="mt-[16px]" @click="onInnerOperateClick">
        <slot name="innerOperate"></slot>
      </div>
    </div>
  </div>
</template>
<style lang="less" scoped>
.content-container {
  width: calc(100% - 40px);
}

.loading {
  @keyframes rotate-img {
    from {
      transform: rotate(0);
    }

    to {
      transform: rotate(360deg);
    }
  }
  &-icon {
    animation: rotate-img 1s infinite linear;
  }
}
</style>
