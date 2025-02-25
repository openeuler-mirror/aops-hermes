<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import * as Diff from 'diff'
import { ElTable, ElTableColumn, TableInstance, ElPopover, ElDialog } from 'element-plus'
import { useFlow } from '@aops-assistant/stores/flow'
import { queryDomainSyncStatus, queryBaseConf, queryRealConf } from '@aops-assistant/apis/host'
import Chart from '@aops-assistant/components/Chart.vue'
import { EChartsOption } from 'echarts'
import { storeToRefs } from 'pinia'
import { RealConfFile } from '@aops-assistant/apis/types'

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

const props = defineProps<{
  activeFlow: string
}>()

const { currentFlow } = storeToRefs(useFlow())

const { option, getDomainSyncStatus } = useDomainSyncChart()

const hostList = ref<HostInDomain[]>([])
const syncResultList = ref<SyncHost[]>([])
function initData() {
  const { currentFlowOutput, currentFlow } = useFlow()
  if (!currentFlowOutput) return
  if (currentFlow === 'query_conf_unsync_host') {
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
  } else if (currentFlow === 'host_batch_sync_conf') {
    syncResultList.value = []
    currentFlowOutput.forEach(item => {
      const domain = item.domain
      const host = item.data.map(
        (host: {
          host_id: string
          host_ip: string
          host_name: string
          syncResult: { filePath: string; result: string }[]
        }) => ({
          domain_name: domain,
          host_name: host.host_name || '',
          host_ip: host.host_ip || '',
          status: host.syncResult.every(({ result }) => result === 'SUCCESS') ? 'SUCCESS' : 'FAIL',
          syncFileList: host.syncResult.map(({ filePath, result }) => ({ filePath, status: result })) || [],
        }),
      )
      syncResultList.value = [...syncResultList.value, ...host]
    })
  }
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
    option.value = {
      tooltip: {
        trigger: 'item',
      },
      legend: {
        orient: 'vertical',
        left: 24,
        top: '60%',
        icon: 'circle',
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
            borderColor: '#ffffff',
          },
          emphasis: {
            scaleSize: 12,
            itemStyle: {
              borderColor: 'transparent',
            },
          },
          data: [
            {
              value: domainSyncStatus.sync,
              name: '已同步',
            },
            {
              value: domainSyncStatus.unsync,
              name: '未同步',
            },
          ],
          label: {
            show: false,
          },
        },
        {
          type: 'pie',
          radius: ['0%', '52%'],
          center: ['70%', '60%'],
          tooltip: {
            show: false,
          },
          data: [
            {
              value: 0,
              itemStyle: {
                color: '#fff',
                borderColor: '#fff',
                borderWidth: 2,
              },

              label: {
                show: true,
                position: 'center',
                color: '#000',
                formatter: `{total|同步率}\n\n{count|${Math.round(domainSyncStatus.syncRate * 100)} %}`,
                rich: {
                  total: {
                    fontSize: 22,
                    fontWeight: 'bold',
                  },
                  count: {
                    fontSize: 20,
                    fontWeight: 'bold',
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

onMounted(() => {
  getDomainSyncStatus()
  initData()
})
</script>
<template>
  <div>
    <div
      v-if="activeFlow === 'domain-query_conf_unsync_host'"
      class="w-full flex gap-[10px] rounded-[4px] h-[272px] mb-[10px]"
    >
      <div class="w-[40%]">
        <Chart
          :option="option"
          title="业务域同步率"
          class="bg-[var(--ops-bg-color)] h-full rounded-tr-[4px] rounded-b-[4px]"
        />
      </div>
      <div class="w-[60%] bg-[var(--ops-bg-color)] h-full rounded-tr-[4px] rounded-b-[4px] p-[24px]">
        <h3 class="font-semibold">未同步主机 (IP: {{ focusedRow?.ip }})</h3>
        <el-table
          :data="allConfs.notSyncConfs"
          size="small"
          :header-cell-style="{ backgroundColor: 'rgb(244, 246, 250)', color: 'rgb(72, 88, 101)' }"
        >
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
    </div>
    <template v-if="activeFlow === 'domain-query_conf_unsync_host'">
      <el-table
        ref="multipleTableRef"
        row-key="hostId"
        :data="hostList"
        :row-class-name="tableRowClassName"
        :header-cell-style="{ backgroundColor: 'rgb(244, 246, 250)', color: 'rgb(72, 88, 101)' }"
        @select="onTableSelect"
        @cell-click="onCellClick"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="ip" label="主机" />
        <el-table-column prop="domain_name" label="业务域" />
        <el-table-column prop="ipv6" label="IP协议" />
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
    </template>
    <template v-else-if="activeFlow === 'domain-host_batch_sync_conf'">
      <el-table
        ref="multipleTableRef"
        row-key="host_ip"
        :data="syncResultList"
        :header-cell-style="{ backgroundColor: 'rgb(244, 246, 250)', color: 'rgb(72, 88, 101)' }"
        @select="onTableSelect"
        @cell-click="onCellClick"
      >
        <el-table-column type="expand">
          <template #default="props">
            <el-table
              :data="props.row.syncFileList"
              :header-cell-style="{ backgroundColor: 'rgb(244, 246, 250)', color: 'rgb(72, 88, 101)' }"
            >
              <el-table-column label="配置路径" prop="filePath" />
              <el-table-column label="同步结果" prop="status">
                <template #default="fileSync">
                  <span
                    v-if="fileSync.row.status === 'SUCCESS'"
                    class="px-[8px] py-[1px] rounded-[2px] bg-[#24ab36] text-[#fff] text-[12px]"
                  >
                    同步成功
                  </span>
                  <span
                    v-else-if="fileSync.row.status === 'FAIL'"
                    class="px-[8px] py-[1px] rounded-[2px] text-[#fff] text-[12px] bg-[#e32020]"
                  >
                    成功失败
                  </span>
                </template>
              </el-table-column>
            </el-table>
          </template>
        </el-table-column>
        <el-table-column prop="host_name" label="主机名" />
        <el-table-column prop="host_ip" label="主机" />
        <el-table-column prop="domain_name" label="业务域" />
        <el-table-column prop="status" label="同步状态">
          <template #default="hostSync">
            <span
              v-if="hostSync.row.status === 'SUCCESS'"
              class="px-[8px] py-[1px] rounded-[2px] bg-[#24ab36] text-[#fff] text-[12px]"
            >
              同步成功
            </span>
            <span
              v-else-if="hostSync.row.status === 'FAIL'"
              class="px-[8px] py-[1px] rounded-[2px] text-[#fff] text-[12px] bg-[#e32020]"
            >
              成功失败
            </span>
          </template>
        </el-table-column>
      </el-table>
    </template>
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
  background: rgb(236, 253, 240);
  &-blank {
    background: rgb(236, 253, 240);
    color: rgb(236, 253, 240);
  }
}
.diff-remove {
  background: rgb(251, 233, 235);
  &-blank {
    background: rgb(251, 233, 235);
    color: rgb(251, 233, 235);
  }
}
</style>
