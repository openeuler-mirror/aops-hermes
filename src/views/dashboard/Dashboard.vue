<script lang="ts" setup>
import { init } from 'echarts'
import type { EChartsOption, EChartsType } from 'echarts'
import { onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import AlarmInformationStatistics from './components/AlarmInformationStatistics.vue'
import PageWrapper from '@/components/PageWrapper.vue'
import { api } from '@/api'
import { severityColorMap } from '@/conf'
import type { Cluster, CveCount } from '@/api'
import { useLangStore } from '@/store'

let chart: EChartsType | null = null

const { t } = useI18n()
const { lang } = storeToRefs(useLangStore())
const cvePieRef = ref<HTMLDivElement>()

const dashboardData = reactive<{
  hostCount: number
  hostAlarms: number
  clusters?: Cluster[]
  cveRiskOverview: CveCount
}>({
  hostCount: 0,
  hostAlarms: 0,
  cveRiskOverview: {
    Critical: 0,
    High: 0,
    Medium: 0,
    Low: 0,
    Unknown: 0,
  },
})

const option: EChartsOption = {
  legend: {
    top: '18%',
    right: 'right',
    itemWidth: 15,
    itemHeight: 8,
    icon: 'circle',
  },
  series: [
    {
      type: 'pie',
      radius: '92%',
      avoidLabelOverlap: false,
      center: ['35%', '50%'],
      label: {
        show: true,
        position: 'inside',
        color: '#fff',
        formatter: params => (params.value ? String(params.value) : ''),
      },
    },
  ],
}

async function queryHostsCount() {
  const [_, res] = await api.getHostCount()
  res && (dashboardData.hostCount = res.host_count)
}

async function queryHostsAlarms() {
  const [_, res] = await api.getHostAlarms()
  res && (dashboardData.hostAlarms = res.count)
}

async function queryCveOverview() {
  const [_, res] = await api.getCveOverview()
  if (res) {
    dashboardData.cveRiskOverview = res
    setChartData()
  }
}

function setChartData() {
  option.series![0].data = Object.keys(dashboardData.cveRiskOverview).map((key) => {
    return {
      value: dashboardData.cveRiskOverview[key],
      name: t(`vul.severityStatus.${key.toLowerCase()}`),
      itemStyle: {
        color: severityColorMap[key],
      },
    }
  })
  chart!.setOption(option)
}

async function queryClusters() {
  const [_, res] = await api.getClusters()
  if (res)
    dashboardData.clusters = res
}

watch(() => lang.value, () => {
  queryCveOverview()
})

onMounted(() => {
  queryHostsCount()
  queryHostsAlarms()
  queryClusters()
  queryCveOverview()
  chart = init(cvePieRef.value)
})

onBeforeUnmount(() => {
  if (chart)
    chart.dispose()
})
</script>

<template>
  <PageWrapper>
    <a-row type="flex" :gutter="20" style="margin-bottom: 0">
      <a-col :xs="24" :md="12" :xl="8" style="margin-bottom: 20px">
        <a-card>
          <a-row class="dash-card-samll" type="flex" justify="space-between" align="middle">
            <a-col>
              <a-space>
                <img class="card-icon" src="@/assets/imgs/dash-host.png" alt="">
                <span> {{ $t('dashboard.hostCount') }}</span>
              </a-space>
            </a-col>
            <a-col>
              <span class="card-value"> {{ dashboardData.hostCount }} </span>
            </a-col>
          </a-row>
        </a-card>
        <a-card>
          <a-row class="dash-card-samll" type="flex" justify="space-between" align="middle">
            <a-col>
              <a-space>
                <img class="card-icon" src="@/assets/imgs/dash-fault.png" alt="">
                <span> {{ $t('dashboard.alertCount') }}</span>
              </a-space>
            </a-col>
            <a-col>
              <span class="card-value"> {{ dashboardData.hostAlarms }} </span>
            </a-col>
          </a-row>
        </a-card>
        <a-card>
          <a-row class="dash-card-samll" type="flex" justify="space-between" align="middle">
            <a-col>
              <a-space>
                <img class="card-icon" src="@/assets/imgs/dash-host.png" alt="">
                <span> {{ $t('dashboard.clusterCount') }}</span>
              </a-space>
            </a-col>
            <a-col>
              <span class="card-value"> {{ dashboardData.clusters?.length }} </span>
            </a-col>
          </a-row>
        </a-card>
      </a-col>
      <a-col :xs="24" :md="12" :xl="8" style="margin-bottom: 20px">
        <a-card>
          <a-row class="sync-card" type="flex" align="middle" justify="space-between">
            <a-col>
              <a-progress
                type="circle"
                :percent="100"
                :stroke-width="20"
                :size="150"
                :show-info="false"
              />
            </a-col>
            <a-col>
              <div class="dash-sync-card-desc">
                <span class="small-title">
                  <a-badge status="processing" />
                  {{ $t('dashboard.domianSync') }}
                </span>
                <span class="data-number">100%</span>
              </div>
              <div class="dash-sync-card-desc">
                <span class="small-title">
                  <a-badge status="error" />
                  {{ $t('dashboard.domainUnSync') }}
                </span>
                <div class="data-number">
                  0
                </div>
              </div>
            </a-col>
          </a-row>
        </a-card>
      </a-col>
      <a-col :xs="24" :md="24" :xl="8" style="margin-bottom: 20px">
        <a-card>
          <div class="cve-card">
            <h3>{{ $t('dashboard.cveRisk') }}</h3>
            <div ref="cvePieRef" class="cve-pie-chart" />
          </div>
        </a-card>
      </a-col>
    </a-row>
    <AlarmInformationStatistics />
  </PageWrapper>
</template>

<style lang="less" scoped>
.dash-card-samll {
  height: 35px;
  .card-icon {
    width: 48px;
    height: 48px;
  }
  .card-value {
    font-size: 30px;
    font-weight: bold;
  }
}
.sync-card {
  height: 241px;
  padding: 5px;
  text-align: center;
}

.small-title {
  font-size: 14px;
  vertical-align: middle;
  margin-left: 4px;
  &-icon {
    margin-left: 2px;
  }
  &.short-length {
    display: inline-block;
    width: 60px;
  }
}
.data-number {
  display: block;
  font-size: 32px;
  font-weight: bold;
}

.cve-card {
  height: 241px;
  display: block;
  padding-top: 1px;
  h3 {
    font-weight: bold;
    font-size: 24px;
    margin-bottom: 0;
  }
  .cve-pie-chart {
    width: 87%;
    height: 170px;
    position: absolute;
  }
}
</style>
