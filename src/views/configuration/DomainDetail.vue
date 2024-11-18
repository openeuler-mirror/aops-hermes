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
import { Modal, message } from 'ant-design-vue'
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
  const [, res] = await api.getHostsInDomain(domainDetail.domainName)
  if (res) domainDetail.domainHosts = res

  domainHostState.loading = false
  queryHostSyncStatus()
}

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

async function queryHostSyncStatus() {
  const [, res] = await api.getDomainSyncStatus({
    domainName: domainDetail.domainName,
  })
  if (res) {
    domainDetail.domainHosts.forEach(d => {
      const item = res.find(s => s.host_id === d.hostId)
      if (item) d.syncStatus = item.sync_status === 0 ? 'NOT SYNCHRONIZE' : 'SYNCHRONIZED'
      else d.syncStatus = 'NOT FOUND'
    })
  } else {
    domainDetail.domainHosts.forEach(d => {
      d.syncStatus = 'NOT FOUND'
    })
  }
}

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
      <a-row type="flex" justify="space-between">
        <a-col>
          <span class="domain-detail-title">{{ `${domainDetail.domainName}` }}</span>
          <span>{{ t('conftrace.domainDetail.hosts', { count: domainDetail.domainHosts.length }) }}</span>
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
        :pagination="false"
        :row-selection="{
          selectedRowKeys: domainHostState.selectedRowKeys,
          onSelect,
          onSelectAll,
        }"
      >
        <template #bodyCell="{ record, column }">
          <template v-if="column.dataIndex === 'operation'">
            <a @click="handleConfClick(record)">
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
            <a-spin v-if="!record.syncStatus" size="small" />
            <a-space v-else>
              <CheckCircleTwoTone
                v-if="record.syncStatus === DOMAIN_STATUS_ENUM.sync"
                style="font-size: 16px"
                two-tone-color="#52c41a"
              />
              <CloseCircleTwoTone
                v-else-if="record.syncStatus === DOMAIN_STATUS_ENUM.notSync"
                style="font-size: 16px"
                two-tone-color="#ff0000"
              />
              <QuestionCircleOutlined v-else style="font-size: 16px" />
              {{
                record.syncStatus
                  ? t(`conftrace.domainDetail.${DOMAIN_STATUS_LABEL_ENUM[record.syncStatus]}`)
                  : t('conftrace.domainDetail.unknownStatus')
              }}
              <span v-if="record.syncStatus.notSyncCount > 0">{{ record.syncStatus.notSyncCount }}</span>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>
  </PageWrapper>

  <Drawer v-model:visible="isCurrentConfVisible">
    <template #content>
      <CurrentConf
        :host-info="currentConfHostInfo"
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
        @success="queryHostSyncStatus"
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
