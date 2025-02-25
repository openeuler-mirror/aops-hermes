<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import CveRiskStatistics from './components/CveRiskStatistics.vue'
import HostPieStatistics from './components/HostPieStatistics.vue'
import DomainStatistics from './components/DomainStatistics.vue'
import CveFixStatistics from './components/CveFixStatistics.vue'
import { useElementSize } from '@vueuse/core'
import { useCves } from '@aops-assistant/stores/cves'
import { storeToRefs } from 'pinia'

const overviewRef = ref<HTMLElement | null>(null)
const { width: overviewWidth } = useElementSize(overviewRef)

const { summaryInfo } = storeToRefs(useCves())

const flatWidth = ref((overviewWidth.value - 2 * 10) / 3)
const cvePanelWidth = ref(((overviewWidth.value - 2 * 10) / 3) * 1.5)
const hostPanelWidth = ref(((overviewWidth.value - 2 * 10) / 3) * 0.75)

watch(
  () => overviewWidth.value,
  (width) => {
    if (!width) return
    if (width < 700) {
      flatWidth.value = width / 1
      cvePanelWidth.value = width / 1
      hostPanelWidth.value = width / 1
    } else if (width < 900) {
      flatWidth.value = (width - 1 * 10) / 2
      cvePanelWidth.value = (width - 1 * 10) / 2
      hostPanelWidth.value = (width - 1 * 10) / 2
    } else {
      flatWidth.value = (width - 2 * 10) / 3
      cvePanelWidth.value = ((width - 2 * 10) / 3) * 1.5
      hostPanelWidth.value = ((width - 2 * 10) / 3) * 0.75
    }
  },
  {
    immediate: true,
  },
)

const hostStatisticsInfo = computed(() => ({
  hostNum: summaryInfo.value?.cluster_summary.host_num || 0,
  onlineHostNum: summaryInfo.value?.cluster_summary.online_host_num || 0,
  offlineHostNum: summaryInfo.value?.cluster_summary.offline_host_num || 0,
}))
const hostStatisticsList = computed(() => [
  {
    key: 'clusterNum',
    name: '集群数量',
    value: summaryInfo.value?.cluster_summary.cluster_num || 0,
  },
  {
    key: 'hostGroupNum',
    name: '主机组数量',
    value: summaryInfo.value?.cluster_summary.host_group_num || 0,
  },
  {
    key: 'hostNum',
    name: '主机数量',
    value: summaryInfo.value?.cluster_summary.host_num || 0,
  },
])
</script>
<template>
  <div class="w-full h-full">
    <div ref="overviewRef" class="w-full h-full">
      <div class="flex gap-[10px] flex-wrap">
        <div
          v-for="item in hostStatisticsList"
          :key="item.key"
          class="rounded-md flex items-center gap-3 bg-[var(--ops-bg-color)] px-5 py-3"
          :style="{ width: flatWidth + 'px', height: '100px' }"
        >
          <img class="h-[48px]" src="../../images/host.png" alt="" />
          <span class="text-base flex justify-between flex-1">
            <span>{{ item.name }}</span>
            <span class="font-medium text-[30px]">{{ item.value }}</span>
          </span>
        </div>
      </div>

      <div class="flex flex-wrap gap-[10px]">
        <div class="mt-[10px] h-[280px]">
          <CveRiskStatistics
            :style="{ width: cvePanelWidth + 'px' }"
            class="bg-[var(--ops-bg-color)] rounded-[5px]"
            :cve-summary="summaryInfo?.cve_summary"
          />
        </div>

        <div class="mt-[10px] h-[280px]">
          <HostPieStatistics
            :host-info="hostStatisticsInfo"
            :style="{ width: hostPanelWidth + 'px' }"
            class="bg-[var(--ops-bg-color)] rounded-[5px]"
          />
        </div>

        <div class="mt-[10px] h-[280px]">
          <DomainStatistics :style="{ width: hostPanelWidth + 'px' }" class="bg-[var(--ops-bg-color)] rounded-[5px]" />
        </div>
      </div>
    </div>

    <CveFixStatistics class="mt-[10px] rounded-[8px]" :summary-info="summaryInfo" />
  </div>
</template>

<style scoped>
.statistics {
  container-type: inline-size;
  container-name: statistics;
}
@container (min-width: 300px) {
  .statistics-panel {
    width: 100%;
  }
}

@container (min-width: 500px) {
  .statistics-panel {
    width: calc((100% - 20px) / 2);
  }
}

@container (min-width: 700px) {
  .statistics-panel {
    width: calc((100% - 20px) / 3);
  }
}
</style>
