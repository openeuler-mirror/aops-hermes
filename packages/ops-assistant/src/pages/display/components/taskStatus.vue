<script setup lang="ts">
import { ElIcon } from 'element-plus'
import { SuccessFilled, CircleCloseFilled, Loading, QuestionFilled } from '@element-plus/icons-vue'

defineProps<{
  status?: {
    succeed: number
    fail: number
    running: number
    unknown: number
  }
}>()
</script>
<template>
  <div v-if="status" class="flex items-center gap-[18px]">
    <div class="status-item">
      <el-icon :size="18"><SuccessFilled color="#52c41a" /></el-icon>{{ status.succeed }}
    </div>
    <div class="status-item">
      <el-icon :size="18"><CircleCloseFilled color="#ff0000" /></el-icon>{{ status.fail }}
    </div>
    <div class="status-item">
      <el-icon :size="18" :class="{ 'is-loading': status.running }"><Loading /></el-icon>{{ status.running }}
    </div>
    <div class="status-item">
      <el-icon :size="18"><QuestionFilled /></el-icon>{{ status.unknown }}
    </div>
  </div>
</template>
<style scoped>
.status-item {
  display: flex;
  align-items: center;
  gap: 2px;
}
</style>
