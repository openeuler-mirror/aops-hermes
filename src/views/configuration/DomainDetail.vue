<script lang="ts" setup>
import { h, onMounted, reactive } from 'vue'
import {
  CheckCircleTwoTone,
  CloseCircleTwoTone,
  PlusOutlined,
  QuestionCircleOutlined,
  RedoOutlined,
  ReloadOutlined,
} from '@ant-design/icons-vue'
import { useRoute } from 'vue-router'
import { DOMAN_STATUS_ENUM, DOMAN_STATUS_LABEL_ENUM } from './constants'
import PageWrapper from '@/components/PageWrapper.vue'
import { api } from '@/api'
import type { HostInDomain } from '@/api'
import Drawer from '@/components/Drawer.vue'

const route = useRoute()

const domainDetail = reactive<{
  domainName: string
  domainHosts: HostInDomain[]
}>({
  domainName: '',
  domainHosts: [],
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
  },
  {
    dataIndex: 'operation',
    title: '操作',
    width: 300,
    align: 'center',
  },
]

const domainHostState = reactive<{
  selectedRowKeys: number[]
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

onMounted(() => {
  domainDetail.domainName = (route.params.domainId as string) ?? ''
  queryHostsInDomain()
})
</script>

<template>
  <PageWrapper>
    <a-card>
      <span class="domain-detail-title">{{ `业务域${domainDetail.domainName}` }}</span>
      <span>共获取到{{ domainDetail.domainHosts.length }}条主机信息</span>
      <a-row type="flex" justify="end">
        <a-col v-show="domainHostState.selectedRowKeys.length > 0" :pull="5">
          <a-alert type="info" show-icon class="delete-alert">
            <template #message>
              <span>{{ `已选择${domainHostState.selectedRowKeys.length}项` }}</span>
            </template>
          </a-alert>
        </a-col>
        <a-col>
          <a-space>
            <a-button type="primary" :icon="h(PlusOutlined)">
              添加主机
            </a-button>
            <a-button :icon="h(ReloadOutlined)" :disabled="!domainHostState.selectedRowKeys.length">
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
            <Drawer>
              <template #trigger>
                <a> 当前配置 </a>
              </template>
              <template #content />
            </Drawer>

            <a-divider type="vertical" />
            <a> 状态详情 </a>
            <a-divider type="vertical" />
            <a> 删除 </a>
          </template>
          <template v-if="column.dataIndex === 'syncStatus'">
            <a-space>
              <CheckCircleTwoTone
                v-if="record.syncStatus === DOMAN_STATUS_ENUM.sync"
                style="font-size: 16px"
                two-tone-color="#52c41a"
              />
              <CloseCircleTwoTone
                v-else-if="record.syncStatus === DOMAN_STATUS_ENUM.notSync"
                style="font-size: 16px"
                two-tone-color="#eb2f96"
              />
              <QuestionCircleOutlined v-else style="font-size: 16px" />
              {{ DOMAN_STATUS_LABEL_ENUM[record.syncStatus] || '未知状态' }}
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>
  </PageWrapper>
</template>

<style lang="less" scoped>
.domain-detail-title {
  font-weight: bold;
  font-size: 22px;
  margin: 0 5px 0 0;
}
</style>
