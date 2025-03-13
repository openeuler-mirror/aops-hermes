<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import * as Diff from 'diff'
import { ElTable, ElTableColumn, TableInstance, ElPopover, ElDialog } from 'element-plus'
import { useFlow } from '@aops-assistant/stores/flow'
import {
  queryDomainSyncStatus,
  queryBaseConf,
  queryRealConf,
  queryConfsOperationTrace,
} from '@aops-assistant/apis/host'
import Chart from '@aops-assistant/components/Chart.vue'
import { EChartsOption } from 'echarts'
import { RealConfFile } from '@aops-assistant/apis/types'
import { useDark } from '@vueuse/core'

export interface HostInDomain {
  domain_name: string
  hostId: string
  ip: string
  ipv6: string
  sync_status: number
  isSelected?: boolean
  focused?: boolean
}

export interface SyncHost {
  domain_name: string
  host_name: string
  host_ip: string
  status: string
  syncFileList: {
    filePath: string
    status: string
  }[]
}

interface ConfTrace {
  UUID: string
  domain_name: string
  host_id: string
  conf_name: string
  info: string
  create_time: string
  ptrace: string
}

interface Conf extends RealConfFile {
  syncStatus?: string
  diffResult?: Diff.Change[]
  rpmName?: string
  spacer?: string
  rpmVersion?: string
  rpmRelease?: string
  operationTrace?: ConfTrace[]
}

interface SyncHostParams {
  aiReqParams: { domainName: string; hostIds: string[] }[]
}

const isDark = useDark({
  storageKey: 'theme-appearance',
  selector: 'html',
})

const { option, getDomainSyncStatus } = useDomainSyncChart()

const hostList = ref<HostInDomain[]>([])
function initData() {
  const { currentFlowOutput } = useFlow()
  if (!currentFlowOutput) return
  hostList.value = currentFlowOutput.hostlist.map(item => ({
    domain_name: item.domain_name,
    hostId: item.hostId,
    ip: item.ip,
    ipv6: item.ipv6,
    sync_status: item.sync_status,
    focused: false,
  }))
  toggleSelection(hostList.value)
  if (hostList.value.length > 0) {
    focusedRowId.value = hostList.value[0].hostId
    hostList.value[0].focused = true
  }
  assembleParameters()
}

function useDomainSyncChart() {
  const option = ref<EChartsOption>()
  const domainSyncStatus = reactive({
    sync: 0,
    unsync: 0,
    syncRate: 0,
  })
  const getDomainSyncStatus = async () => {
    const [, res] = await queryDomainSyncStatus()
    if (res) {
      domainSyncStatus.syncRate = res.domain_sync_rate
      domainSyncStatus.unsync = res.no_sync_domain_count
      domainSyncStatus.sync = res.sync_domain_count
    }
    setChartOption()
  }
  const setChartOption = () => {
    const pieData = [
      {
        value: domainSyncStatus.sync,
        name: '已同步',
        itemStyle: {
          color: '#017BFF',
        },
      },
      {
        value: domainSyncStatus.unsync,
        name: '未同步',
        itemStyle: {
          color: '#E4211F',
        },
      },
    ]
    option.value = {
      tooltip: {
        trigger: 'item',
      },
      legend: {
        orient: 'vertical',
        left: 24,
        top: '60%',
        icon: 'circle',
        textStyle: {
          color: isDark.value ? '#ffffff' : '#282C33',
        },
      },
      series: [
        {
          type: 'pie',
          radius: ['52%', '60%'],
          center: ['70%', '60%'],
          tooltip: {
            formatter: '',
          },
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.1)',
            shadowOffsetX: -5,
            shadowOffsetY: -5,
            borderWidth: 2,
            borderColor: isDark.value ? '#282C33' : '#ffffff',
          },
          emphasis: {
            scaleSize: 4,
            itemStyle: {
              borderColor: 'transparent',
            },
          },
          data: pieData,
          label: {
            show: false,
          },
        },
        {
          type: 'pie',
          radius: ['0%', '42%'],
          center: ['70%', '60%'],
          tooltip: {
            show: false,
          },
          data: [
            {
              value: 0,
              itemStyle: {
                color: isDark.value ? '#3b3b3b' : '#ffffff',
              },
              label: {
                show: true,
                position: 'center',
                color: isDark.value ? '#ffffff' : '#3b3b3b',
                formatter: `{total|同步率}\n\n{count|${Math.round(domainSyncStatus.syncRate * 100)} %}`,
                rich: {
                  total: {
                    fontSize: 14,
                  },
                  count: {
                    fontSize: 24,
                  },
                },
              },
              labelLine: {
                show: false,
              },
            },
          ],
        },
      ],
    }
  }

  watch(
    () => isDark.value,
    () => setChartOption(),
  )

  return { option, getDomainSyncStatus }
}

