<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import useCharts from '../hooks/useCharts'
import type { EChartsOption } from 'echarts'

const props = defineProps<{
  title?: string
  option?: EChartsOption
}>()

const chartEl = ref<HTMLElement | null>(null)

const { setChartOptions } = useCharts(chartEl)

watchEffect(() => {
  if (props.option) setChartOptions(props.option)
})
</script>
<template>
  <div class="chart">
    <div class="chart-header" v-if="props.title">{{ props.title }}</div>
    <div ref="chartEl" class="chart-body" />
  </div>
</template>

<style scoped lang="less">
.chart {
  width: 100%;
  height: 100%;
  position: relative;
  &-header {
    position: absolute;
    top: 24px;
    left: 24px;
    font-weight: 600;
    font-size: 16px;
  }
  &-body {
    width: 100%;
    height: 100%;
  }
}
</style>
