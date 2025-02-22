<script setup lang="ts">
import { onMounted, reactive, ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import * as Diff from 'diff'
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  CheckCircleTwoTone,
  CloseCircleTwoTone,
  ExclamationCircleTwoTone,
} from '@ant-design/icons-vue'
import { Table } from 'ant-design-vue'
import CompareDiff from './CompareDiff.vue'
import type { ConfFile, RealConfFile } from '@/api'
import { api } from '@/api'
import { checkIsDiff } from '@/utils'
import Drawer from '@/components/Drawer.vue'
import type { TableColumnsType, TablePaginationConfig } from 'ant-design-vue'
import type { ConfTrace } from '@/api'

interface Conf extends RealConfFile {
  syncStatus?: string
  diffResult?: Diff.Change[]
  rpmName?: string
  spacer?: string
  rpmVersion?: string
  rpmRelease?: string
  operationTrace?: ConfTrace[]
}

const props = defineProps<{
  domainName: string
  hostId: string
  hostIp: string
  defaultConf: ConfFile[]
  clusterId: string
}>()

const { t } = useI18n()

const realConf = ref<RealConfFile[]>([])
const allConfs = reactive<Record<'exitingConfs' | 'notExitingConf', Conf[]>>({
  exitingConfs: [],
  notExitingConf: [],
})

const isConfsLoading = ref(false)
async function queryRealConf() {
  if (!props.hostId) return
  isConfsLoading.value = true
  const params = {}
  params[props.clusterId] = {
    domainName: props.domainName,
    hostIds: [{ hostId: props.hostId }],
  }
  const [, res] = await api.getDomainRealConf(params)
  if (res) {
    realConf.value = res[props.clusterId].data[0].confBaseInfos
    const dConfs: Conf[] = props.defaultConf.map(d => ({
      fileAttr: '',
      fileOwner: '',
      filePath: d.filePath,
      confContents: d.contents,
      path: d.filePath,
    }))
    const { confs, notExitedConfs } = compareDiff(dConfs, realConf.value)
    allConfs.exitingConfs = confs
    allConfs.notExitingConf = notExitedConfs
  }
  isConfsLoading.value = false
}

function compareDiff(defaultConfs: Conf[], realConfs: Conf[]) {
  const confs: Conf[] = []
  const notExitedConfs: Conf[] = []
  defaultConfs.forEach(d => {
    let result: Conf = d
    const confMatched = realConfs.find(conf => conf.filePath === d.filePath.replace(/openEuler:/, ''))
    if (!confMatched) {
      result.syncStatus = 'NOT IN HOST'
      notExitedConfs.push(result)
    } else {
      result = {
        ...result,
        ...confMatched,
      }
      const diffLines = Diff.diffLines(d.confContents.replace(/\n$/, ''), confMatched.confContents)
      if (checkIsDiff(diffLines)) {
        result.syncStatus = 'NOT SYNC'
        result.diffResult = diffLines
      } else {
        result.syncStatus = 'SYNC'
      }
      confs.push(result)
    }
  })
  return { confs, notExitedConfs }
}

const isCompareVisible = ref(false)
const selectedCompareConf = ref<Diff.Change[]>([])

function showCompareDrawer(conf: Conf) {
  selectedCompareConf.value = conf.diffResult || []
  isCompareVisible.value = true
}

function useConfOperationRecord() {
  const columns = computed<TableColumnsType>(() => [
    {
      key: 'createTime',
      title: t('common.updateTime'),
      dataIndex: 'createTime',
    },
    {
      key: 'record',
      title: t('conftrace.domainDetail.record'),
      dataIndex: 'record',
    },
    Table.EXPAND_COLUMN,
  ])

  const pagination = reactive<TablePaginationConfig>({
    total: 0,
    current: 1,
    pageSize: 10,
    showTotal: (total: number) => `${t('common.total', { count: total })}`,
    showSizeChanger: true,
    pageSizeOptions: ['10', '20', '30', '40'],
  })

  const confsTraceData = ref<ConfTrace[]>([])

  async function getConfsOperationTrace(confName?: string) {
    const [, res] = await api.queryConfsOperationTrace({
      // page: pagination.current,
      // per_page: pagination.pageSize,
      domain_name: props.domainName,
      conf_name: confName,
      host_id: props.hostId,
    })
    return res
  }

  return { columns, confsTraceData, pagination, getConfsOperationTrace }
}

const { columns: operationColumns, getConfsOperationTrace } = useConfOperationRecord()

async function onCollapseChange(key: string) {
  if (!key) return
  const confName = key

  const res = await getConfsOperationTrace(confName)
  if (res) {
    const conf = [...allConfs.exitingConfs, ...allConfs.notExitingConf].find(item => {
      return item.path == confName
    })

    if (!conf) return
    conf.operationTrace = res.conf_trace_infos
  }
}

const expandedRowKeys = ref<string[]>([])
function expand(expanded: boolean, record: ConfTrace) {
  if (!expanded) {
    expandedRowKeys.value.push(record.UUID)
  } else {
    expandedRowKeys.value = expandedRowKeys.value.filter(item => item !== record.UUID)
  }
}

onMounted(() => {
  queryRealConf()
})
</script>

