<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { init } from 'echarts'
import { ElProgress } from 'element-plus'
import { useElementSize } from '@vueuse/core'

import type { EChartsType, EChartsOption } from 'echarts'
import type { CveSummary } from '../../../apis/types'

const props = defineProps<{
  cveSummary?: CveSummary
}>()

const { cvePieRef, progressList, totalCve } = useCvePieChart()

function useCvePieChart() {
  const cvePieRef = ref()
  let cvePieChart: EChartsType | null = null

  const { width: cvePieWidth } = useElementSize(cvePieRef)

  const totalCve = computed(() => {
    if (!props.cveSummary) return 0
    const { critical_num, high_num, medium_num, low_num, unknown_num } = props.cveSummary!
    return critical_num + high_num + medium_num + low_num + unknown_num
  })

  const progressList = computed(() => {
    if (!props.cveSummary) return []
    const { critical_num, high_num, medium_num, low_num, unknown_num } = props.cveSummary!
    return [
      {
        key: 'critical',
        name: '严重',
        color: '#f62f2f',
        value: critical_num,
      },
      {
        key: 'high',
        name: '高风险',
        color: '#fda72c',
        value: high_num,
      },
      {
        key: 'medium',
        name: '中风险',
        color: '#fde92c',
        value: medium_num,
      },
      {
        key: 'low',
        name: '低风险',
        color: '#3bd065',
        value: low_num,
      },
      {
        key: 'unknown',
        name: '低风险',
        color: '#ccc',
        value: unknown_num,
      },
    ]
  })

  function renderChart(data: CveSummary) {
    const { critical_num, high_num, medium_num, low_num, unknown_num } = data

    const chartOptionsDefault: EChartsOption = {
      series: [
        {
          type: 'pie',
          radius: ['72%', '80%'],
          avoidLabelOverlap: false,
          center: ['50%', '50%'],
          data: [
            {
              value: critical_num,
              name: '严重',
              itemStyle: {
                color: '#f62f2f',
                shadowBlur: 10,
                shadowColor: 'rgba(0, 0, 0, 0.05)',
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
              value: high_num,
              name: '高风险',
              itemStyle: {
                color: '#fda72c',
                shadowBlur: 10,
                shadowColor: 'rgba(0, 0, 0, 0.05)',
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
              value: medium_num,
              name: '中风险',
              itemStyle: {
                color: '#fde92c',
                shadowBlur: 10,
                shadowColor: 'rgba(0, 0, 0, 0.05)',
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
              value: low_num,
              name: '低风险',
              itemStyle: {
                color: '#3bd065',
                shadowBlur: 10,
                shadowColor: 'rgba(0, 0, 0, 0.05)',
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
              value: unknown_num,
              name: '未知',
              itemStyle: {
                color: '#fde92c',
                shadowBlur: 10,
                shadowColor: 'rgba(0, 0, 0, 0.05)',
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
          center: ['50%', '50%'],
          data: [
            {
              value: 1,
              name: '总数',
              label: {
                show: true,
                position: 'inside',
                color: '#000',
                formatter: `{a|cve数量}\n\n{b|${totalCve.value}}`,
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
    cvePieChart?.setOption(chartOptionsDefault)
  }

  watch(
    () => props.cveSummary,
    () => {
      if (!cvePieChart) return
      if (!props.cveSummary) return
      renderChart(props.cveSummary!)
    },
    {
      immediate: true,
    },
  )

  watch(
    () => cvePieWidth.value,
    () => {
      if (cvePieChart) cvePieChart?.resize()
      else {
        cvePieChart = init(cvePieRef.value)
        if (props.cveSummary) renderChart(props.cveSummary)
      }
    },
  )

  onMounted(() => {})

  onBeforeUnmount(() => {
    cvePieChart?.dispose()
    cvePieChart = null
  })

  return { cvePieRef, progressList, totalCve }
}
</script>
<template>
  <div class="flex w-full h-full p-[10px] px-[20px] relative">
    <span class="absolute left-[20px] top-[10px] text-[18px] font-semibold">cve风险</span>
    <div ref="cvePieRef" class="w-[50%] h-full" />
    <div class="flex-1 h-full flex flex-col justify-between py-[20px]">
      <div v-for="item in progressList" :key="item.key">
        <div class="flex justify-between px-[5px] mb-[5px] font-semibold">
          <span>{{ item.name }}</span>
          <span>{{ item.value }} · {{ `${((item.value / totalCve) * 100).toFixed(2)}%` }}</span>
        </div>
        <el-progress
          :text-inside="true"
          :color="item.color"
          :stroke-width="7"
          :show-text="false"
          :percentage="(item.value * 100) / totalCve"
        />
      </div>
    </div>
  </div>
</template>
<style scoped></style>
