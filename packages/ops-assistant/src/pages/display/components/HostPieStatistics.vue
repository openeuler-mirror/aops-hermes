<script setup lang="ts">
import { EChartsOption, EChartsType, init } from 'echarts'
import { ref, watch } from 'vue'
import { useElementSize } from '@vueuse/core'

interface HostSummary {
  hostNum?: number
  onlineHostNum?: number
  offlineHostNum?: number
}

const props = defineProps<{
  hostInfo?: HostSummary
}>()

const hostPieRef = ref()
let hostPieChart: EChartsType | null = null

const { width: hostPieWidth } = useElementSize(hostPieRef)

function renderChart(hostSummary: HostSummary) {
  const chartOptionsDefault: EChartsOption = {
    legend: {
      bottom: '0%',
      right: '0%',
      orient: 'vertical',
    },
    series: [
      {
        type: 'pie',
        radius: ['72%', '80%'],
        avoidLabelOverlap: false,
        center: ['45%', '50%'],
        data: [
          {
            value: hostSummary.onlineHostNum || 0,
            name: '在线',
            itemStyle: {
              color: '#0062DC',
              shadowBlur: 10,
              shadowColor: 'rgba(0, 0, 0, 0.1)',
              shadowOffsetX: -5,
              shadowOffsetY: -5,
              borderWidth: 2,
              borderColor: '#ffffff',
            },
            emphasis: {
              scaleSize: 12,
            },
          },
          {
            value: hostSummary.offlineHostNum || 0,
            name: '离线',
            itemStyle: {
              color: '#2DB47C',
              shadowBlur: 10,
              shadowColor: 'rgba(0, 0, 0, 0.1)',
              shadowOffsetX: -5,
              shadowOffsetY: -5,
              borderWidth: 2,
              borderColor: '#ffffff',
            },
            emphasis: {
              scaleSize: 12,
            },
          },
        ],
        label: {
          show: false,
          position: 'inside',
          color: '#fff',
        },
      },
      {
        type: 'pie',
        radius: ['0%', '0%'],
        center: ['45%', '50%'],
        data: [
          {
            value: 1,
            itemStyle: {
              color: '#fff',
              borderColor: '#fff',
              borderWidth: 2,
            },
            label: {
              show: true,
              position: 'inside',
              color: '#000',
              fontFamily: 'Arial',
              formatter: `{a|主机数量}\n\n{b|${hostSummary.hostNum || 0}}`,
              rich: {
                a: {
                  fontSize: 26,
                  fontWeight: 'bold',
                },
                b: {
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
  hostPieChart?.setOption(chartOptionsDefault)
}

watch(
  () => hostPieWidth.value,
  () => {
    if (hostPieChart) hostPieChart?.resize()
    else {
      hostPieChart = init(hostPieRef.value)
    }
  },
)

watch(
  () => props.hostInfo,
  () => {
    if (!props.hostInfo) return
    renderChart(props.hostInfo)
  },
)
</script>
<template>
  <div class="flex w-full h-full p-[10px] px-[20px] relative">
    <span class="absolute left-[20px] top-[10px] text-[18px] font-semibold">纳管主机</span>
    <div ref="hostPieRef" class="w-full h-full" />
  </div>
</template>
<style scoped></style>
