<script lang="ts" setup>
import { CloseOutlined } from '@ant-design/icons-vue'

withDefaults(
  defineProps<{
    visible: boolean
    width?: number
    title?: string
  }>(),
  { width: 700 },
)

defineEmits(['update:visible'])
</script>

<template>
  <span>
    <slot name="trigger" />
  </span>
  <a-drawer :open="visible" :title="title" :width="width" :closable="false" destroy-on-close @close="$emit('update:visible', false)">
    <template #extra>
      <CloseOutlined style="cursor: pointer" @click="$emit('update:visible', false)" />
    </template>
    <slot name="content" />
    <template v-if="Object.keys($slots).includes('footer')" #footer>
      <slot name="footer" />
    </template>
  </a-drawer>
</template>
