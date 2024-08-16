<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'

const { t } = useI18n()
const tableColunms = computed(() => [
  {
    dataIndex: 'order',
    title: t('dashboard.alerts.rank'),
    align: 'center',
  },
  {
    title: t('dashboard.alerts.alertsCount'),
    dataIndex: 'domain',
    align: 'center',
  },
  {
    title: t('dashboard.alerts.hostGroupName'),
    dataIndex: 'count',
    align: 'center',
  },
])
</script>

<template>
  <a-row style="margin-bottom: 10px">
    <span>{{ $t('dashboard.alerts.total', { total: 0 }) }}</span>
  </a-row>
  <a-table :columns="tableColunms" />
</template>

<style scoped></style>
