<script setup lang="ts">
import { EChartsOption, EChartsType, init } from 'echarts'
import type { HostSummary } from '@aops-assistant/apis/types'
import { ref, watch } from 'vue'
import { useDark, useElementSize } from '@vueuse/core'

const props = defineProps<{
  summaryInfo?: HostSummary
}>()

const isDark = useDark({
  storageKey: 'theme-appearance',
  selector: 'html',
})

const columnarRef = ref<HTMLElement | null>(null)
let columnarChart: EChartsType | null = null

let chartOptions: EChartsOption

function renderChart(summaryInfo: HostSummary) {
  if (!summaryInfo?.cluster_summary) return
  const { cluster_cve_status } = summaryInfo.cluster_summary
  chartOptions = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    legend: {
      textStyle: {
        color: isDark.value ? '#ffffff' : '#282C33',
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: [
      {
        type: 'category',
        data: cluster_cve_status.map(item => item.cluster_name),
      },
    ],
    yAxis: [
      {
        type: 'value',
      },
    ],
    series: [
      {
        name: '已修复',
        type: 'bar',
        emphasis: {
          focus: 'series',
        },
        data: cluster_cve_status.map(item => item.fixed_cve_num),
        barMaxWidth: 60,
      },
      {
        name: '未修复',
        type: 'bar',
        stack: 'Ad',
        emphasis: {
          focus: 'series',
        },
        data: cluster_cve_status.map(item => item.unfixed_cve_num),
        barMaxWidth: 60,
      },
    ],
  }
  columnarChart?.setOption(chartOptions)
}

const { width: columnarWidth } = useElementSize(columnarRef)

watch(
  () => columnarWidth.value,
  () => {
    if (columnarChart) columnarChart.resize()
    else {
      columnarChart = init(columnarRef.value!)
    }
    renderChart(props.summaryInfo!)
  },
)
</script>
<template>
  <div class="w-full bg-[var(--ops-bg-color)] p-[10px] px-[20px]">
    <p class="font-semibold text-[18px]">cve修复情况</p>
    <div ref="columnarRef" class="min-h-[395px]"></div>
  </div>
</template>
<style scoped></style>
