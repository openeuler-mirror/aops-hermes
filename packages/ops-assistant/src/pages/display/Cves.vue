<script setup lang="ts">
import { computed, onMounted, reactive, ref, watchEffect } from 'vue'
import { storeToRefs } from 'pinia'
import { ElTable, ElTableColumn, ElPagination, TableInstance, ElCheckbox } from 'element-plus'
import { useCves } from '@aops-assistant/stores/cves'
import { queryCves, queryUnfixedRpm, queryHostsInCves } from '../../apis/host'
import { useFlow } from '../../stores/flow'
import Chart from '@aops-assistant/components/Chart.vue'
import type { EChartsOption, SeriesOption } from 'echarts'
import type { HostInCve, RecommendSummary, Severity, ClusterCve, Cve, UnfixedRpm } from '@aops-assistant/apis/types'

interface CveItem extends Cve {
  isSelected?: boolean
  isIndeterminate?: boolean
  rpms?: UnfixedRpmItem[]
  hosts?: HostInCve
}

interface UnfixedRpmItem extends UnfixedRpm {
  isSelected?: boolean
}

interface GenerateTaskParams {
  task_name: string
  description: string
  accepted: boolean
  check_items: string[]
  takeover: boolean
  info: {
    cve_id: string
    host_info: { host_id: string }[]
    rpms: { available_rpm: string; fix_way: string; installed_rpm: string }[]
  }[]
}

const severityColorMap = {
  Critical: '#E4211F',
  High: '#FA770F',
  Medium: '#E9B000',
  Low: '#017BFF',
  Unknown: '#8D98AC',
}

const severityMap = computed(() => ({
  Critical: '严重',
  High: '高风险',
  Medium: '中风险',
  Low: '低风险',
  Unknown: '未知',
}))

const { selectedCveIds } = storeToRefs(useCves())

const fullCves = ref<Record<number, CveItem[]>>({})

const cves = ref<CveItem[]>([])
const recommendedCveIds = ref<string[]>([])

const cveTableRef = ref<TableInstance>()

const isCurrentPageSelectedAll = ref(false)
const isIndeterminate = ref(false)

const paginationConf = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
  totalPage: 0,
})

/**
 * Get the list of CVEs according to the pagination configuration.
 * It also updates the following reactive variables:
 * - `cves`: the list of CVEs with an extra property `isSelected` indicating if the CVE is selected.
 * - `isCurrentPageSelectedAll`: a boolean indicating if all CVEs in the current page are selected.
 * - `isIndeterminate`: a boolean indicating if some CVEs in the current page are selected.
 * - `paginationConf.total`: the total number of CVEs.
 * - `paginationConf.totalPage`: the total number of pages.
 */
async function getCves() {
  const [, res] = await queryCves(paginationConf.page, paginationConf.pageSize, cveFilterParams.value)
  if (res) {
    cves.value = res.cve_info || []
    cves.value.forEach(cve => {
      cve.isSelected = recommendedCveIds.value.includes(cve.cve_id)
    })
    const selectedCves = cves.value.filter(cve => cve.isSelected)
    if (selectedCves.length > 0) {
      const hosts = await getHostsAssociatedWithCves(selectedCves)
      if (hosts) {
        cves.value.forEach(cve => {
          cve.hosts = hosts[cve.cve_id]
        })
      }
    }
    fullCves.value[paginationConf.page] = cves.value
    if (cves.value && cves.value.length !== 0) {
      isCurrentPageSelectedAll.value = cves.value.every(cve => cve.isSelected)
      isIndeterminate.value = cves.value.some(cve => cve.isSelected) && !isCurrentPageSelectedAll.value
    }

    paginationConf.total = res.total_count
    paginationConf.totalPage = res.total_page
  }
}

const cveChartData = ref<RecommendSummary>()
const cveFilterParams = ref<{
  fixed: boolean
  cluster_id?: string
  severity?: Severity
  min_score?: number
  max_score?: number
  hot_patch?: boolean
}>({
  fixed: false,
})

/**
 * Handles the change in selection state of a CVE.
 *
 * When a CVE's selection state is changed, this function updates the
 * `isSelected` property of all associated RPMs. It also updates the
 * `isCurrentPageSelectedAll` and `isIndeterminate` reactive variables based
 * on the selection states of all CVEs on the current page.
 *
 * @param {string} cveId - The ID of the CVE whose selection state has changed.
 */
