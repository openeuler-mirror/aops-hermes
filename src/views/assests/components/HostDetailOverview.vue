<script lang="ts" setup>
import { useRoute } from 'vue-router'
import { computed, onMounted, ref } from 'vue'
import { RedoOutlined } from '@ant-design/icons-vue'
import { useI18n } from 'vue-i18n'
import { api } from '@/api'
import type { HostDetailInfo } from '@/api/paths/assests'

const { t } = useI18n()

const statusMap: Record<number, string> = {
  0: t('assests.online'),
  1: t('assests.offline'),
  2: t('assests.unknown'),
}

const route = useRoute()
const hostId = ref<string>('')

const isSpinning = ref(false)
const activeTotalKey = ref(['total'])
const memoryCollapseKey = ref([])
const diskCollapseKey = ref([])

const hostDetailInfo = ref<HostDetailInfo>()

async function queryHostDetail(hostId: string, refresh?: boolean) {
  isSpinning.value = true
  const [_, res] = await api.getHostById<HostDetailInfo>(hostId, false, refresh)
  if (res)

    hostDetailInfo.value = res
  isSpinning.value = false
}

/**
 * os info
 */
const osDescriptions = computed(() => {
  if (!hostDetailInfo.value?.os)
    return []
  const { os_version, kernel, bios_version } = hostDetailInfo.value.os || {}
  return [
    {
      label: t('assests.osVersion'),
      value: os_version,
    },
    {
      label: t('assests.kernel'),
      value: kernel,
    },
    {
      label: t('assests.biosVersion'),
      value: bios_version,
    },
  ]
})

/**
 * cpu info
 */
const cpuDescriptions = computed(() => {
  if (!hostDetailInfo.value?.cpu)
    return []
  const {
    architecture,
    l1d_cache,
    l1i_cache,
    l2_cache,
    l3_cache,
    core_count,
    vendor_id,
    model_name,
  } = hostDetailInfo.value.cpu || {}
  return [
    {
      label: t('assests.architecture'),
      value: architecture,
    },
    {
      label: t('assests.coreCount'),
      value: core_count,
    },
    {
      label: t('assests.manufacturer'),
      value: vendor_id,
    },
    {
      label: t('assests.modelName'),
      value: model_name,
    },
    {
      label: t('assests.l1dCache'),
      value: l1d_cache,
    },
    {
      label: t('assests.l1iCache'),
      value: l1i_cache,
    },
    {
      label: t('assests.l2cCche'),
      value: l2_cache,
    },
    {
      label: t('assests.l3Cache'),
      value: l3_cache,
    },
  ]
})

/**
 * memory info
 */
const memoryDescriptions = computed(() => {
  if (!hostDetailInfo.value?.memory)
    return []
  const { manufacturer, size, speed, type } = hostDetailInfo.value.memory.info[0] || {}
  return [
    {
      label: t('assests.size'),
      value: size,
    },
    {
      label: t('assests.type'),
      value: type,
    },
    {
      label: t('assests.speed'),
      value: speed,
    },
    {
      label: t('assests.architecture'),
      value: manufacturer,
    },
  ]
})

function refresh() {
  queryHostDetail(hostId.value, true)
}
onMounted(() => {
  hostId.value = route.params.id as string ?? undefined
  if (hostId.value)
    queryHostDetail(hostId.value)
})
</script>

