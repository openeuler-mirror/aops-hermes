import { onBeforeMount, ref, Ref } from 'vue'
import { init } from 'echarts'
import type { EChartsOption, EChartsType } from 'echarts'
import { watch } from 'vue'
import { useElementSize } from '@vueuse/core'

function useCharts(dom: Ref<HTMLElement | null>) {
  const chartOptions: Ref<EChartsOption> = ref({})
  let chart: EChartsType | null = null

  const domRef = dom

  const setChartOptions = (data: EChartsOption) => {
    chartOptions.value = data
  }

  const render = () => {
    if (!chartOptions.value) throw new Error('chart option is not exist')
    chart?.setOption(chartOptions.value)
  }

  onBeforeMount(() => {
    if (chart) chart.dispose()
  })

  watch(
    () => chartOptions.value,
    () => {
      if (!chart && domRef.value) chart = init(domRef.value)
      render()
    },
    { deep: true },
  )

  const { width } = useElementSize(domRef)

  watch(
    () => width.value,
    () => {
      chart?.resize()
    },
  )

  return {
    setChartOptions,
    render,
  }
}

export default useCharts
