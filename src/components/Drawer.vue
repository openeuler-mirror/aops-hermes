<script lang="ts" setup>
import { CloseOutlined } from '@ant-design/icons-vue'
import { ref } from 'vue'

withDefaults(
  defineProps<{
    width?: number
    title?: string
  }>(),
  {
    width: 700,
  },
)

const visible = ref(false)

function open() {
  visible.value = true
}
</script>

<template>
  <span @click="open">
    <slot name="trigger" />
  </span>
  <a-drawer v-model:open="visible" :title="title" :width="width" :closable="false" destroy-on-close>
    <template #extra>
      <CloseOutlined style="cursor: pointer" @click="visible = false" />
    </template>
    <slot name="content" />
  </a-drawer>
</template>
