<script lang="ts" setup>
import { h, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { TablePaginationConfig } from 'ant-design-vue'
import { message } from 'ant-design-vue'
import { PlusOutlined, QuestionCircleOutlined, RedoOutlined } from '@ant-design/icons-vue'
import type { SorterResult } from 'ant-design-vue/es/table/interface'
import { storeToRefs } from 'pinia'
import DomainSelectionModal from './components/DomainSelectionModal.vue'
import DomainConfContent from './components/DomainConfContent.vue'
import DomainConfLog from './components/DomainConfLog.vue'
import EditConfigDrawer from './components/EditConfigDrawer.vue'
import AddNewConfig from './components/AddNewConfig.vue'
import Drawer from '@/components/Drawer.vue'
import type { ConfFile, HostInDomain } from '@/api'
import { api } from '@/api'
import PageWrapper from '@/components/PageWrapper.vue'
import { useAccountStore } from '@/store'

const { userInfo } = storeToRefs(useAccountStore())

const route = useRoute()
const router = useRouter()
const domainConfig = reactive<{ domainId: string, domainName: string, clusterId: string, isSelectDomainModalVisible: boolean }>({
  domainId: (route.params.domainId as string) || '',
  domainName: (route.params.domainName as string) || '',
  clusterId: (route.params.clusterId as string) || '',
  isSelectDomainModalVisible: false,
})

function handleDomainSelectCancel() {
  domainConfig.isSelectDomainModalVisible = false
  message.warning('未选择业务域，返回管理列表页')
  router.push('/configuration/domain-management')
}

function handleDomainSelectOk(domainName: string) {
  domainConfig.isSelectDomainModalVisible = false
  domainConfig.domainName = domainName
  router.replace(`${domainName}`)
  queryDomainConf()
}

const domainConfs = ref<ConfFile[]>([])

const domainConfsColumns = [
  {
    key: 'filePath',
    dataIndex: 'filePath',
    title: '配置文件',
  },
  {
    dataIndex: 'contents',
    title: '配置详情 ',
    width: 200,
  },
  {
    dataIndex: 'operation',
    title: '操作',
    width: 340,
    align: 'center',
  },
]

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
  showTotal: (total: number) => `总计 ${total} 项`,
  showSizeChanger: true,
  pageSizeOptions: ['10', '20', '30', '40'],
})

async function queryDomainConf() {
  domainConfState.loading = true
  const [, res] = await api.getDomainManagementConf(domainConfig.domainName)
  if (res) {
    domainConfs.value = res.confFiles
    pagination.total = res.confFiles.length
  }
  else {
    domainConfs.value = []
    pagination.total = 0
  }

  domainConfState.loading = false
}

const domainHosts = ref<HostInDomain[]>([])
async function queryHostsInDomain() {
  const [, res] = await api.getHostsInDomain(domainConfig.domainName)
  if (res)
    domainHosts.value = res
}

/**
 * select one of cves include this cve's all rpms
 */
function onSelect(record: ConfFile, selected: boolean) {
  if (selected) {
    domainConfState.selectedRowKeys.push(record.filePath)
  }
  else {
    domainConfState.selectedRowKeys = domainConfState.selectedRowKeys.filter(
      item => item !== record.filePath,
    )
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
    if (msg)
      message.success(msg)

    queryDomainConf()
  }, 1000)
}

async function confirmDelete(record: ConfFile) {
  const params = {}
  params[domainConfig.clusterId] = {
    domainName: domainConfig.domainName,
    confFiles: [
      { filePath: record.filePath },
    ],
  }
  const [, res] = await api.deleteDomainConfig(params)
  if (res && res[domainConfig.clusterId].label === 'Succeed') {
    message.success('删除成功')
    refresh()
  }

  else { message.error('删除失败') }
}

