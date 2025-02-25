<script setup lang="ts">
import { ElSkeleton } from 'element-plus'
</script>
<template>
  <div>
    <span class="text-[20px] font-semibold">AI分析数据中....</span>
    <el-skeleton class="mt-[30px]" :rows="12" animated />
  </div>
</template>
<style scoped></style>
