<script setup lang="ts">
const tableColunms = [
  {
    dataIndex: 'order',
    title: '排名',
    align: 'center',
  },
  {
    title: '主机组名称',
    dataIndex: 'domain',
    align: 'center',
  },
  {
    title: '告警数',
    dataIndex: 'count',
    align: 'center',
  },
]
</script>

<template>
  <a-row style="margin-bottom: 10px">
    <span>共获取到 0 条告警信息</span>
  </a-row>
  <a-table :columns="tableColunms" />
</template>

<style scoped></style>