async function onCveSelectedChange(cveId: string) {
  const cve: CveItem | undefined = cves.value.find(c => c.cve_id === cveId)

  if (!cve) return
  const isSelected = cve.isSelected
  if (isSelected) {
    selectedCveIds.value.push(cveId)
    const hostsInfo = await getHostsAssociatedWithCves([cve])
    if (hostsInfo) cve.hosts = hostsInfo[cve.cve_id]
  } else {
    selectedCveIds.value = selectedCveIds.value.filter(id => id !== cveId)
  }

  cve.rpms?.forEach(rpm => {
    rpm.isSelected = cve.isSelected
  })

  isCurrentPageSelectedAll.value = cves.value.every(cve => cve.isSelected)
  if (cve.rpms) {
    cve.isIndeterminate =
      cve.rpms.filter(rpm => rpm.isSelected).length !== cve.rpms.length &&
      cve.rpms.filter(rpm => rpm.isSelected).length > 0
  }
  isIndeterminate.value = cves.value.some(cve => cve.isSelected) && !isCurrentPageSelectedAll.value
  assembleParameters()
}

/**
 * Updates the selection state of a specific RPM within a CVE.
 *
 * This function checks if a specific RPM within a given CVE is selected or not.
 * It updates the CVE's `isSelected` and `isIndeterminate` properties based on
 * the selection states of its RPMs. Additionally, it updates the global
 * `isCurrentPageSelectedAll` and `isIndeterminate` flags for the current
 * page of CVEs.
 *
 * @param {string} cveId - The identifier of the CVE to update.
 * @param {UnfixedRpmItem} rpm - The RPM item whose selection state has changed.
 */
function onRpmSelectedChange(cveId: string, rpm: UnfixedRpmItem) {
  const cve = cves.value.find(c => c.cve_id === cveId)
  if (!cve) return
  cve.isSelected = cve.rpms?.every(rpm => rpm.isSelected)
  cve.isIndeterminate = cve.rpms?.some(rpm => rpm.isSelected) && !cve.isSelected
  if (cves.value.length !== 0) {
    isCurrentPageSelectedAll.value = cves.value.every(cve => cve.isSelected)
    isIndeterminate.value = cves.value.some(cve => cve.isSelected) && !isCurrentPageSelectedAll.value
  }
  assembleParameters()
}

/**
 * Handles the changes in pagination by updating the current page and page size.
 *
 * This function modifies the `paginationConf` object with the provided
 * `currentPage` and `pageSize` values. It then fetches the updated list of CVEs
 * based on the new pagination configuration.
 *
 * @param {number} currentPage - The current page number selected in the pagination.
 * @param {number} pageSize - The number of items to display per page.
 */
function onPageChange(currentPage: number, pageSize: number) {
  paginationConf.page = currentPage
  paginationConf.pageSize = pageSize
  if (Object.keys(fullCves.value).includes(currentPage.toString())) {
    cves.value = fullCves.value[`${currentPage}`]
  } else getCves()
}

const expandedRowKeys = ref<string[]>([])

/**
 * Handles the expand event of the table by fetching the list of unfixed RPMs
 * associated with the expanded CVE.
 *
 * When a row is expanded, this function checks if the row's CVE ID is already
 * present in the `expandedRowKeys` array. If it is, the function removes the
 * CVE ID from the array. If it is not, the function adds the CVE ID to the array.
 * The function then fetches the list of unfixed RPMs associated with the
 * expanded CVE and assigns it to the `rpms` property of the expanded row.
 * If the expanded row is selected, the function iterates over the list of RPMs
 * and sets each RPM's `isSelected` property to `true`.
 */
async function onTableExpand(row: CveItem, expandedRows: CveItem[]) {
  if (expandedRows.length === 0) {
    return
  }
  if (expandedRowKeys.value.includes(row.cve_id)) {
    expandedRowKeys.value = expandedRowKeys.value.filter(id => id !== row.cve_id)
  } else {
    expandedRowKeys.value.push(row.cve_id)
  }
  const [, res] = await queryUnfixedRpm({ cve_id: row.cve_id, host_ids: [] })
  if (res) {
    row.rpms = res
  }
  if (row.isSelected) {
    row.rpms?.forEach(rpm => {
      rpm.isSelected = true
    })
  }
}

