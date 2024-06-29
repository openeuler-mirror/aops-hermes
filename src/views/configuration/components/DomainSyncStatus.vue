<script setup lang='ts'>
import { CheckCircleTwoTone, CloseCircleTwoTone, QuestionCircleOutlined, SyncOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { computed, onMounted, ref } from 'vue'
import { DOMAN_STATUS_ENUM, DOMAN_STATUS_LABEL_ENUM } from '../constants'
import { type HostInDomain, api } from '@/api'

const props = withDefaults(defineProps<
  {
    syncHost?: HostInDomain
    clusterId: string
    domainName: string
    isStatusLoading: boolean
  }
  >(), {
})

const emit = defineEmits(['success'])

const columns = [
  {
    title: '配置文件',
    dataIndex: 'file_path',
  },
  {
    title: '同步状态',
    dataIndex: 'isSynced',
  },
  {
    dataIndex: 'operation',
    title: '操作',
  },
]

const confStatusList = ref<{
  file_path: string
  isSynced: string
}[]>([])

const isSyncAllDisable = computed(() => confStatusList.value.filter(item => item.isSynced === 'NOT SYNCHRONIZE').length === 0)

const isSyncingAll = ref(false)
async function syncAll() {
  const fileList = confStatusList.value.filter(item => item.isSynced === 'NOT SYNCHRONIZE')
  if (fileList.length === 0) {
    message.info('请确保有至少有一个文件可同步')
    return
  }
  isSyncingAll.value = true
  await syncConfigConfirm(fileList)
  isSyncingAll.value = false
}

async function syncConfigConfirm(records: {
  file_path: string
  isSynced: string
}[]) {
  const params = {}
  params[props.clusterId] = {
    domainName: props.domainName,
    syncList: [{
      hostId: props.syncHost?.hostId,
      syncConfigs: records.map(i => i.file_path),
    }],
  }
  const [, res] = await api.syncConfs(params)
  if (res && res[props.clusterId].label === 'Succeed') {
    message.success('同步成功')
    queryDomainStatus()
    emit('success')
  }
  else { message.error('同步失败') }
}

const isLoading = ref(false)
async function queryDomainStatus() {
  isLoading.value = true
  const params = {}
  params[props.clusterId] = {
    domainName: props.domainName,
    ip: props.syncHost!.ip,
  }
  const [, res] = await api.getDomainStatus(params)
  if (res) {
    confStatusList.value = res[props.clusterId].data.hostStatus[0].syncStatus
    isLoading.value = false
  }
}

onMounted(() => {
  queryDomainStatus()
})
</script>

<template>
  <div v-if="syncHost">
    <a-row type="flex" justify="space-between">
      <a-col :span="22">
        <div style="float: left; margin-bottom: 10px">
          <span>主机：{{ syncHost.ip }}</span>
        </div>
        <div style="float: right; margin-bottom: 10px">
          <a-popconfirm
            v-if="!isSyncAllDisable"
            title="你确定要将当前业务域的配置同步到这台主机吗?"
            ok-text="确认"
            cancel-text="取消"
            @confirm="syncAll"
          >
            <a-button type="primary" size="small">
              <SyncOutlined :spin="isSyncingAll" />全部同步
            </a-button>
          </a-popconfirm>
          <a-button v-else type="primary" size="small" :disabled="isSyncAllDisable">
            <SyncOutlined :spin="isSyncingAll" />全部同步
          </a-button>
        </div>
      </a-col>
    </a-row>

    <a-row type="flex" justify="space-between">
      <a-col :span="22">
        <a-table
          row-key="file_path"
          :columns="columns"
          :data-source="confStatusList"
          :pagination="false"
          size="small"
          :loading="isLoading"
        >
          <template #bodyCell="{ record, column }">
            <template v-if="column.dataIndex === 'isSynced'">
              <span>
                <CheckCircleTwoTone
                  v-if="record.isSynced === DOMAN_STATUS_ENUM.sync"
                  style="font-size: 16px"
                  two-tone-color="#52c41a"
                />
                <CloseCircleTwoTone
                  v-else-if="record.isSynced === DOMAN_STATUS_ENUM.notSync"
                  style="font-size: 16px"
                  two-tone-color="#ff0000"
                />
                <QuestionCircleOutlined v-else style="font-size: 16px" />
                {{ DOMAN_STATUS_LABEL_ENUM[record.isSynced] }}
              </span>
            </template>
            <template v-if="column.dataIndex === 'operation'">
              <span>
                <a-popconfirm
                  title="你确定要同步该配置到这台主机吗?"
                  ok-text="确认"
                  cancel-text="取消"
                  :disabled="record.isSynced !== 'NOT SYNCHRONIZE'"
                  @confirm="syncConfigConfirm([record])"
                >
                  <a-button type="link" :disabled="record.isSynced !== 'NOT SYNCHRONIZE'">同步</a-button>
                </a-popconfirm>
              </span>
            </template>
          </template>
        </a-table>
      </a-col>
    </a-row>
  </div>
</template>

<style scoped>
</style>
