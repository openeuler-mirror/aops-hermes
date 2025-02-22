<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { ElTooltip } from 'element-plus'

const emits = defineEmits<{
  (e: 'switch', key: string): void
}>()
</script>
<template>
  <div class="flex gap-2">
    <el-tooltip content="历史记录" placement="bottom">
      <div
        class="w-[28px] h-[28px] cursor-pointer hover:bg-[var(--bg-hover)] flex justify-center items-center rounded-md"
        @click="emits('switch', 'history')"
      >
        <Icon class="w-[16px] h-[16px]" icon="carbon:time" />
      </div>
    </el-tooltip>
  </div>
</template>
<style scoped></style>