async function initCveFilterParams() {
  const { flowRequestParams } = useFlow()
  if (flowRequestParams) {
    cveFilterParams.value = { ...flowRequestParams, ...cveFilterParams.value }
  }
}

const { currentFlowOutput } = storeToRefs(useFlow())

async function initCvesData(data: RecommendSummary) {
  if (data) {
    cveChartData.value = data
    recommendedCveIds.value = data.recommend_cves
  }
}

async function getHostsAssociatedWithCves(cves: CveItem[]) {
  const [, res] = await queryHostsInCves({
    fixed: false,
    cve_list: cves.map(item => ({
      cve_id: item.cve_id,
      rpms: item.rpms
        ? item.rpms.map(rpm => ({
            available_rpm: rpm.available_rpm,
            fix_way: rpm.support_way,
            installed_rpm: rpm.installed_rpm,
          }))
        : [],
    })),
  })
  return res
}

async function assembleParameters() {
  const { setFlowRequestParams } = useFlow()
  const selectedCves = cves.value.filter(cve => cve.isSelected || cve.isIndeterminate)
  const params: GenerateTaskParams = {
    task_name: 'ai cve fix',
    description: 'ai cve fix',
    accepted: false,
    takeover: false,
    check_items: [],
    info: selectedCves.map(cve => ({
      cve_id: cve.cve_id,
      host_info: cve.hosts?.hosts.map(host => ({ host_id: host.host_id })) || [],
      rpms:
        cve.rpms
          ?.filter(rpm => rpm.isSelected)
          .map(rpm => ({
            available_rpm: rpm.available_rpm,
            fix_way: rpm.support_way,
            installed_rpm: rpm.installed_rpm,
          })) || [],
    })),
  }
  setFlowRequestParams(params)
}

const { option: ClusterDistributionChartOption } = useClusterDistribution()
const { option: cveSeverityChartOption } = useCveSeverityChart()

function useClusterDistribution() {
  const option = ref<EChartsOption>()
  const renderClusterChart = (clusterInfo: ClusterCve[]) => {
    const xAxisData = clusterInfo.map(item => item.cluster_name)
    const chartSeries: SeriesOption[] = [
      {
        name: '冷补丁',
        type: 'bar',
        barMaxWidth: 60,
        itemStyle: {
          color: 'rgb(0, 119, 255)',
          shadowColor: 'rgba(0, 92, 219, 0.25)',
          shadowBlur: 12,
          shadowOffsetX: 4,
          shadowOffsetY: 8,
        },
        emphasis: {
          focus: 'series',
        },
        data: clusterInfo.map(item => item.cve_num) as any,
      },
      {
        name: '热补丁',
        type: 'bar',
        barMaxWidth: 60,
        barGap: '-100%',
        itemStyle: {
          color: 'rgb(227, 32, 32)',
        },
        emphasis: {
          focus: 'series',
        },
        data: clusterInfo.map(item => item.hot_patch_num),
      },
    ]
    option.value = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
      },
      xAxis: {
        type: 'category',
        data: xAxisData,
        axisLine: {
          lineStyle: {
            color: 'rgb(223,229,239)',
          },
        },
      },
      yAxis: {
        type: 'value',
        splitLine: {
          lineStyle: {
            type: 'dashed',
            color: 'rgb(223,229,239)',
          },
        },
      },
      legend: {
        itemWidth: 12,
        itemHeight: 12,
        right: 24,
        top: 24,
        itemGap: 24,
        icon: 'rect',
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '25%',
        containLabel: true,
      },
      series: chartSeries,
    }
  }

  watchEffect(() => {
    if (cveChartData.value && cveChartData.value.cluster_cve_num) renderClusterChart(cveChartData.value.cluster_cve_num)
  })
  return { option }
}

