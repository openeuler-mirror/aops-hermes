<script lang="ts" setup>
import { computed, h, onMounted, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import type { TablePaginationConfig } from 'ant-design-vue'
import { message } from 'ant-design-vue'
import { PlusOutlined, QuestionCircleOutlined, RedoOutlined } from '@ant-design/icons-vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import DomainConfContent from './components/DomainConfContent.vue'
import DomainConfLog from './components/DomainConfLog.vue'
import EditConfigDrawer from './components/EditConfigDrawer.vue'
import AddNewConfig from './components/AddNewConfig.vue'
import Drawer from '@/components/Drawer.vue'
import type { ConfFile, HostInDomain } from '@/api'
import { api } from '@/api'
import PageWrapper from '@/components/PageWrapper.vue'
import { useAccountStore } from '@/store'

const { t } = useI18n()
const { userInfo } = storeToRefs(useAccountStore())

const route = useRoute()
const domainConfig = reactive<{
  domainId: string
  domainName: string
  clusterId: string
  isSelectDomainModalVisible: boolean
}>({
  domainId: (route.params.domainId as string) || '',
  domainName: (route.params.domainName as string) || '',
  clusterId: (route.params.clusterId as string) || '',
  isSelectDomainModalVisible: false,
})

const domainConfs = ref<ConfFile[]>([])

const domainConfsColumns = computed(() => [
  {
    key: 'filePath',
    dataIndex: 'filePath',
    title: t('conftrace.domainConf.file'),
  },
  {
    dataIndex: 'contents',
    title: t('conftrace.domainConf.detail'),
    width: 200,
  },
  {
    dataIndex: 'operation',
    title: t('common.operation'),
    width: 340,
    align: 'center',
  },
])

const domainConfState = reactive<{
  selectedRowKeys: string[]
  loading: boolean
}>({
  selectedRowKeys: [],
  loading: false,
})

const pagination = reactive({
  total: 0,
  current: 1,
  pageSize: 10,
  showTotal: (total: number) => t('common.total', { count: total }),
  showSizeChanger: true,
  pageSizeOptions: ['10', '20', '30', '40'],
})

async function queryDomainConf() {
  domainConfState.loading = true
  const [, res] = await api.getDomainManagementConf(domainConfig.domainName)
  if (res) {
    domainConfs.value = res.confFiles
    pagination.total = res.confFiles.length
  } else {
    domainConfs.value = []
    pagination.total = 0
  }

  domainConfState.loading = false
}

const domainHosts = ref<HostInDomain[]>([])
async function queryHostsInDomain() {
  const [, res] = await api.getHostsInDomain({ domainName: domainConfig.domainName })
  if (res) domainHosts.value = res.hostlist
}

/**
 * select one of cves include this cve's all rpms
 */
function onSelect(record: ConfFile, selected: boolean) {
  if (selected) {
    domainConfState.selectedRowKeys.push(record.filePath)
  } else {
    domainConfState.selectedRowKeys = domainConfState.selectedRowKeys.filter(item => item !== record.filePath)
  }
}

/**
 * select all cve include every cve's all rpms
 */
function onSelectAll(_selected: boolean, selectedRows: ConfFile[]) {
  domainConfState.selectedRowKeys = selectedRows.map(item => item.filePath)
}

/**
 * refresh the domain conf table data
 */
function refresh(msg?: string) {
  domainConfState.selectedRowKeys = []
  setTimeout(() => {
    if (msg) message.success(msg)

    queryDomainConf()
  }, 1000)
}

async function confirmDelete(record: ConfFile) {
  const params = {}
  params[domainConfig.clusterId] = {
    domainName: domainConfig.domainName,
    confFiles: [{ filePath: record.filePath }],
  }
  const [, res] = await api.deleteDomainConfig(params)
  if (res && res[domainConfig.clusterId].label === 'Succeed') {
    message.success(t('common.succeed'))
    refresh()
  } else {
    message.error(t('common.fail'))
  }
}

async function deleteBatch() {
  if (domainConfState.selectedRowKeys.length === 0) {
    message.info(t('conftrace.domainConf.message.noFile'))
    return
  }

  const params = {}
  params[domainConfig.clusterId] = {
    domainName: domainConfig.domainName,
    confFiles: domainConfState.selectedRowKeys.map(item => ({ filePath: item })),
  }
  const [, res] = await api.deleteDomainConfig(params)
  if (res && res[domainConfig.clusterId].label === 'Succeed') {
    message.success(t('common.succeed'))
    refresh()
  } else {
    message.error(t('common.fail'))
  }
}

function handleTableChange(page: TablePaginationConfig) {
  page.current && (pagination.current = page.current)
  page.pageSize && (pagination.pageSize = page.pageSize)
}

const isEditingDrawerVisible = ref(false)
const isConfContentDrawerVisible = ref(false)
const isConfChangeLogVisible = ref(false)

const currentConfContent = ref<ConfFile>()

onMounted(() => {
  const domainName = route.params.domainName as string
  if (domainName === '$noDomain') {
    domainConfig.isSelectDomainModalVisible = true
    return
  }
  queryDomainConf()
  queryHostsInDomain()
})
</script>

<template>
  <PageWrapper>
    <a-card>
      <a-row type="flex" justify="space-between">
        <a-col>
          <h1 class="card-title">
            {{ `${domainConfig.domainName}` }}
          </h1>
          <span>{{ t('conftrace.domainConf.confCount', { count: domainConfs.length }) }}</span>
        </a-col>
        <a-col v-show="domainConfState.selectedRowKeys.length > 0">
          <a-alert type="info" show-icon class="delete-alert">
            <template #message>
              <span
                >{{ t('common.selectItems', { count: domainConfState.selectedRowKeys.length }) }}
                <a @click="deleteBatch">{{ $t('conftrace.domainConf.batchDelete') }}</a>
                <a-divider type="vertical" />
                <a @click="domainConfState.selectedRowKeys = []">{{ $t('common.clear') }}</a>
              </span>
            </template>
          </a-alert>
        </a-col>
        <a-col>
          <a-space>
            <Drawer
              v-if="userInfo?.type === 'administrator'"
              v-model:visible="isEditingDrawerVisible"
              :title="$t('conftrace.domainConf.addConf')"
            >
              <template #trigger>
                <a-button type="primary" :icon="h(PlusOutlined)" @click="isEditingDrawerVisible = true">
                  {{ $t('conftrace.domainConf.addConf') }}
                </a-button>
              </template>
              <template #content>
                <AddNewConfig
                  :domain-name="domainConfig.domainName"
                  :host-list="domainHosts"
                  :cluster-id="domainConfig.clusterId"
                  type="add"
                  @cancel="isEditingDrawerVisible = false"
                  @success="((isEditingDrawerVisible = false), refresh())"
                />
              </template>
            </Drawer>
            <a-button :icon="h(RedoOutlined)" @click="refresh()">
              {{ $t('common.refresh') }}
            </a-button>
          </a-space>
        </a-col>
      </a-row>
      <a-table
        row-key="filePath"
        :columns="domainConfsColumns"
        :data-source="domainConfs"
        :loading="domainConfState.loading"
        :pagination="pagination"
        :row-selection="{
          selectedRowKeys: domainConfState.selectedRowKeys,
          onSelect,
          onSelectAll,
        }"
        @change="handleTableChange"
      >
        <template #bodyCell="{ record, column }">
          <template v-if="column.dataIndex === 'contents'">
            <a-popover :title="$t('conftrace.domainConf.detail')">
              <template #content>
                <div style="width: 350px; word-break: break-all">
                  {{ record.contents }}
                </div>
              </template>
              <div class="domian-conf-contents">
                {{ record.contents }}
              </div>
            </a-popover>
          </template>
          <template v-if="column.dataIndex === 'operation'">
            <a @click="((currentConfContent = record), (isConfContentDrawerVisible = true))">{{
              $t('conftrace.domainConf.view')
            }}</a>
            <a-divider type="vertical" />
            <a @click="((currentConfContent = record), (isConfChangeLogVisible = true))">{{
              $t('conftrace.domainConf.changeLog')
            }}</a>
            <template v-if="userInfo?.type === 'administrator'">
              <a-divider type="vertical" />
              <EditConfigDrawer
                type="edit"
                :domain-name="domainConfig.domainName"
                :host-list="domainHosts"
                :file-path="record.filePath"
                :cluster-id="domainConfig.clusterId"
                @success="refresh()"
              >
                <template #trigger>
                  <a>{{ $t('conftrace.domainConf.editConf') }}</a>
                </template>
              </EditConfigDrawer>
              <a-divider type="vertical" />
              <a-popconfirm
                :title="$t('conftrace.domainConf.deleteConfirm')"
                :ok-text="t('common.confirm')"
                :cancel-text="t('common.cancel')"
                @confirm="confirmDelete(record)"
              >
                <template #icon>
                  <QuestionCircleOutlined style="color: red" />
                </template>
                <a>{{ $t('common.delete') }}</a>
              </a-popconfirm>
            </template>
          </template>
        </template>
      </a-table>
    </a-card>
    <Drawer v-model:visible="isConfContentDrawerVisible" :title="$t('conftrace.domainConf.confContent')">
      <template #content>
        <DomainConfContent :config-content="currentConfContent" />
      </template>
    </Drawer>
    <Drawer v-model:visible="isConfChangeLogVisible" :title="$t('conftrace.domainConf.changeLog')" :width="1100">
      <template #content>
        <DomainConfLog
          :domain-name="domainConfig.domainName"
          :conf-file="currentConfContent"
          :cluster-id="domainConfig.clusterId"
        />
      </template>
    </Drawer>
  </PageWrapper>
</template>

<style lang="less" scoped>
.card-title {
  display: inline-block;
  margin-right: 10px;
}
.domain-conf-title {
  display: inline-block;
  font-size: 20px;
  margin: 0 5px 0 0;
}
.domian-conf-contents {
  width: 400px;
  text-overflow: -o-ellipsis-lastline;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
}
</style>
