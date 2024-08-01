<script setup lang="ts">
import { QuestionCircleOutlined } from '@ant-design/icons-vue'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import AlarmsTable from './AlarmsTable.vue'
import Drawer from '@/components/Drawer.vue'

const { t } = useI18n()

const tableColunms = computed(() => [
  {
    dataIndex: 'order',
    title: t('dashboard.alerts.rank'),
    align: 'center',
  },
  {
    title: t('dashboard.alerts.hostGroupName'),
    dataIndex: 'domain',
    align: 'center',
  },
  {
    title: t('dashboard.alerts.alertsCount'),
    dataIndex: 'count',
    align: 'center',
  },
])
const isDrawerVisible = ref(false)
</script>

<template>
  <a-card style="margin-top: 0" class="alarm-statisics">
    <a-row type="flex" align="middle">
      <h3>{{ $t('dashboard.alerts.statistics') }}</h3>
      <a-tooltip placement="bottomLeft">
        <template #title>
          <span>{{ $t('dashboard.alerts.tips.alertTable') }}</span>
        </template>
        <QuestionCircleOutlined style="transform: translate(5px, -3px)" />
      </a-tooltip>
    </a-row>
    <a-table class="table" size="small" :columns="tableColunms" />
    <Drawer v-model:visible="isDrawerVisible" :title="$t('dashboard.alertsTable.title')">
      <template #trigger>
        <div class="more" @click="isDrawerVisible = true">
          {{ $t('dashboard.alerts.loadMore') }}
        </div>
      </template>
      <template #content>
        <AlarmsTable />
      </template>
    </Drawer>
  </a-card>
</template>

<style lang="less" scoped>
.table {
  width: 70%;
}
.alarm-statisics {
  position: relative;
}
.more {
  position: absolute;
  top: 0;
  right: 0;
  height: 100%;
  width: 40px;
  color: #fff;
  background: #0e41c3;
  line-height: 40px;
  writing-mode: vertical-lr;
  letter-spacing: 0.8em;
  text-align: center;
  border-radius: 0 8px 8px 0;
  cursor: pointer;
  &:hover {
    background: #1d4cb3;
  }
}
</style>