const multipleTableRef = ref<TableInstance>()
const selectedHosts = ref<HostInDomain[]>([])

const toggleSelection = (rows?: HostInDomain[], ignoreSelectable?: boolean) => {
  if (rows) {
    selectedHosts.value = rows
    multipleTableRef.value!.toggleAllSelection()
  } else {
    multipleTableRef.value!.clearSelection()
  }
}
function onTableSelect(selection: HostInDomain[], row: HostInDomain) {
  selectedHosts.value = selection
  assembleParameters()
}

async function assembleParameters() {
  const { setFlowRequestParams } = useFlow()
  const map = new Map()

  selectedHosts.value.forEach(item => {
    if (map.has(item.domain_name)) {
      map.get(item.domain_name).push(item.hostId)
    } else {
      map.set(item.domain_name, [item.hostId])
    }
  })

  const arr: { domainName: string; hostIds: string[] }[] = []
  map.forEach((value, key) => {
    arr.push({ domainName: key, hostIds: value })
  })

  const params: SyncHostParams = {
    aiReqParams: arr,
  }
  setFlowRequestParams(params)
}

const focusedRowId = ref<string>('')
const focusedRow = computed(() => hostList.value.find(item => item.hostId === focusedRowId.value))
const tableRowClassName = ({ row }: { row: HostInDomain }) => {
  if (row.focused) {
    return 'focused-row'
  }
  return ''
}

const allConfs = reactive<Record<'exitingConfs' | 'notExitingConf' | 'notSyncConfs', Conf[]>>({
  notSyncConfs: [],
  exitingConfs: [],
  notExitingConf: [],
})

async function getRealConf(domainName: string, hostId: string) {
  const [, baseConf] = await queryBaseConf(domainName)
  const dConfs: Conf[] = baseConf
    ? baseConf.confFiles.map(d => ({
        fileAttr: '',
        fileOwner: '',
        filePath: d.filePath,
        confContents: d.contents,
        path: d.filePath,
      }))
    : []
  const [, realConf] = await queryRealConf({ domainName, hostIds: [{ hostId }] })
  if (realConf) {
    const { confs, notExitedConfs } = compareDiff(dConfs, realConf[0].confBaseInfos)
    allConfs.exitingConfs = confs
    allConfs.notSyncConfs = confs.filter(conf => conf.syncStatus === 'NOT SYNC')
    allConfs.notExitingConf = notExitedConfs
  }
}

