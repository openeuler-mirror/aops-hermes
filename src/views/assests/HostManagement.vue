<script lang="ts" setup>
import { computed, h, onMounted, reactive, ref } from 'vue'
import { Modal, message } from 'ant-design-vue'
import { ExclamationCircleOutlined, PlusOutlined, RedoOutlined } from '@ant-design/icons-vue'
import type { TablePaginationConfig } from 'ant-design-vue'
import type { SorterResult } from 'ant-design-vue/es/table/interface'
import { storeToRefs } from 'pinia'
import { orderMap } from '../vulnerability/config'
import AddmoreHostModal from './components/AddMoreHostModal.vue'
import { api } from '@/api'
import type { HostsTableItem, QueryHostsParams, Scene } from '@/api/paths/assests'
import PageWrapper from '@/components/PageWrapper.vue'
import type { Direction, DistributionParams } from '@/api/paths/types'
import { useAccountStore, useClusterStore } from '@/store'

const [modal, contextHolder] = Modal.useModal()
const sceneMap: Scene = {
  big_data: '大数据',
  web: 'web服务',
  edge: '边缘设备',
  cloud: '云服务',
  normal: '通用',
}

const statusMap: Record<number, string> = {
  0: '在线',
  1: '离线',
  2: '未确认',
  3: '在线',
  4: '在线',
  5: '未知',
}

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
  showTotal: (total: number) => `总计 ${total} 项`,
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
      title: '主机名称',
      dataIndex: 'host_name',
      sorter: true,
    },
    {
      title: 'IP地址',
      dataIndex: 'host_ip',
    },
    {
      title: '集群',
      dataIndex: 'cluster_name',
      filters: permissions.value?.map(({ cluster_id, cluster_name }) => ({
        text: cluster_name,
        value: cluster_id,
      })),
    },
    {
      title: '所属主机组',
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
      title: '管理节点',
      dataIndex: 'management',
      filters: [
        {
          text: '是',
          value: true,
        },
        {
          text: '否',
          value: false,
        },
      ],
      filterMultiple: false,
    },
    {
      title: '运行状态',
      dataIndex: 'status',
    },
    {
      title: '场景',
      dataIndex: 'scene',
    },

  ]
  if (accountRole.value === 'administrator') {
    arr.push({
      title: '操作',
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
    title: `删除后无法恢复,请确认删除以下主机`,
    icon: h(ExclamationCircleOutlined),
    content: `${host_name}`,
    okType: 'danger',
    okText: '删除',
    async onOk() {
      try {
        await deleteHost(host_id)
        message.success('删除成功')
        queryHosts()
      }
      catch (err) {
        message.error('删除失败')
      }
    },
    onCancel() {},
  })
}
/**
 * handle delete host batch
 * @param hostIds
 */
function deleteHostBash(hostIds: string[]) {
  const hostNameList = hostTableData.value.filter(item => hostIds.includes(item.host_id))
  modal.confirm({
    title: `删除后无法恢复,请确认删除以下主机`,
    icon: h(ExclamationCircleOutlined),
    content: () => {
      return hostNameList.map(row => `${row.host_name}`).join(',')
    },
    okType: 'danger',
    okText: '删除',
    async onOk() {
      try {
        await deleteHosts(hostIds)
      }
      catch (error) {}
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

/**
 * delete hosts with host id
 * @param hostIds
 */
async function deleteHosts(hostIds: string[]) {
  const hosts = hostTableData.value.filter(item => hostIds.includes(item.host_id))
  const params: DistributionParams<{ host_ids: string[] }> = {}
  hosts.forEach(({ cluster_id, host_id }) => {
    if (!params[cluster_id])
      params[cluster_id] = { host_ids: [host_id] }
    else
      params[cluster_id].host_ids.push(host_id)
  })
  const [, res] = await api.deleteHosts(params)
  if (res) {
    if (Object.values(res)[0].label !== 'Succeed')
      message.error('删除失败')
    queryHosts()

    return
  }
  message.success('删除成功')
  queryHosts()
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
      <a-row> {{ `共获取到${pagination.total}条主机信息 ` }} </a-row>
      <a-row type="flex" justify="space-between">
        <a-col>
          <a-row type="flex" :gutter="8">
            <a-col>
              <a-input-search
                v-model:value="searchKey"
                :maxlength="40"
                placeholder="按主机或IP搜索"
                @search="onSearch"
              />
            </a-col>
            <a-col v-show="tableState.selectedRowKeys.length">
              <a-alert type="info" show-icon class="delete-alert">
                <template #message>
                  <span>{{ `已选择${tableState.selectedRowKeys.length}项` }}</span>
                  <a @click="deleteHostBash(tableState.selectedRowKeys)"> 批量删除 </a>
                </template>
              </a-alert>
            </a-col>
          </a-row>
        </a-col>
        <a-row type="flex" :gutter="16">
          <template v-if="accountRole === 'administrator'">
            <a-col>
              <router-link to="/assests/hosts/host-create">
                <a-button type="primary" :icon="h(PlusOutlined)">
                  添加主机
                </a-button>
              </router-link>
            </a-col>
            <a-col>
              <AddmoreHostModal @success="refresh">
                <template #trigger>
                  <a-button type="primary">
                    批量添加主机
                  </a-button>
                </template>
              </AddmoreHostModal>
            </a-col>
          </template>
          <a-col>
            <a-button :icon="h(RedoOutlined)" @click="refresh">
              刷新
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
            {{ record.management ? '是' : '否' }}
          </template>
          <template v-if="column.dataIndex === 'status'">
            <a-spin v-if="!statusMap[record.status]" size="small" />
            <span v-else>{{ statusMap[record.status] }}</span>
          </template>
          <template v-if="column.dataIndex === 'scene'">
            {{ sceneMap[record.scene] || '暂无' }}
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
                  编辑
                </router-link>
              </a-col>
              <a-col @click="handleDelete(record)">
                删除
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
HostGroupInfo,
