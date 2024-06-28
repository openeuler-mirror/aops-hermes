<script lang="ts" setup>
import { useRoute } from 'vue-router'
import { computed, onMounted, ref } from 'vue'
import { RedoOutlined } from '@ant-design/icons-vue'
import { api } from '@/api'
import type { HostDetailInfo } from '@/api/paths/assests'

const statusMap: Record<number, string> = {
  0: '在线',
  1: '离线',
  2: '未确认',
  3: '在线',
  4: '在线',
  5: '未知',
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
      label: '操作系统版本',
      value: os_version,
    },
    {
      label: '内核版本',
      value: kernel,
    },
    {
      label: 'bios版本',
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
      label: '架构',
      value: architecture,
    },
    {
      label: '内核数',
      value: core_count,
    },
    {
      label: '厂商',
      value: vendor_id,
    },
    {
      label: 'model名称',
      value: model_name,
    },
    {
      label: 'L1d_cache',
      value: l1d_cache,
    },
    {
      label: 'L1i_cache',
      value: l1i_cache,
    },
    {
      label: 'L2_cache',
      value: l2_cache,
    },
    {
      label: 'L3_cache',
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
      label: '大小',
      value: size,
    },
    {
      label: '类型',
      value: type,
    },
    {
      label: '速度',
      value: speed,
    },
    {
      label: '架构',
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
              <span>查询主机最新的数据</span>
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
                  主机名：{{ hostDetailInfo.host_name }}
                </a-col>
                <a-col :span="12" class="row">
                  主机ip：{{ hostDetailInfo.host_ip }}
                </a-col>
              </a-row>
              <a-row type="flex">
                <a-col :span="12" class="row">
                  主机组： {{ hostDetailInfo.host_group_name }}
                </a-col>
                <a-col :span="12" class="row">
                  状态：{{ statusMap[hostDetailInfo.status] || '暂无' }}
                </a-col>
              </a-row>
            </a-col>
          </a-row>
        </template>
        <a-descriptions
          v-if="osDescriptions.length"
          title="操作系统"
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
          title="CPU信息"
          :column="4"
          class="descriptions"
          :label-style="{ fontWeight: 'bold' }"
        >
          <template v-for="item in cpuDescriptions" :key="item.label">
            <a-descriptions-item :label="item.label">
              {{
                item.value || `暂无`
              }}
            </a-descriptions-item>
          </template>
        </a-descriptions>

        <a-descriptions
          v-if="hostDetailInfo.memory"
          title="内存信息"
          :column="2"
          class="descriptions"
          :label-style="{ fontWeight: 'bold' }"
        >
          <a-descriptions-item label="内存大小">
            {{
              hostDetailInfo.memory.size
            }}
          </a-descriptions-item>
          <a-descriptions-item label="内存数量">
            {{
              hostDetailInfo.memory.total
            }}
          </a-descriptions-item>

          <a-descriptions-item>
            <a-collapse v-model:activeKey="memoryCollapseKey" ghost expand-icon-position="end">
              <a-collapse-panel key="menory">
                <template #header>
                  <span style="font-weight: bold; font-size: 15px">详情</span>
                </template>
                <a-descriptions :column="4">
                  <template v-for="item in memoryDescriptions" :key="item.label">
                    <a-descriptions-item :label="item.label">
                      {{
                        item.value || `暂无`
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
          title="硬盘信息"
          :column="2"
          class="descriptions"
          :label-style="{ fontWeight: 'bold' }"
        >
          <a-descriptions-item label="硬盘数量">
            {{
              hostDetailInfo.disk.length
            }}
          </a-descriptions-item>
          <a-descriptions-item />

          <a-descriptions-item>
            <a-collapse v-model:activeKey="diskCollapseKey" ghost expand-icon-position="end">
              <a-collapse-panel key="disk">
                <template #header>
                  <span style="font-weight: bold; font-size: 15px">详情</span>
                </template>
                <a-descriptions :column="2" :label-style="{ fontWeight: 'bold' }">
                  <template v-for="item in hostDetailInfo.disk" :key="item.label">
                    <a-descriptions-item label="容量">
                      {{
                        item.capacity || `暂无`
                      }}
                    </a-descriptions-item>
                    <a-descriptions-item label="模型">
                      {{
                        item.model || `暂无`
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
