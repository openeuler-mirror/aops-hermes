<script lang="ts" setup>
import { computed, h, onMounted, reactive, ref } from 'vue'
import {
  CloseOutlined,
  ExclamationCircleOutlined,
  PlusOutlined,
  RedoOutlined,
} from '@ant-design/icons-vue'
import { Modal, message } from 'ant-design-vue'
import type { TableColumnsType, TableProps } from 'ant-design-vue'
import type { SorterResult, TablePaginationConfig } from 'ant-design-vue/es/table/interface'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import AddHostGroupModal from './components/AddHostGroupModal.vue'
import HostTable from './components/HostTable.vue'
import type { HostGroupTableItem } from '@/api/paths/assests'
import PageWrapper from '@/components/PageWrapper.vue'

import { api } from '@/api'
import type { Direction } from '@/api/paths/types'
import { useAccountStore, useClusterStore } from '@/store'

type orderType = 'ascend' | 'descend'
const orderMap: Record<orderType, 'asc' | 'desc'> = {
  ascend: 'asc',
  descend: 'desc',
}

const { t } = useI18n()

const { permissions } = storeToRefs(useClusterStore())

const { accountRole } = storeToRefs(useAccountStore())
const clusters = computed(() => permissions.value.map(i => ({ cluster_name: i.cluster_name, cluster_id: i.cluster_id })))

// #region ----------------------------------------< host group table >----------------------------------------
const hostGroupTableColumn = computed<TableColumnsType>(() => [
  {
    key: 'host_group_id',
    title: t('assests.hostGroup'),
    dataIndex: 'host_group_id',
    customRender: ({ record }) => {
      return record.host_group_name
    },
  },
  {
    key: 'description',
    title: t('assests.description'),
    dataIndex: 'description',
  },
  {
    key: 'host_count',
    title: t('assests.hostCount'),
    dataIndex: 'host_count',
    sorter: true,
  },
  {
    key: 'cluster_name',
    title: t('assests.cluster'),
    dataIndex: 'cluster_name',
    filters: permissions.value.map(i => ({ text: i.cluster_name, value: i.cluster_id })),
  },
  {
    key: 'operation',
    title: t('common.operation'),
    dataIndex: 'operation',
    width: '25%',
    align: 'center',
  },
])

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

const hostGroupTableData = ref<HostGroupTableItem[]>([])

/**
 * query host groups
 * @param sort
 * @param order
 * @param clusterIds
 */
async function queryHostGroups(sort?: string, order?: Direction, clusterIds?: string[]) {
  tableState.loading = true
  const [, res] = await api.getHostGroups({
    page: pagination.current,
    per_page: pagination.pageSize,
    sort,
    direction: order,
    cluster_ids: clusterIds,
  })
  if (res) {
    hostGroupTableData.value = res.host_group_infos
    pagination.total = res.total_count
  }
  tableState.loading = false
  tableState.selectedRowKeys = []
}

/**
 * re request when conditions changed
 * @param page
 * @param filters
 * @param sorter
 */
const handleTableChange: TableProps<HostGroupTableItem>['onChange'] = (
  page,
  filters,
  sorter: SorterResult<HostGroupTableItem>,
) => {
  page.current && (pagination.current = page.current)
  page.pageSize && (pagination.pageSize = page.pageSize)

  const params = {
    sort: sorter.column ? (sorter.columnKey as string) : undefined,
    order: sorter.order ? orderMap[sorter.order] : undefined,
    clusterIds: filters.cluster_name ? filters.cluster_name : undefined,
  }
  queryHostGroups(params.sort, params.order, params.clusterIds as string[] | undefined)
}

/**
 * delete host group with host group name
 * distribution interface
 * @param hostGroupId
 */