<template>
  <a-spin size="large" :spinning="isSpinning">
    <a-collapse v-if="hostDetailInfo" v-model:activeKey="activeTotalKey" :bordered="false" expand-icon-position="end" ghost>
      <a-collapse-panel v-if="hostDetailInfo" key="total">
        <template #header>
          <a-tooltip placement="topLeft">
            <template #title>
              <span>{{ t('assests.tips.refresh') }}</span>
            </template>
            <a-button class="refresh" type="primary" @click.stop="refresh">
              <template #icon>
                <RedoOutlined />
              </template>
            </a-button>
          </a-tooltip>

          <a-row v-if="hostDetailInfo" class="host-info" :gutter="48">
            <a-col>
              <img class="host-info__img" src="@/assets/imgs/dash-host.png">
            </a-col>
            <a-col class="host-info__basic">
              <a-row type="flex">
                <a-col :span="12" class="row">
                  {{ `${t('assests.hostName')} : ${hostDetailInfo.host_name} ` }}
                </a-col>
                <a-col :span="12" class="row">
                  {{ `${t('assests.ip')} : ${hostDetailInfo.host_ip} ` }}
                </a-col>
              </a-row>
              <a-row type="flex">
                <a-col :span="12" class="row">
                  {{ `${t('assests.hostGroup')} : ${hostDetailInfo.host_group_name} ` }}
                </a-col>
                <a-col :span="12" class="row">
                  {{ `${t('assests.status')} : ${statusMap[hostDetailInfo.status] || t('common.none')}` }}
                </a-col>
              </a-row>
            </a-col>
          </a-row>
        </template>
        <a-descriptions
          v-if="osDescriptions.length"
          :title="t('assests.os')"
          :column="2"
          class="descriptions"
          :label-style="{ fontWeight: 'bold' }"
        >
          <template v-for="item in osDescriptions" :key="item.label">
            <a-descriptions-item :label="item.label">
              {{ item.value }}
            </a-descriptions-item>
          </template>
        </a-descriptions>

        <a-descriptions
          v-if="cpuDescriptions.length"
          :title="t('assests.cpu')"
          :column="4"
          class="descriptions"
          :label-style="{ fontWeight: 'bold' }"
        >
          <template v-for="item in cpuDescriptions" :key="item.label">
            <a-descriptions-item :label="item.label">
              {{
                item.value || t('common.none')
              }}
            </a-descriptions-item>
          </template>
        </a-descriptions>

        <a-descriptions
          v-if="hostDetailInfo.memory"
          :title="t('assests.memory')"
          :column="2"
          class="descriptions"
          :label-style="{ fontWeight: 'bold' }"
        >
          <a-descriptions-item :label="t('assests.memorySize')">
            {{
              hostDetailInfo.memory.size
            }}
          </a-descriptions-item>
          <a-descriptions-item :label="t('assests.memoryCount')">
            {{
              hostDetailInfo.memory.total
            }}
          </a-descriptions-item>

          <a-descriptions-item>
            <a-collapse v-model:activeKey="memoryCollapseKey" ghost expand-icon-position="end">
              <a-collapse-panel key="menory">
                <template #header>
                  <span style="font-weight: bold; font-size: 15px">{{ t('common.detail') }}</span>
                </template>
                <a-descriptions :column="4">
                  <template v-for="item in memoryDescriptions" :key="item.label">
                    <a-descriptions-item :label="item.label">
                      {{
                        item.value || t('common.none')
                      }}
                    </a-descriptions-item>
                  </template>
                </a-descriptions>
              </a-collapse-panel>
            </a-collapse>
          </a-descriptions-item>
        </a-descriptions>
        <a-descriptions
          v-if="hostDetailInfo.disk"
          :title="t('assests.disk')"
          :column="2"
          class="descriptions"
          :label-style="{ fontWeight: 'bold' }"
        >
          <a-descriptions-item :label="t('assests.diskCount')">
            {{
              hostDetailInfo.disk.length
            }}
          </a-descriptions-item>
          <a-descriptions-item />

          <a-descriptions-item>
            <a-collapse v-model:activeKey="diskCollapseKey" ghost expand-icon-position="end">
              <a-collapse-panel key="disk">
                <template #header>
                  <span style="font-weight: bold; font-size: 15px">{{ t('common.detail') }}</span>
                </template>
                <a-descriptions :column="2" :label-style="{ fontWeight: 'bold' }">
                  <template v-for="item in hostDetailInfo.disk" :key="item.label">
                    <a-descriptions-item :label="t('assests.capacity')">
                      {{
                        item.capacity || t('common.none')
                      }}
                    </a-descriptions-item>
                    <a-descriptions-item :label="t('assests.model')">
                      {{
                        item.model || t('common.none')
                      }}
                    </a-descriptions-item>
                  </template>
                </a-descriptions>
              </a-collapse-panel>
            </a-collapse>
          </a-descriptions-item>
        </a-descriptions>
      </a-collapse-panel>
    </a-collapse>
  </a-spin>
</template>

<style lang="less" scoped>
.host-info {
  padding: 20px;
  display: flex;
  align-items: center;
  &__img {
    display: inline-block;
    width: 70px;
    height: 70px;
    border-radius: 50%;
  }
  &__basic {
    flex: 1;
    font-weight: bold;
    .row {
      font-size: 16px;
    }
  }
}
.descriptions {
  border-top: 1px solid #f0f2f5;
  padding-top: 15px;
}
.ant-collapse:deep(.ant-collapse-header) {
  padding: 0;
}
.refresh {
  position: absolute;
  right: 0
}
</style>
