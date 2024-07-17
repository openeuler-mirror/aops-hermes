<script lang="ts" setup>
import { h, onMounted, reactive, ref } from 'vue'
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
import { DOMAN_STATUS_ENUM, DOMAN_STATUS_LABEL_ENUM } from './constants'
import AddHostModal from './components/AddHostModal.vue'
import CurrentConf from './components/CurrentConf.vue'
import DomainSyncStatus from './components/DomainSyncStatus.vue'
import PageWrapper from '@/components/PageWrapper.vue'
import { api } from '@/api'
import type { ConfFile, HostInDomain } from '@/api'
import Drawer from '@/components/Drawer.vue'
import { useAccountStore } from '@/store'

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

const domainHostColumns = [
  {
    dataIndex: 'ip',
    title: 'IP地址',
  },
  {
    dataIndex: 'ipv6',
    title: 'IP协议',
  },
  {
    dataIndex: 'syncStatus',
    title: '同步状态',
    align: 'center',
  },
  {
    dataIndex: 'operation',
    title: '操作',
    width: 300,
    align: 'center',
  },
]

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
  if (res)
    domainDetail.domainHosts = res

  domainHostState.loading = false
  queryHostSyncStatus()
}

/**
 * select one of cves include this cve's all rpms
 */
function onSelect(record: HostInDomain, selected: boolean) {
  if (selected) {
    domainHostState.selectedRowKeys.push(record.hostId)
  }
  else {
    domainHostState.selectedRowKeys = domainHostState.selectedRowKeys.filter(
      item => item !== record.hostId,
    )
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
  const [,res] = await api.deleteDomainHosts(params)
  if (res && res[domainDetail.clusterId].label === 'Succeed') {
    message.success('删除成功')
    refresh()
  }

  else { message.error('删除失败') }
}

const isStatusLoaidng = ref(false)

async function queryHostSyncStatus() {
  const [, res] = await api.getDomainSyncStatus({
    domainName: domainDetail.domainName,
  })
  if (res) {
    domainDetail.domainHosts.forEach((d) => {
      const item = res.find(s => s.host_id === d.hostId)
      if (item)
        d.syncStatus = item.sync_status === 0 ? 'NOT SYNCHRONIZE' : 'SYNCHRONIZED'
      else
        d.syncStatus = 'NOT FOUND'
    })
  }
  else {
    domainDetail.domainHosts.forEach((d) => {
      d.syncStatus = 'NOT FOUND'
    })
  }
}

const managementConf = ref<ConfFile[]>([])

async function queryManagementConf() {
  const [, res] = await api.getDomainManagementConf(domainDetail.domainName)
  if (res)
    managementConf.value = res.confFiles
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
    title: `你确定要将当前业务域的配置同步到已选主机吗？`,
    icon: h(ExclamationCircleOutlined),
    content: `同步后配置将无法恢复，但可从配置日志中查看记录,你还要继续吗?`,
    okType: 'danger',
    okText: '继续同步',
    onOk: async () => {
      try {
        const params = {}
        params[domainDetail.clusterId] = {
          domainName: domainDetail.domainName,
          hostIds: domainHostState.selectedRowKeys,
        }
        const [_, res] = await api.syncConfsBatchly(params)
        if (res && res[domainDetail.clusterId].label === 'Succeed')
          message.success('同步成功')
        else
          message.error('同步失败')
      }
      catch (error) {
        message.error(error as any)
      }
    },
  })
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
          <span class="domain-detail-title">{{ `业务域${domainDetail.domainName}` }}</span>
          <span>共获取到{{ domainDetail.domainHosts.length }}条主机信息</span>
        </a-col>
        <a-col v-show="domainHostState.selectedRowKeys.length > 0">
          <a-alert type="info" show-icon class="delete-alert">
            <template #message>
              <span>{{ `已选择${domainHostState.selectedRowKeys.length}项` }}</span>
            </template>
          </a-alert>
        </a-col>
        <a-col>
          <a-space>
            <AddHostModal v-if="userInfo?.type === 'administrator'" :host-list="domainDetail.domainHosts" :domain-name="domainDetail.domainName" @success="queryHostsInDomain">
              <template #trigger>
                <a-button type="primary" :icon="h(PlusOutlined)">
                  添加主机
                </a-button>
              </template>
            </AddHostModal>

            <a-button :icon="h(ReloadOutlined)" :disabled="!domainHostState.selectedRowKeys.length" @click="handleSyncALl">
              批量同步
            </a-button>
            <a-button :icon="h(RedoOutlined)" @click="refresh">
              刷新
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
            <a @click="currentConfHostInfo = record; isCurrentConfVisible = true"> 当前配置 </a>
            <a-divider type="vertical" />
            <a @click="showSyncStatus(record)"> 状态详情 </a>
            <template v-if="userInfo?.type === 'administrator'">
              <a-divider type="vertical" />
              <a-popconfirm
                title="你确定删除该主机吗?"
                ok-text="确认"
                cancel-text="取消"
                @confirm="handleDelete(record)"
              >
                <template #icon>
                  <QuestionCircleOutlined style="color: red" />
                </template>
                <a>删除</a>
              </a-popconfirm>
            </template>
          </template>
          <template v-if="column.dataIndex === 'syncStatus'">
            <a-spin v-if="!record.syncStatus" size="small" />
            <a-space v-else>
              <CheckCircleTwoTone
                v-if="record.syncStatus === DOMAN_STATUS_ENUM.sync"
                style="font-size: 16px"
                two-tone-color="#52c41a"
              />
              <CloseCircleTwoTone
                v-else-if="record.syncStatus === DOMAN_STATUS_ENUM.notSync"
                style="font-size: 16px"
                two-tone-color="#ff0000"
              />
              <QuestionCircleOutlined v-else style="font-size: 16px" />
              {{ DOMAN_STATUS_LABEL_ENUM[record.syncStatus] || '未知状态' }}
              <span v-if="record.syncStatus.notSyncCount > 0">{{ record.syncStatus.notSyncCount }}条</span>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>
  </PageWrapper>

  <Drawer v-model:visible="isCurrentConfVisible">
    <template #content>
      <CurrentConf :host-info="currentConfHostInfo" :default-conf="managementConf" :domain-name="domainDetail.domainName" :cluster-id="domainDetail.clusterId" />
    </template>
    <template #footer>
      <a-row type="flex" justify="end">
        <a-button @click="isCurrentConfVisible = false">
          关闭
        </a-button>
      </a-row>
    </template>
  </Drawer>

  <Drawer v-model:visible="isSyncStatusVisible" title="状态详情">
    <template #content>
      <DomainSyncStatus
        :sync-host="selectedSyncHost"
        :cluster-id="domainDetail.clusterId"
        :domain-name="domainDetail.domainName"
        :is-status-loading="isStatusLoaidng"
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
