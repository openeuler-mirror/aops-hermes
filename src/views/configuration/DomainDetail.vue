<script lang="ts" setup>
import { computed, h, onMounted, reactive, ref } from 'vue'
import {
  CheckCircleTwoTone,
  CloseCircleTwoTone,
  ExclamationCircleOutlined,
  PlusOutlined,
  QuestionCircleOutlined,
  RedoOutlined,
  ReloadOutlined,
} from '@ant-design/icons-vue'
import { useRoute } from 'vue-router'
import { Modal, TableProps, message } from 'ant-design-vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { DOMAIN_STATUS_ENUM, DOMAIN_STATUS_LABEL_ENUM } from './constants'
import AddHostModal from './components/AddHostModal.vue'
import CurrentConf from './components/CurrentConf.vue'
import DomainSyncStatus from './components/DomainSyncStatus.vue'
import PageWrapper from '@/components/PageWrapper.vue'
import { api } from '@/api'
import type { ConfFile, HostInDomain } from '@/api'
import Drawer from '@/components/Drawer.vue'
import { useAccountStore } from '@/store'
import type { TablePaginationConfig } from 'ant-design-vue/es/table/interface'

const { t } = useI18n()
const route = useRoute()
const { userInfo } = storeToRefs(useAccountStore())

const domainDetail = reactive<{
  domainId: string
  domainName: string
  clusterId: string
  domainHosts: HostInDomain[]
}>({
  domainId: '',
  domainName: '',
  domainHosts: [],
  clusterId: '',
})

const domainHostColumns = computed(() => [
  {
    dataIndex: 'ip',
    title: t('conftrace.domainDetail.ip'),
  },
  {
    dataIndex: 'ipv6',
    title: t('conftrace.domainDetail.ipProtocol'),
  },
  {
    dataIndex: 'syncStatus',
    title: t('conftrace.domainDetail.syncStatus'),
    align: 'center',
  },
  {
    dataIndex: 'operation',
    title: t('common.operation'),
    width: 300,
    align: 'center',
  },
])

const searchKey = ref()

const pagination = reactive<TablePaginationConfig>({
  total: 0,
  current: 1,
  pageSize: 10,
  showTotal: (total: number) => `${t('common.total', { count: total })}`,
  showSizeChanger: true,
  pageSizeOptions: ['10', '20', '30', '40'],
})

const domainHostState = reactive<{
  selectedRowKeys: string[]
  loading: boolean
  isConfDrawerVisible: boolean
}>({
  selectedRowKeys: [],
  loading: false,
  isConfDrawerVisible: false,
})

async function queryHostsInDomain() {
  domainHostState.loading = true
  const [, res] = await api.getHostsInDomain({
    domainName: domainDetail.domainName,
    hostIp: searchKey.value || undefined,
    page: pagination.current,
    per_page: pagination.pageSize,
  })
  if (res) {
    domainDetail.domainHosts = res.hostlist
    // domainDetail.domainHosts = []
    pagination.total = res.total_count
  }
  domainHostState.loading = false
}

/**
 * re request when conditions changed
 * @param page
 * @param filters
 * @param sorter
 */
const handleTableChange: TableProps<HostInDomain>['onChange'] = page => {
  page.current && (pagination.current = page.current)
  page.pageSize && (pagination.pageSize = page.pageSize)

  queryHostsInDomain()
}

/**
 * select one of cves include this cve's all rpms
 */
function onSelect(record: HostInDomain, selected: boolean) {
  if (selected) {
    domainHostState.selectedRowKeys.push(record.hostId)
  } else {
    domainHostState.selectedRowKeys = domainHostState.selectedRowKeys.filter(item => item !== record.hostId)
  }
}

/**
 * select all cve include every cve's all rpms
 */
function onSelectAll(_selected: boolean, selectedRows: HostInDomain[]) {
  domainHostState.selectedRowKeys = selectedRows.map(item => item.hostId)
}

function refresh() {
  domainHostState.selectedRowKeys = []
  queryHostsInDomain()
}

async function handleDelete(record: HostInDomain) {
  const params = {}
  params[domainDetail.clusterId] = { domainName: domainDetail.domainName, hostInfos: [{ hostId: record.hostId }] }
  const [, res] = await api.deleteDomainHosts(params)
  if (res && res[domainDetail.clusterId].label === 'Succeed') {
    message.success(t('common.succeed'))
    refresh()
  } else {
    message.error(t('common.fail'))
  }
}

const isStatusLoading = ref(false)

const managementConf = ref<ConfFile[]>([])

async function queryManagementConf() {
  const [, res] = await api.getDomainManagementConf(domainDetail.domainName)
  if (res) managementConf.value = res.confFiles
}

const isCurrentConfVisible = ref(false)
const currentConfHostInfo = ref<HostInDomain>()

const isSyncStatusVisible = ref(false)

const selectedSyncHost = ref<HostInDomain>()
function showSyncStatus(host: HostInDomain) {
  isSyncStatusVisible.value = true
  selectedSyncHost.value = host
}

async function handleSyncALl() {
  Modal.confirm({
    title: t('conftrace.domainDetail.sentence.syncConfirmTitle'),
    icon: h(ExclamationCircleOutlined),
    content: t('conftrace.domainDetail.sentence.syncConfirmContent'),
    okType: 'danger',
    okText: t('conftrace.domainDetail.sentence.syncGoon'),
    onOk: async () => {
      try {
        const params = {}
        params[domainDetail.clusterId] = {
          domainName: domainDetail.domainName,
          hostIds: domainHostState.selectedRowKeys,
        }
        const [, res] = await api.syncConfsBatchly(params)
        if (res && res[domainDetail.clusterId].label === 'Succeed')
          message.success(t('conftrace.domainDetail.message.syncSucceed'))
        else message.error(t('conftrace.domainDetail.message.syncFailed'))
      } catch (error) {
        message.error(error as any)
      }
    },
  })
}