<template>
  <a-spin :spinning="isConfsLoading">
    <div class="conf-section">
      <h2>{{ $t('conftrace.domainDetail.currentHostConf') }}</h2>
      <div>{{ $t('common.host', [hostId]) }}</div>
      <div style="margin-bottom: 5px">
        {{ $t('common.ip', [hostIp]) }}
      </div>

      <a-collapse @change="onCollapseChange" accordion>
        <a-collapse-panel
          v-for="item in allConfs.exitingConfs"
          :key="item.filePath"
          :header="`${$t('conftrace.domainConf.configurationItem')}：${item.filePath}`"
        >
          <div class="conf-description">
            <a-descriptions :title="$t('conftrace.domainDetail.attributes')" :column="2">
              <a-descriptions-item label="fileAttr">
                {{ item.fileAttr }}
              </a-descriptions-item>
              <a-descriptions-item label="fileOwner">
                {{ item.fileOwner }}
              </a-descriptions-item>
              <a-descriptions-item label="rpmName">
                {{ item.rpmName }}
              </a-descriptions-item>
              <a-descriptions-item label="spacer">
                {{ item.spacer }}
              </a-descriptions-item>
              <a-descriptions-item label="rpmVersion">
                {{ item.rpmVersion }}
              </a-descriptions-item>
              <a-descriptions-item label="rpmRelease">
                {{ item.rpmRelease }}
              </a-descriptions-item>
            </a-descriptions>
          </div>
          <div class="conf-content">
            <a-row type="flex" justify="space-between" class="conf-content-header">
              <a-col>
                <h3 style="font-weight: bold">
                  {{ $t('conftrace.domainDetail.confContent') }}
                </h3>
              </a-col>
              <a-col v-if="item.syncStatus === 'NOT SYNC'">
                <a-button type="primary" @click="showCompareDrawer(item)">
                  {{ $t('conftrace.domainDetail.differences') }}
                </a-button>
              </a-col>
            </a-row>
            <div class="text-container">
              {{ item.confContents }}
            </div>
            <h3 class="mt-[15px]">{{ t('conftrace.domainDetail.operateTrace') }}</h3>
            <p v-if="item.operationTrace">
              {{ t('conftrace.domainDetail.sentence.traceCount', item.operationTrace!.length) }}
            </p>
            <a-table
              v-model:expandedRowKeys="expandedRowKeys"
              row-key="UUID"
              :columns="operationColumns"
              :data-source="item.operationTrace"
              :pagination="false"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.dataIndex === 'createTime'">{{ record.create_time }}</template>
                <template v-if="column.dataIndex === 'record'">{{ record.info }}</template>
              </template>
              <template #expandColumnTitle>
                <span style="white-space: nowrap">{{ $t('conftrace.domainDetail.confTrace') }}</span>
              </template>
              <template #expandIcon="{ expanded, record }">
                <span v-if="!expanded" style="color: #1677ff; cursor: pointer" @click="expand(expanded, record)">
                  {{ $t('common.more') }}<ArrowDownOutlined />
                </span>
                <span v-else style="color: #1677ff; cursor: pointer" @click="expand(expanded, record)">
                  {{ $t('common.close') }}<ArrowUpOutlined />
                </span>
              </template>
              <template #expandedRowRender="{ record }">
                {{ record.ptrace }}
              </template>
            </a-table>
          </div>

          <template #extra>
            <div v-if="item.syncStatus === 'NOT SYNC'">
              <CloseCircleTwoTone two-tone-color="#ff0000" />
              <span style="color: #ff0000">{{ $t('conftrace.domainDetail.sentence.inconsistency') }}</span>
            </div>
            <div v-if="item.syncStatus === 'SYNC'">
              <CheckCircleTwoTone two-tone-color="#52c41a" />
              <span>{{ $t('conftrace.domainDetail.sentence.same') }}</span>
            </div>
          </template>
        </a-collapse-panel>
      </a-collapse>
    </div>

    <div v-if="allConfs.notExitingConf.length" class="conf-section">
      <h2>{{ $t('conftrace.domainDetail.sentence.missing') }}</h2>
      <a-collapse @change="onCollapseChange" accordion>
        <a-collapse-panel
          v-for="item in allConfs.notExitingConf"
          :key="item.filePath"
          :header="`${$t('conftrace.domainConf.configurationItem')}:${item.filePath}`"
        >
          <div class="conf-content">
            <a-row type="flex" justify="space-between" class="conf-content-header">
              <a-col>
                <div class="ant-descriptions-title">
                  {{ $t('conftrace.domainDetail.confContent') }}
                </div>
              </a-col>
            </a-row>
            <div class="text-container">
              {{ item.confContents }}
            </div>
          </div>
          <template #extra>
            <ExclamationCircleTwoTone two-tone-color="#f00" />
            <span style="color: #f00"> {{ $t('conftrace.domainDetail.sentence.noConf') }}</span>
          </template>
        </a-collapse-panel>
      </a-collapse>
    </div>
  </a-spin>

  <Drawer :key="$t('conftrace.domainDetail.differences')" v-model:visible="isCompareVisible" :width="800">
    <template #content>
      <CompareDiff :diff-result="selectedCompareConf" />
    </template>
  </Drawer>
</template>

<style lang="less" scoped>
.conf-section:not(:last-child) {
  padding-bottom: 10px;
  margin-bottom: 10px;
  border-bottom: 1px solid #eee;
}
.conf-section {
  h2,
  h3 {
    font-weight: bold;
  }
}
.text-container {
  word-break: break-all;
  border: 1px solid #ccc;
  border-radius: 3px;
  padding: 10px;
  margin-top: 8px;
}
.conf-description {
  border-bottom: 1px solid #ccc;
}
.conf-content {
  &-header {
    padding-top: 10px;
  }
}
</style>
