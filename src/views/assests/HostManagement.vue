<script lang="ts" setup>
import { computed, h, onMounted, reactive, ref } from 'vue'
import { Modal, message } from 'ant-design-vue'
import { ExclamationCircleOutlined, PlusOutlined, RedoOutlined } from '@ant-design/icons-vue'
import type { TablePaginationConfig } from 'ant-design-vue'
import type { SorterResult } from 'ant-design-vue/es/table/interface'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { orderMap } from '../vulnerability/config'
import AddmoreHostModal from './components/AddMoreHostModal.vue'
import { api } from '@/api'
import type { HostsTableItem, QueryHostsParams, Scene } from '@/api/paths/assests'
import PageWrapper from '@/components/PageWrapper.vue'
import type { Direction, DistributionParams } from '@/api/paths/types'
import { useAccountStore, useClusterStore } from '@/store'

const { t } = useI18n()

const [modal, contextHolder] = Modal.useModal()
const sceneMap: Scene = {
  big_data: t('assests.bigData'),
  web: t('assests.web'),
  edge: t('assests.edge'),
  cloud: t('assests.cloud'),
  normal: t('assests.normal'),
}

const statusMap = computed<Record<number, string>>(() => ({
  0: t('assests.online'),
  1: t('assests.offline'),
  2: t('assests.unknown'),
}))

const { permissions } = storeToRefs(useClusterStore())

const { accountRole } = storeToRefs(useAccountStore())

// #region ----------------------------------------< host table >----------------------------------------
const hostTableData = ref<HostsTableItem[]>([])
const searchKey = ref<string>()
const filterMap = reactive<{
  host_group_name: string[]
  management?: boolean
  cluster_list?: string[]
}>({
  host_group_name: [],
})

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
  showTotal: (total: number) => `${t('common.total', { count: total })}`,
  showSizeChanger: true,
  pageSizeOptions: ['10', '20', '30', '40'],
})

const tableState = reactive<{
  selectedRowKeys: string[]
  loading: boolean
}>({
  selectedRowKeys: [],
  loading: false,
})

// hosts table colums
const hostsTableColums = computed(() => {
  const arr = [
    {
      key: 'host_name',
      title: t('assests.hostName'),
      dataIndex: 'host_name',
      sorter: true,
    },
    {
      title: t('assests.ip'),
      dataIndex: 'host_ip',
    },
    {
      title: t('assests.cluster'),
      dataIndex: 'cluster_name',
      filters: permissions.value?.map(({ cluster_id, cluster_name }) => ({
        text: cluster_name,
        value: cluster_id,
      })),
    },
    {
      title: t('assests.hostGroup'),
      dataIndex: 'host_group_name',
      filters: permissions.value.filter((item) => {
        if (!filterMap.cluster_list || filterMap.cluster_list?.length === 0)
          return item
        else
          return filterMap.cluster_list?.includes(item.cluster_id)
      }).map(({ cluster_id, cluster_name, host_groups }) => {
        return {
          text: cluster_name,
          value: cluster_id,
          children: host_groups.map(h => ({ text: h.host_group_name, value: h.host_group_id })),
        }
      }),
      filterMode: 'tree',
      filterSearch: true,
    },
    {
      title: t('assests.management'),
      dataIndex: 'management',
      filters: [
        {
          text: t('common.yes'),
          value: true,
        },
        {
          text: t('common.no'),
          value: false,
        },
      ],
      filterMultiple: false,
    },
    {
      title: t('assests.status'),
      dataIndex: 'status',
    },
    {
      title: t('assests.scenes'),
      dataIndex: 'scene',
    },

  ]
  if (accountRole.value === 'administrator') {
    arr.push({
      title: t('common.operation'),
      dataIndex: 'operation',
    })
  }
  return arr
})

/**
 * query host list
 */
async function queryHosts(searchKey?: string) {
  tableState.loading = true
  const params: QueryHostsParams = {
    page: pagination.current,
    per_page: pagination.pageSize,
    sort: sorterMap.sortKey,
    direction: sorterMap.order,
    host_group_list: filterMap.host_group_name,
    search_key: searchKey,
    management: filterMap.management,
    cluster_list: filterMap.cluster_list,
  }
  const [_, res] = await api.getHosts(params)
  if (!res)
    return
  const { host_infos, total_count } = res
  hostTableData.value = host_infos

  pagination.total = total_count
  tableState.selectedRowKeys = []
  tableState.loading = false
  await queryHostStatus()
}

function handleTableChange(page: TablePaginationConfig, filters: Record<string, string[] | null>, sorter: SorterResult<HostsTableItem>) {
  page.current && (pagination.current = page.current)
  page.pageSize && (pagination.pageSize = page.pageSize)
  sorterMap.sortKey = sorter.column && (sorter.columnKey as string)
  sorterMap.order = sorter.order ? orderMap[sorter.order] : undefined
  filterMap.host_group_name = filters.host_group_name ? filters.host_group_name : []
  filterMap.management = filters.management ? Boolean(filters.management[0]) : undefined
  filterMap.cluster_list = filters.cluster_name ? filters.cluster_name : undefined
  queryHosts()
}
/** filter host table data with search key */
function onSearch(searchValue: string) {
  searchValue ? queryHosts(searchValue) : queryHosts()
}
/**
 * handle delete host event
 */