function checkIsDiff(diffResult: Diff.Change[]): boolean {
  for (let i = 0; i < diffResult.length; i++) {
    if (diffResult[i].added || diffResult[i].removed) return true
  }
  return false
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

watch(
  () => focusedRowId.value,
  () => {
    const host = hostList.value.find(item => item.hostId === focusedRowId.value)
    if (host) {
      getRealConf(host.domain_name, host.hostId)
    }
  },
)

function onCellClick(row: HostInDomain) {
  hostList.value.forEach(item => {
    item.focused = false
  })
  row.focused = true
  focusedRowId.value = row.hostId
  allConfs.notSyncConfs.forEach(row => {
    if (syncConfRef.value) {
      syncConfRef.value.toggleRowExpansion(row, false)
    }
  })
}

const isContrastVisible = ref(false)
const currentSelectedConf = ref<Conf>()
function onContrastClick(conf: Conf) {
  if (!conf) return
  currentSelectedConf.value = conf
  isContrastVisible.value = true
}

function setDiffClass(isAdd?: boolean, isRemoved?: boolean, isOrigin?: boolean) {
  if (isOrigin) {
    if (isAdd) return 'diff-add-blank'

    if (isRemoved) return 'diff-remove'
  } else {
    if (isAdd) return 'diff-add'

    if (isRemoved) return 'diff-remove-blank'
  }
  return ''
}

/**
 * 当未同步主机某个配置被点开时，获取操作记录
 */
async function onExpandChange(row: Conf, expandedRows: Conf[]) {
  const host = hostList.value.find(item => item.hostId === focusedRowId.value)
  if (!host) return
  const [, res] = await queryConfsOperationTrace({
    domain_name: host.domain_name,
    host_id: host.hostId,
    conf_name: row.filePath,
    sort: 'create_time',
    direction: 'desc',
  })
  if (!res) return
  row.operationTrace = res.conf_trace_infos
}

const syncConfRef = ref<TableInstance>()

onMounted(() => {
  getDomainSyncStatus()
  initData()
})
</script>
<template>
  <div class="w-full h-full flex gap-[8px] pb-[8px]">
    <div class="w-[40%] flex flex-col h-full">
      <div class="h-[272px]">
        <Chart
          :option="option"
          title="业务域同步率"
          class="bg-[var(--ops-bg-color--secondary)] rounded-tr-[4px] rounded-b-[4px]"
        />
      </div>
      <el-table
        class="mt-[8px] flex-1 bg-[var(--ops-bg-color--secondary)]"
        ref="multipleTableRef"
        row-key="hostId"
        :data="hostList"
        :row-class-name="tableRowClassName"
        @select="onTableSelect"
        @cell-click="onCellClick"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="ip" label="主机" />
        <el-table-column prop="domain_name" label="业务域" />
        <el-table-column prop="sync_status" label="同步状态">
          <template #default="scoped">
            <span
              v-if="scoped.row.sync_status === 0"
              class="px-[8px] rounded-[2px] bg-[#e32020] text-[#fff] text-[12px]"
            >
              未同步
            </span>
            <span
              v-else-if="scoped.row.sync_status === 1"
              class="px-[8px] rounded-[2px] bg-[#24ab36] text-[#fff] text-[12px]"
            >
              已同步
            </span>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="flex-1 bg-[var(--ops-bg-color--secondary)] h-full rounded-tr-[4px] rounded-b-[4px] p-[24px]">
      <h3 class="font-semibold">未同步主机 (IP: {{ focusedRow?.ip }})</h3>
      <el-table :data="allConfs.notSyncConfs" ref="syncConfRef" row-key="filePath" @expand-change="onExpandChange">
        <el-table-column type="expand">
          <template #default="props">
            <el-table :data="props.row.operationTrace" height="180" size="small" border>
              <el-table-column prop="create_time" label="更新时间" sortable width="200" />
              <el-table-column prop="info" label="监控记录" />
            </el-table>
          </template>
        </el-table-column>
        <el-table-column prop="filePath" label="配置路径" />
        <el-table-column prop="confContents" label="配置内容">
          <template #default="scoped">
            <el-popover placement="bottom" :width="200" trigger="hover" :content="scoped.row.confContents">
              <template #reference>
                <div class="w-[200px] text-ellipsis whitespace-nowrap overflow-hidden">
                  {{ scoped.row.confContents }}
                </div>
              </template>
            </el-popover>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template #default="scoped">
            <a @click="onContrastClick(scoped.row)">差异对比</a>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog v-model="isContrastVisible" :title="currentSelectedConf?.filePath">
      <div class="w-full flex justify-between">
        <div class="w-[50%]">
          <h3>{{ $t('conftrace.domainConf.hostSide') }}</h3>
        </div>
        <div class="w-[50%]">
          <h3>{{ $t('conftrace.domainDetail.domainSide') }}</h3>
        </div>
      </div>
      <div class="diff-content">
        <div v-for="(part, index) in currentSelectedConf?.diffResult" :key="index">
          <a-row type="flex" justify="space-between">
            <a-col :span="11" class="diff-line" :class="[setDiffClass(part.added, part.removed)]">
              {{ !part.removed ? part.value : '' }}
            </a-col>
            <a-col :span="11" class="diff-line" :class="[setDiffClass(part.added, part.removed, true)]">
              {{ !part.added ? part.value : '' }}
            </a-col>
          </a-row>
        </div>
      </div>
    </el-dialog>
  </div>
</template>
<style>
.focused-row {
  --el-table-tr-bg-color: var(--el-color-warning-light-9);
}
</style>

<style lang="less" scoped>
.diff-content {
  border: 1px solid #ccc;
  padding: 24px;
}
.diff-line {
  word-break: break-all;
  white-space: pre-wrap;
}

.diff-add {
  background: var(--ops-codediff-bg__t);
  &-blank {
    background: var(--ops-codediff-bg__t);
    color: var(--ops-codediff-bg__t);
  }
}
.diff-remove {
  background: var(--ops-codediff-bg__f);
  &-blank {
    background: var(--ops-codediff-bg__f);
    color: var(--ops-codediff-bg__f);
  }
}
</style>
