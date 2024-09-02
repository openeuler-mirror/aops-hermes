<script lang="ts" setup>
import type { ConfFile } from '@/api'

defineProps<{
  configContent?: ConfFile
}>()
</script>

<template>
  <a-descriptions v-if="configContent" :column="1" layout="horizontal">
    <a-descriptions-item :label="$t('conftrace.domainConf.file')">
      {{ configContent.filePath }}
    </a-descriptions-item>
    <a-descriptions-item>
      <div class="contentBox">
        <span class="diffContent">
          {{ configContent.contents }}
        </span>
      </div>
    </a-descriptions-item>
  </a-descriptions>
</template>

<style lang="less" scoped>
.contentBox {
  box-sizing: border-box;
  border: 1px solid #e8e8e8;
  overflow: auto;
  height: 400px;
  width: 100%;
  white-space: nowrap;
}
.diffContent {
  word-break: break-all;
  white-space: pre;
}
</style>
