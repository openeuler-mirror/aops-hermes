<script lang="ts" setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { TableColumnProps, TablePaginationConfig } from 'ant-design-vue'

import PageWrapper from '@/components/PageWrapper.vue'
import Drawer from '@/components/Drawer.vue'
import CurrentConf from './components/CurrentConf.vue'
import { api, ConfChangeRecord, ConfFile, Direction } from '@/api'
import { SorterResult } from 'ant-design-vue/es/table/interface'
import { orderMap } from '../vulnerability/config'

const { t } = useI18n()

const tableColumns = computed<TableColumnProps[]>(() => [
  {
    dataIndex: 'host_ip',
    title: t('common.hostIp'),
  },
  {
    dataIndex: 'cluster_name',
    title: t('conftrace.domain.cluster'),
  },
  {
    dataIndex: 'domain_name',
    title: t('conftrace.domain.domainName'),
  },
  {
    dataIndex: 'create_time',
    title: t('conftrace.domain.updateTime'),
    sorter: true,
  },
  {
    dataIndex: 'conf_change_record',
    title: t('conftrace.domain.changeRecord'),
  },
])
const sorterMap = reactive<{
  sortKey: string | undefined
  order: Direction | undefined
}>({
  sortKey: undefined,
  order: undefined,
})

const pagination = reactive<TablePaginationConfig>({
  total: 0,
  current: 1,
  pageSize: 10,
  showTotal: (total: number) => t('common.total', { count: total }),
  showSizeChanger: true,
  pageSizeOptions: ['10', '20', '30', '40'],
})

const changeRecords = ref<ConfChangeRecord[]>([])
const tableLoading = ref(false)
const searchKey = ref()

async function getConfChangeLogs() {
  tableLoading.value = true
  const [, res] = await api.queryChangeRecord({
    page: pagination.current,
    per_page: pagination.pageSize,
    host_ip: searchKey.value || undefined,
    sort: sorterMap.sortKey,
    direction: sorterMap.order,
  })
  if (res) {
    changeRecords.value = res.conf_change_records
    pagination.total = res.total_count
  }
  tableLoading.value = false
}

/**
 * @param page
 */
const handleTableChange = (page: TablePaginationConfig, filters, sorter: SorterResult<ConfChangeRecord>) => {
  page.current && (pagination.current = page.current)
  page.pageSize && (pagination.pageSize = page.pageSize)
  sorterMap.sortKey = sorter.column && (sorter.column.dataIndex as string)
  sorterMap.order = sorter.order ? orderMap[sorter.order] : undefined
  getConfChangeLogs()
}

const isCurrentConfVisible = ref(false)
const selectedRow = ref<ConfChangeRecord>()
const managementConf = ref<ConfFile[]>([])

function selectRecord(record: ConfChangeRecord) {
  selectedRow.value = record
  isCurrentConfVisible.value = true
  if (selectedRow.value) {
    queryManagementConf(selectedRow.value.domain_name)
  }
}

async function queryManagementConf(domainName: string) {
  const [, res] = await api.getDomainManagementConf(domainName)
  if (res) managementConf.value = res.confFiles
}
onMounted(() => {
  getConfChangeLogs()
})
</script>

<template>
  <PageWrapper>
    <a-card>
      <!-- <a-row type="flex" justify="space-between">
        <a-col>
          <a-input-search
            v-model:value="searchKey"
            :placeholder="t('conftrace.domainDetail.sentence.enterHostIp')"
            style="width: 200px"
            @search="getConfChangeLogs"
          />
        </a-col>
      </a-row> -->
      <a-table
        :columns="tableColumns"
        :data-source="changeRecords"
        :loading="tableLoading"
        :pagination="pagination"
        @change="handleTableChange"
      >
        <template #bodyCell="{ record, column }">
          <template v-if="column.dataIndex === 'host_ip'">
            <a @click="selectRecord(record)">{{ record.host_ip }}</a>
          </template>
        </template>
      </a-table>
    </a-card>
  </PageWrapper>

  <Drawer v-model:visible="isCurrentConfVisible">
    <template #content>
      <CurrentConf
        :host-id="selectedRow!.host_id"
        :host-ip="selectedRow!.host_ip"
        :default-conf="managementConf"
        :domain-name="selectedRow!.domain_name"
        :cluster-id="selectedRow!.cluster_id"
      />
    </template>
    <template #footer>
      <a-row type="flex" justify="end">
        <a-button @click="isCurrentConfVisible = false">
          {{ $t('common.close') }}
        </a-button>
      </a-row>
    </template>
  </Drawer>
</template>