function handleConfClick(record: HostInDomain) {
  currentConfHostInfo.value = record
  isCurrentConfVisible.value = true
}

onMounted(() => {
  domainDetail.domainId = (route.params.domainId as string) ?? ''
  domainDetail.domainName = (route.params.domainName as string) ?? ''
  domainDetail.clusterId = (route.params.clusterId as string) ?? ''
  queryHostsInDomain()
  queryManagementConf()
})
</script>

<template>
  <PageWrapper>
    <a-card>
      <a-row>
        <span class="domain-detail-title">{{ `${domainDetail.domainName}` }}</span>
      </a-row>
      <a-row type="flex" justify="space-between">
        <a-col>
          <a-input-search
            v-model:value="searchKey"
            :placeholder="t('conftrace.domainDetail.sentence.enterHostIp')"
            style="width: 200px"
            @search="queryHostsInDomain"
          />
        </a-col>
        <a-col v-show="domainHostState.selectedRowKeys.length > 0">
          <a-alert type="info" show-icon class="delete-alert">
            <template #message>
              <span>{{ t('common.selectItems', { count: domainHostState.selectedRowKeys.length }) }}</span>
            </template>
          </a-alert>
        </a-col>
        <a-col>
          <a-space>
            <AddHostModal
              v-if="userInfo?.type === 'administrator'"
              :host-list="domainDetail.domainHosts"
              :domain-name="domainDetail.domainName"
              @success="queryHostsInDomain"
            >
              <template #trigger>
                <a-button type="primary" :icon="h(PlusOutlined)">
                  {{ $t('assests.addHost') }}
                </a-button>
              </template>
            </AddHostModal>

            <a-button
              :icon="h(ReloadOutlined)"
              :disabled="!domainHostState.selectedRowKeys.length"
              @click="handleSyncALl"
            >
              {{ $t('conftrace.domainDetail.batchSync') }}
            </a-button>
            <a-button :icon="h(RedoOutlined)" @click="refresh">
              {{ $t('common.refresh') }}
            </a-button>
          </a-space>
        </a-col>
      </a-row>

      <a-table
        row-key="hostId"
        :columns="domainHostColumns"
        :data-source="domainDetail.domainHosts"
        :loading="domainHostState.loading"
        :pagination="pagination"
        :row-selection="{
          selectedRowKeys: domainHostState.selectedRowKeys,
          onSelect,
          onSelectAll,
        }"
        @change="handleTableChange"
      >
        <template #bodyCell="{ record, column }">
          <template v-if="column.dataIndex === 'operation'">
            <a @click="((currentConfHostInfo = record), (isCurrentConfVisible = true))">
              {{ $t('conftrace.domainDetail.currentConf') }}
            </a>
            <a-divider type="vertical" />
            <a @click="showSyncStatus(record)"> {{ $t('conftrace.domainDetail.statusDetail') }} </a>
            <template v-if="userInfo?.type === 'administrator'">
              <a-divider type="vertical" />
              <a-popconfirm
                :title="$t('conftrace.domainDetail.sentence.deleteConfirm')"
                :ok-text="t('common.confirm')"
                :cancel-text="t('common.cancel')"
                @confirm="handleDelete(record)"
              >
                <template #icon>
                  <QuestionCircleOutlined style="color: red" />
                </template>
                <a>{{ $t('common.delete') }}</a>
              </a-popconfirm>
            </template>
          </template>
          <template v-if="column.dataIndex === 'syncStatus'">
            <a-spin v-if="!record.sync_status && record.sync_status !== 0" size="small" />
            <a-space v-else>
              <CheckCircleTwoTone
                v-if="record.sync_status === DOMAIN_STATUS_ENUM.sync"
                style="font-size: 16px"
                two-tone-color="#52c41a"
              />
              <CloseCircleTwoTone
                v-else-if="record.sync_status === DOMAIN_STATUS_ENUM.notSync"
                style="font-size: 16px"
                two-tone-color="#ff0000"
              />
              <QuestionCircleOutlined v-else style="font-size: 16px" />
              {{ t(`conftrace.domainDetail.${DOMAIN_STATUS_LABEL_ENUM[record.sync_status]}`) }}
              <!-- <span v-if="record.syncStatus.notSyncCount > 0">{{ record.syncStatus.notSyncCount }}</span> -->
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>
  </PageWrapper>

  <Drawer v-model:visible="isCurrentConfVisible">
    <template #content>
      <CurrentConf
        :host-id="currentConfHostInfo!.hostId"
        :host-ip="currentConfHostInfo!.ip"
        :default-conf="managementConf"
        :domain-name="domainDetail.domainName"
        :cluster-id="domainDetail.clusterId"
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

  <Drawer v-model:visible="isSyncStatusVisible" :title="$t('conftrace.domainDetail.statusDetail')">
    <template #content>
      <DomainSyncStatus
        :sync-host="selectedSyncHost"
        :cluster-id="domainDetail.clusterId"
        :domain-name="domainDetail.domainName"
        :is-status-loading="isStatusLoading"
      />
    </template>
  </Drawer>
</template>

<style lang="less" scoped>
.domain-detail-title {
  font-weight: bold;
  font-size: 22px;
  margin: 0 5px 0 0;
}
</style>
