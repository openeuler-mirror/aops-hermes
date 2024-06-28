<script lang="ts" setup>
import { h, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { PlusOutlined, QuestionCircleOutlined, RedoOutlined } from '@ant-design/icons-vue'
import DomainSelectionModal from './components/DomainSelectionModal.vue'
import DomainConfContent from './components/DomainConfContent.vue'
import DomainConfLog from './components/DomainConfLog.vue'
import EditConfigDrawer from './components/EditConfigDrawer.vue'
import Drawer from '@/components/Drawer.vue'
import type { ConfFile } from '@/api'
import { api } from '@/api'
import PageWrapper from '@/components/PageWrapper.vue'

const route = useRoute()
const router = useRouter()
const domainConfig = reactive<{ domainName: string, isSelectDomainModalVisible: boolean }>({
  domainName: (route.params.domainId as string) || '',
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
})

async function queryDomainConf() {
  domainConfState.loading = true
  const [, res] = await api.getDomainConf(domainConfig.domainName)
  if (res)
    domainConfs.value = res.confFiles

  domainConfState.loading = false
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
function refresh() {
  domainConfState.selectedRowKeys = []
  queryDomainConf()
}

async function confirmDelete(record: ConfFile) {
  const [, res] = await api.deleteDomainConfig(domainConfig.domainName, [
    { filePath: record.filePath },
  ])
  if (res)
    message.success(res as string)
}

onMounted(() => {
  const domainName = route.params.domainId as string
  if (domainName === '$noDomain') {
    domainConfig.isSelectDomainModalVisible = true
    return
  }
  queryDomainConf()
})
</script>

<template>
  <PageWrapper>
    <a-card>
      <h1 class="domain-conf-title">
        {{ `${domainConfig.domainName}配置表` }}
      </h1>
      <span>共获取到{{ domainConfs.length }}条配置信息</span>
      <a-row type="flex" justify="end">
        <a-col v-show="domainConfState.selectedRowKeys.length > 0" :pull="7">
          <a-alert type="info" show-icon class="delete-alert">
            <template #message>
              <span>{{ `已选择${domainConfState.selectedRowKeys.length}项` }}
                <a @click="domainConfState.selectedRowKeys = []">清除选择</a></span>
            </template>
          </a-alert>
        </a-col>
        <a-col>
          <a-space>
            <EditConfigDrawer type="add" :domain-name="domainConfig.domainName">
              <template #trigger>
                <a-button type="primary" :icon="h(PlusOutlined)">
                  新增配置
                </a-button>
              </template>
            </EditConfigDrawer>
            <a-button :icon="h(RedoOutlined)" @click="refresh">
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
      >
        <template #bodyCell="{ record, column }">
          <template v-if="column.dataIndex === 'contents'">
            <div class="domian-conf-contents">
              {{ record.contents }}
            </div>
          </template>
          <template v-if="column.dataIndex === 'operation'">
            <Drawer title="配置文件内容">
              <template #trigger>
                <a>查看配置文件</a>
              </template>
              <template #content>
                <DomainConfContent :config-content="record" />
              </template>
            </Drawer>
            <a-divider type="vertical" />
            <Drawer title="配置日志" :width="1100">
              <template #trigger>
                <a>配置变更日志</a>
              </template>
              <template #content>
                <DomainConfLog :domain-name="domainConfig.domainName" :conf-file="record" />
              </template>
            </Drawer>
            <a-divider type="vertical" />
            <EditConfigDrawer
              type="edit"
              :domain-name="domainConfig.domainName"
              :file-path="record.filePath"
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
      </a-table>
    </a-card>
    <DomainSelectionModal
      :visible="domainConfig.isSelectDomainModalVisible"
      @cancel="handleDomainSelectCancel"
      @ok="handleDomainSelectOk"
    />
  </PageWrapper>
</template>

<style lang="less" scoped>
.domain-conf-title {
  display: inline-block;
  font-size: 20px;
  margin: 0 5px 0 0;
}
.domian-conf-contents {
  text-overflow: -o-ellipsis-lastline;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
}
</style>
