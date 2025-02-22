import { EChartsOption } from 'echarts'

export const chartOptionsDefault: EChartsOption = {
  title: {
    text: ``,
    top: '42%',
    left: '38%',
    textStyle: {
      fontSize: 15,
      color: '#ffffff',
    },
    textAlign: 'center',
  },
  legend: {
    top: '18%',
    right: '2%',
    itemWidth: 24,
    itemHeight: 12,
    orient: 'vertical',
    textStyle: {
      color: '#ffffff',
    },
  },
  series: [
    {
      type: 'pie',
      radius: ['45%', '65%'],
      avoidLabelOverlap: false,
      center: ['40%', '50%'],
      data: [],
      label: {
        show: true,
        position: 'inside',
        color: '#fff',
      },
    },
  ],
}

export function getChartOptions(
  title: string,
  data: Array<{ value: number | string; name: string; color: string }>,
  count?: number,
): EChartsOption {
  const options = JSON.parse(JSON.stringify(chartOptionsDefault))
  options.title.text = title
  options.series[0].data = data.map((item) => ({
    value: item.value,
    name: item.name,
    itemStyle: {
      color: item.color,
    },
  }))
  options.series[0].label.formatter = (params: any) => {
    if (count === undefined) {
      return params.value || ''
    }
    return `${(params.value / count) * 100}%`
  }
  return options
}

export const RECOMMENDED_MAP = {}
