<script setup lang="ts">
import { EChartsOption, EChartsType, init } from 'echarts'
import { ref, watch } from 'vue'
import { useElementSize } from '@vueuse/core'

const domainPieRef = ref()
let domainPieChart: EChartsType | null = null

const { width: domainPieWidth } = useElementSize(domainPieRef)

function renderChart() {
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
            value: 0,
            name: '已同步',
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
            value: 0,
            name: '未同步',
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
              formatter: `{a|业务域数量}\n\n{b|${0}}`,
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
  domainPieChart?.setOption(chartOptionsDefault)
}

watch(
  () => domainPieWidth.value,
  () => {
    if (domainPieChart) domainPieChart?.resize()
    else {
      domainPieChart = init(domainPieRef.value)
      renderChart()
    }
  },
)
</script>
<template>
  <div class="flex w-full h-full p-[10px] px-[20px] relative">
    <span class="absolute left-[20px] top-[10px] text-[18px] font-semibold">业务域</span>
    <div ref="domainPieRef" class="w-full h-full" />
  </div>
</template>
<style scoped></style>
