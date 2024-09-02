<script setup lang='ts'>
import { CheckCircleTwoTone, CloseCircleTwoTone, QuestionCircleOutlined, SyncOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
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

const { t } = useI18n()
const columns = [
  {
    title: t('conftrace.domainConf.file'),
    dataIndex: 'file_path',
  },
  {
    title: t('conftrace.domainDetail.syncStatus'),
    dataIndex: 'isSynced',
  },
  {
    dataIndex: 'operation',
    title: t('common.operation'),
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
    message.info(t('conftrace.domainDetail.message.atLeastOneFile'))
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
    message.success(t('conftrace.domainDetail.message.syncSucceed'))
    queryDomainStatus()
    emit('success')
  }
  else { message.error(t('conftrace.domainDetail.message.syncFailed')) }
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
          <span>{{ t('conftrace.domainDetail.sentence.hostIp', { ip: syncHost.ip }) }} </span>
        </div>
        <div style="float: right; margin-bottom: 10px">
          <a-popconfirm
            v-if="!isSyncAllDisable"
            :title="t('conftrace.domainDetail.sentence.sureSyncDomain')"
            :ok-text="t('common.confirm')"
            :cancel-text="t('common.cancel')"
            @confirm="syncAll"
          >
            <a-button type="primary" size="small">
              <SyncOutlined :spin="isSyncingAll" />{{ t("conftrace.domainDetail.sentence.syncAll") }}
            </a-button>
          </a-popconfirm>
          <a-button v-else type="primary" size="small" :disabled="isSyncAllDisable">
            <SyncOutlined :spin="isSyncingAll" />{{ t("conftrace.domainDetail.sentence.syncAll") }}
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
                {{ t(`conftrace.domainDetail.${DOMAN_STATUS_LABEL_ENUM[record.isSynced]}`) }}
              </span>
            </template>
            <template v-if="column.dataIndex === 'operation'">
              <span>
                <a-popconfirm
                  :title="t('conftrace.domainDetail.sentence.sureSyncConf')"
                  :ok-text="t('common.confirm')"
                  :cancel-text="t('common.cancel')"
                  :disabled="record.isSynced !== 'NOT SYNCHRONIZE'"
                  @confirm="syncConfigConfirm([record])"
                >
                  <a-button type="link" :disabled="record.isSynced !== 'NOT SYNCHRONIZE'">{{ t('common.sync') }}</a-button>
                </a-popconfirm>
              </span>
            </template>
          </template>
        </a-table>
      </a-col>
    </a-row>
  </div>
</template>