async function deleteBatch() {
  if (domainConfState.selectedRowKeys.length === 0) {
    message.info('请选择要删除的配置文件')
    return
  }

  const params = {}
  params[domainConfig.clusterId] = {
    domainName: domainConfig.domainName,
    confFiles: domainConfState.selectedRowKeys.map(item => ({ filePath: item })),
  }
  const [, res] = await api.deleteDomainConfig(params)
  if (res && res[domainConfig.clusterId].label === 'Succeed') {
    message.success('删除成功')
    refresh()
  }

  else { message.error('删除失败') }
}

function handleTableChange(page: TablePaginationConfig, _filters: Record<string, string[] | null>, _sorter: SorterResult<ConfFile>) {
  page.current && (pagination.current = page.current)
  page.pageSize && (pagination.pageSize = page.pageSize)
}

const isEditingDrawerVisibale = ref(false)
const isConfContentDrawerVisibale = ref(false)
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
            {{ `${domainConfig.domainName}配置表` }}
          </h1>
          <span>共获取到{{ domainConfs.length }}条配置信息</span>
        </a-col>
        <a-col v-show="domainConfState.selectedRowKeys.length > 0">
          <a-alert type="info" show-icon class="delete-alert">
            <template #message>
              <span>{{ `已选择${domainConfState.selectedRowKeys.length}项` }}
                <a @click="deleteBatch">批量删除</a>
                <a-divider type="vertical" />
                <a @click="domainConfState.selectedRowKeys = []">清除选择</a>
              </span>
            </template>
          </a-alert>
        </a-col>
        <a-col>
          <a-space>
            <Drawer v-if="userInfo?.type === 'administrator'" v-model:visible="isEditingDrawerVisibale" title="新增配置">
              <template #trigger>
                <a-button type="primary" :icon="h(PlusOutlined)" @click="isEditingDrawerVisibale = true">
                  新增配置
                </a-button>
              </template>
              <template #content>
                <AddNewConfig
                  :domain-name="domainConfig.domainName"
                  :host-list="domainHosts"
                  :cluster-id="domainConfig.clusterId" type="add" @cancel="isEditingDrawerVisibale = false" @success="isEditingDrawerVisibale = false;refresh()"
                />
              </template>
            </Drawer>
            <a-button :icon="h(RedoOutlined)" @click="refresh()">
              刷新
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
            <a-popover title="配置详情">
              <template #content>
                <div style="width: 350px;word-break: break-all">
                  {{ record.contents }}
                </div>
              </template>
              <div class="domian-conf-contents">
                {{ record.contents }}
              </div>
            </a-popover>
          </template>
          <template v-if="column.dataIndex === 'operation'">
            <a @click="currentConfContent = record; isConfContentDrawerVisibale = true">查看配置文件</a>
            <a-divider type="vertical" />
            <a @click="currentConfContent = record; isConfChangeLogVisible = true">配置变更日志</a>
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
                  <a>编辑配置</a>
                </template>
              </EditConfigDrawer>
              <a-divider type="vertical" />
              <a-popconfirm
                title="你确定删除这行配置吗?"
                ok-text="确认"
                cancel-text="取消"
                @confirm="confirmDelete(record)"
              >
                <template #icon>
                  <QuestionCircleOutlined style="color: red" />
                </template>
                <a>删除</a>
              </a-popconfirm>
            </template>
          </template>
        </template>
      </a-table>
    </a-card>
    <DomainSelectionModal
      :visible="domainConfig.isSelectDomainModalVisible"
      @cancel="handleDomainSelectCancel"
      @ok="handleDomainSelectOk"
    />
    <Drawer v-model:visible="isConfContentDrawerVisibale" title="配置文件内容">
      <template #content>
        <DomainConfContent :config-content="currentConfContent" />
      </template>
    </Drawer>
    <Drawer v-model:visible="isConfChangeLogVisible" title="配置日志" :width="1100">
      <template #content>
        <DomainConfLog :domain-name="domainConfig.domainName" :conf-file="currentConfContent" :cluster-id="domainConfig.clusterId" />
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