async function deleteHostGroup(hostGroupId: string): Promise<string> {
  const { host_group_id, cluster_id } = hostGroupTableData.value.find(
    item => hostGroupId === item.host_group_id,
  )!
  const params: Record<string, { group_id: string }> = {}
  params[cluster_id] = { group_id: host_group_id }
  const [_] = await api.deleteHostGroup(hostGroupId, params)
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (_)
        return reject(new Error(t('common.fail')))
      else return resolve(t('common.succeed'))
    }, 2000)
  })
}

/**
 * handle delete host group event
 * @param hostGroup
 */
async function handleDelete(hostGroup: HostGroupTableItem): Promise<void> {
  if (hostGroup.host_count > 0) {
    Modal.warning({
      title: t('assests.sentence.hasHosts'),
      okText: t('common.confirm'),
    })
    return
  }
  Modal.confirm({
    title: t('assests.sentence.hostGroupDeleteConfirm'),
    icon: h(ExclamationCircleOutlined),
    content: `${hostGroup.host_group_name}`,
    okType: 'danger',
    okText: t('common.delete'),
    onOk: async () => {
      try {
        const res = await deleteHostGroup(hostGroup.host_group_id)
        if (res) {
          message.success(res)
          refresh()
        }
      } catch (error) {
        message.error(error as any)
      }
    },
  })
}

async function handleAddGroupSuccess() {
  await queryHostGroups()
}

function refresh() {
  pagination.total = 0
  pagination.current = 1
  pagination.pageSize = 10
  queryHostGroups()
}
// #endregion

// #region ----------------------------------------< hosts in group drawer >----------------------------------------
const hostDrawerVisible = ref(false)
const currentSlectedGroup = ref<string>('')

function handleDrawerOpen(group: string) {
  currentSlectedGroup.value = group
  hostDrawerVisible.value = true
}

// #endregion
onMounted(() => {
  queryHostGroups()
})
</script>

<template>
  <PageWrapper>
    <a-card>
      <a-row type="flex" justify="space-between" align="middle">
        <a-col>
          {{ `${t('assests.hostGroupTotal', { count: pagination.total })}` }}
        </a-col>
        <a-col>
          <a-row type="flex" :gutter="8">
            <a-col>
              <!-- <a-button @click="refresh">重置条件</a-button> -->
            </a-col>
          </a-row>
        </a-col>
        <a-col>
          <a-row :gutter="16">
            <a-col v-if="accountRole === 'administrator'">
              <AddHostGroupModal :clusters="clusters" @success="handleAddGroupSuccess">
                <template #button>
                  <a-button type="primary">
                    <PlusOutlined />{{ t('assests.addHostGroup') }}
                  </a-button>
                </template>
              </AddHostGroupModal>
            </a-col>
            <a-col>
              <a-button :icon="h(RedoOutlined)" @click="refresh">
                {{ t('common.refresh') }}
              </a-button>
            </a-col>
          </a-row>
        </a-col>
      </a-row>
      <a-table
        row-key="host_group_id"
        :columns="hostGroupTableColumn"
        :pagination="pagination"
        :loading="tableState.loading"
        :data-source="hostGroupTableData"
        @change="handleTableChange"
      >
        <template #bodyCell="{ record, column }">
          <template v-if="column.dataIndex === 'operation'">
            <template v-if="accountRole === 'administrator'">
              <a @click="handleDelete(record)">{{ t('common.delete') }}</a>
              <a-divider type="vertical" />
            </template>

            <a @click="handleDrawerOpen(record.host_group_id)">{{ t('assests.hostInGroup') }}</a>
          </template>
        </template>
      </a-table>
    </a-card>
    <a-drawer
      v-model:open="hostDrawerVisible"
      :title="t('assests.ownHost')"
      :width="720"
      placement="right"
      :closable="false"
      destroy-on-close
    >
      <template #extra>
        <CloseOutlined @click="hostDrawerVisible = false" />
      </template>
      <HostTable :host-group="currentSlectedGroup" />
    </a-drawer>
  </PageWrapper>
</template>

<style lang="less" scoped>
.operation {
  line-height: 100%;
}
</style>