function useCveSeverityChart() {
  const option = ref<EChartsOption>()
  const setChartOptions = (
    cveSeverity: {
      num: number
      severity: Severity
    }[],
  ) => {
    const pieData = cveSeverity.map(item => ({
      value: item.num,
      name: severityMap.value[item.severity],
      itemStyle: { color: severityColorMap[item.severity] },
    }))

    option.value = {
      tooltip: {
        trigger: 'item',
      },
      legend: {
        orient: 'vertical',
        left: 24,
        top: '40%',
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
          data: pieData,
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
                formatter: `{total|cve总数}\n\n{count|${cveSeverity.reduce((pre, cur) => pre + cur.num, 0)}}`,
                rich: {
                  total: {
                    fontSize: 26,
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

  watchEffect(() => {
    if (cveChartData.value && cveChartData.value.severity_proportion) {
      setChartOptions(cveChartData.value.severity_proportion)
    }
  })
  return {
    option,
  }
}

onMounted(() => {
  initCveFilterParams()
  initCvesData(currentFlowOutput.value)
  getCves()
  assembleParameters()
})
</script>
<template>
  <div class="flex flex-col gap-3">
    <div class="w-full flex gap-[10px] rounded-[4px] h-[272px]">
      <Chart
        :option="ClusterDistributionChartOption"
        title="集群分布"
        class="bg-[var(--ops-bg-color)] h-full bar-chart rounded-tr-[4px] rounded-b-[4px]"
      />
      <Chart
        :option="cveSeverityChartOption"
        title="cve安全等级分布"
        class="bg-[var(--ops-bg-color)] h-full pie-chart rounded-[4px]"
      />
    </div>
    <el-table
      ref="cveTableRef"
      row-key="cve_id"
      :data="cves"
      size="small"
      @expand-change="onTableExpand"
      :header-cell-style="{ backgroundColor: 'rgb(244, 246, 250)', color: 'rgb(72, 88, 101)' }"
    >
      <el-table-column type="expand" width="40">
        <template #default="props">
          <div class="px-4">Description:</div>
          <div class="px-4 my-1">{{ props.row.description }}</div>
          <el-table
            :row-key="(row: UnfixedRpm) => `${props.row.cve_id}-${row.installed_rpm}-${row.available_rpm}`"
            :data="props.row.rpms"
          >
            <el-table-column width="50" align="center">
              <template #default="inner">
                <el-checkbox
                  v-model="inner.row.isSelected"
                  @change="onRpmSelectedChange(props.row.cve_id, inner.row)"
                />
              </template>
            </el-table-column>
            <el-table-column prop="installed_rpm" label="受影响RPM"></el-table-column>
            <el-table-column prop="available_rpm" label="待安装RPM"></el-table-column>
            <el-table-column prop="support_way" label="修复方式"></el-table-column>
          </el-table>
        </template>
      </el-table-column>
      <el-table-column width="30" align="center">
        <!-- <template #header>
          <el-checkbox
            v-model="isCurrentPageSelectedAll"
            :indeterminate="isIndeterminate"
            @change="onCveSelectedAllChanged"
          />
        </template> -->
        <template #default="scoped">
          <el-checkbox
            v-model="scoped.row.isSelected"
            @change="onCveSelectedChange(scoped.row.cve_id)"
            :indeterminate="scoped.row.isIndeterminate"
          />
        </template>
      </el-table-column>
      <el-table-column prop="cve_id" label="CVE ID" />
      <el-table-column prop="package" label="软件包" />
      <el-table-column prop="publish_time" label="发布时间" />
      <el-table-column prop="severity" label="严重性">
        <template #default="scoped">
          <span
            class="px-[5px] pb-[2px] rounded-sm text-[12px] font-normal text-[#fff]"
            :style="{ backgroundColor: severityColorMap[scoped.row.severity] }"
          >
            {{ severityMap[scoped.row.severity] }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="cvss_score" label="CVSS分数" />
    </el-table>
    <div class="flex justify-end">
      <el-pagination
        background
        layout="total,prev, pager, next"
        :page-size="paginationConf.pageSize"
        :total="paginationConf.total"
        @change="onPageChange"
      />
    </div>
  </div>
</template>
<style scoped>
.bar-chart {
  width: calc(((100% - 10px) * 2) / 3);
}

.pie-chart {
  width: calc((100% - 10px) / 3);
}
</style>