function handleDelete(record: HostsTableItem) {
  const { host_id, host_name } = record
  modal.confirm({
    title: t('assests.sentence.deleteConfim'),
    icon: h(ExclamationCircleOutlined),
    content: `${host_name}`,
    okType: 'danger',
    okText: t('common.delete'),
    async onOk() {
      try {
        await deleteHost(host_id)
        message.success(t('common.succeed'))
        queryHosts()
      }
      catch {
        message.error(t('common.fail'))
      }
    },
    onCancel() {},
  })
}

/**
 * delete hosts with host id
 */
async function deleteHost(hostId: string) {
  const host = hostTableData.value.find(item => hostId === item.host_id)!
  const params: DistributionParams<{ host_id: string }> = {}
  params[host.cluster_id] = { host_id: host.host_id }

  const [_, res] = await api.deleteHost(hostId, params)

  if (res) {
    return new Promise((resolve, reject) => {
      if (Object.values(res)[0].label !== 'Succeed') {
        setTimeout(() => {
          queryHosts()
          reject(new Error('failed'))
        }, 2000)
      }
      else {
        setTimeout(() => {
          queryHosts()
          resolve('succeed')
        }, 2000)
      }
    })
  }
}

function refresh() {
  searchKey.value = ''
  filterMap.host_group_name = []
  filterMap.management = undefined
  filterMap.cluster_list = undefined
  pagination.total = 0
  pagination.current = 1
  pagination.pageSize = 10
  queryHosts()
}
/**
 * query hosts status by host id
 */
async function queryHostStatus() {
  if (hostTableData.value.length === 0)
    return
  const params: DistributionParams<{ host_ids: string[] }> = {}
  hostTableData.value.forEach(({ cluster_id, host_id }) => {
    if (params[cluster_id])
      params[cluster_id].host_ids.push(host_id)
    else
      params[cluster_id] = { host_ids: [host_id] }
  })
  const [, res] = await api.getHostsStatus(params)
  if (res) {
    Object.keys(res).reduce((acc: { host_id: string, status: number }[], key) => {
      return acc.concat(...res[key].data)
    }, []).forEach((item) => {
      const table = hostTableData.value.find(t => t.host_id === item.host_id)
      if (table)
        table.status = item.status
    })
  }
}
// #endregion

onMounted(() => {
  queryHosts()
})
</script>

<template>
  <PageWrapper>
    <a-card>
      <a-row> {{ t('assests.hostsTotal', { count: pagination.total }) }} </a-row>
      <a-row type="flex" justify="space-between">
        <a-col>
          <a-row type="flex" :gutter="8">
            <a-col>
              <a-input-search
                v-model:value="searchKey"
                :maxlength="40"
                :placeholder="t('assests.searchBy')"
                @search="onSearch"
              />
            </a-col>
          </a-row>
        </a-col>
        <a-row type="flex" :gutter="16">
          <template v-if="accountRole === 'administrator'">
            <a-col>
              <router-link to="/assests/hosts/host-create">
                <a-button type="primary" :icon="h(PlusOutlined)">
                  {{ t('assests.addHost') }}
                </a-button>
              </router-link>
            </a-col>
            <a-col>
              <AddmoreHostModal @success="refresh">
                <template #trigger>
                  <a-button type="primary">
                    {{ t('assests.addHostBatch') }}
                  </a-button>
                </template>
              </AddmoreHostModal>
            </a-col>
          </template>
          <a-col>
            <a-button :icon="h(RedoOutlined)" @click="refresh">
              {{ t('common.refresh') }}
            </a-button>
          </a-col>
        </a-row>
      </a-row>
      <a-table
        row-key="host_id"
        :columns="hostsTableColums"
        :data-source="hostTableData"
        :loading="tableState.loading"
        :pagination="pagination"
        @change="handleTableChange"
      >
        <template #bodyCell="{ record, column }">
          <template v-if="column.dataIndex === 'host_name'">
            <router-link :to="`/assests/hosts/host-detail/${record.host_id}`">
              {{
                record.host_name
              }}
            </router-link>
          </template>
          <template v-if="column.dataIndex === 'management'">
            {{ record.management ? t('common.yes') : t('common.no') }}
          </template>
          <template v-if="column.dataIndex === 'status'">
            <a-spin v-if="!statusMap[record.status]" size="small" />
            <span v-else>{{ statusMap[record.status] }}</span>
          </template>
          <template v-if="column.dataIndex === 'scene'">
            {{ sceneMap[record.scene] || t("common.none") }}
          </template>
          <template v-if="column.dataIndex === 'operation'">
            <a-row :gutter="8" class="operation">
              <a-col>
                <router-link
                  :to="{
                    path: `/assests/hosts/host-edit`,
                    query: { hostId: record.host_id, pageType: 'edit' },
                  }"
                >
                  {{ t('common.edit') }}
                </router-link>
              </a-col>
              <a-col @click="handleDelete(record)">
                {{ t('common.delete') }}
              </a-col>
            </a-row>
          </template>
        </template>
      </a-table>
    </a-card>
    <contextHolder />
  </PageWrapper>
</template>

<style lang="less" scoped>
.operation {
  color: #1677ff;
  * {
    cursor: pointer;
    user-select: none;
  }
}
</style>
