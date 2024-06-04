<script lang="ts" setup>
import { QuestionCircleOutlined } from '@ant-design/icons-vue'
import { useRoute } from 'vue-router'
import { onMounted, ref } from 'vue'
import type { HostPluginInfo } from '@/api/paths/assests'
import { api } from '@/api'

const route = useRoute()

const sceneMap: Record<string, string> = {
  big_data: '大数据',
  web: 'web服务',
  edge: '边缘设备',
  cloud: '云服务',
  normal: '通用',
}
// #region ----------------------------------------< host plugin >----------------------------------------
const tableColumns = [
  {
    title: '名称',
    dataIndex: 'plugin_name',
    width: 120,
  },
  {
    title: '状态',
    dataIndex: 'status',
    width: 80,
  },
  {
    title: '插件资源',
    dataIndex: 'resource',
    width: 150,
  },
  {
    title: '探针',
    dataIndex: 'collect_items',
  },
]
const hostPluginTableData = ref<HostPluginInfo[]>()
const isLoading = ref(false)

async function getHostPlugins(hostId: number) {
  isLoading.value = true
  const [, res] = await api.queryHostPluginInfo(hostId)
  if (res) {
    hostPluginTableData.value = res.info.map(item => ({
      ...item,
      status: item.status === 'active',
    }))
  }
  isLoading.value = false
}

const modifiedPlugin = ref<
  {
    pluginName: string
    probeName: string
    status: string
  }[]
>([])

function handleItemChange(item: HostPluginInfo, index: number) {
  const { plugin_name } = item
  const modify = item.collect_items[index]
  const ind = modifiedPlugin.value.findIndex(
    item => item.pluginName === plugin_name && item.probeName === modify.probe_name,
  )
  const plugin = {
    pluginName: plugin_name,
    probeName: modify.probe_name,
    status: modify.probe_status,
  }
  if (ind > -1)
    modifiedPlugin.value.splice(ind, 1, plugin)
  else
    modifiedPlugin.value.push(plugin)
}

// const setPlugin = async () => {};
// #endregion

// #region ----------------------------------------< host scene >----------------------------------------

const sceneData = ref<{
  collect_items: string[]
  scene: string
}>()
const sceneLoading = ref(false)

async function sceneIdentify(hostId: number) {
  sceneLoading.value = true
  const [, res] = await api.getScene(hostId)
  if (res)
    sceneData.value = res

  sceneLoading.value = false
}
// #endregion
onMounted(() => {
  const hostId = Number(route.params.id) ?? undefined
  if (hostId) {
    getHostPlugins(hostId)
    sceneIdentify(hostId)
  }
})
</script>

<template>
  <a-row :gutter="24" type="flex" align="middle">
    <a-col>
      <a-button type="primary" :loading="sceneLoading" @click="sceneIdentify">
        场景识别
      </a-button>
    </a-col>
    <a-col v-if="sceneData" class="scene">
      <div>当前场景: {{ sceneMap[sceneData.scene] || '暂无' }}</div>
      <div>
        建议开启:
        <span v-for="(item, index) in sceneData.collect_items" :key="index" class="scene-item">{{
          item
        }}</span>
      </div>
    </a-col>
  </a-row>
  <a-divider />
  <a-row type="flex" justify="space-between">
    <a-col style="font-weight: bold">
      插件运行信息
    </a-col>
    <a-col>
      <a-space>
        <a-button :disabled="!modifiedPlugin.length" @click="modifiedPlugin = []">
          取消
        </a-button>
        <a-button type="primary" :disabled="!modifiedPlugin.length">
          保存
        </a-button>
      </a-space>
    </a-col>
  </a-row>
  <a-table
    :columns="tableColumns"
    :data-source="hostPluginTableData"
    :scroll="{ y: 400 }"
    :pagination="false"
    :loading="isLoading"
  >
    <template #headerCell="{ column }">
      <template v-if="column.dataIndex === 'resource'">
        插件资源<a-tooltip placement="top">
          <template #title>
            <span>当前值 / 限定值</span>
          </template>
          <QuestionCircleOutlined style="margin-left: 5px" />
        </a-tooltip>
      </template>
    </template>
    <template #bodyCell="{ record, column }">
      <template v-if="column.dataIndex === 'status'">
        <a-switch
          v-model:checked="record.status"
          checked-children="on"
          un-checked-children="off"
        />
      </template>
      <template v-if="column.dataIndex === 'resource'">
        <template v-if="record.status && record.is_installed">
          <div v-for="(item, index) in record.resource" :key="index">
            <span>{{ `${item.name}:` }}</span>
            <br>
            <span>{{ `${item.current_value} / ${item.limit_value}` }}</span>
          </div>
        </template>
      </template>
      <template v-if="column.dataIndex === 'collect_items'">
        <template v-if="record.status && record.is_installed">
          <span v-for="(item, index) in record.collect_items" :key="index" class="collect-items">
            <a-space :size="30">
              <span>{{ item.probe_name }}: </span>
              <a-radio-group
                v-model:value="item.probe_status"
                size="small"
                button-style="solid"
                @change="handleItemChange(record, index)"
              >
                <a-radio-button value="on"> on </a-radio-button>
                <a-radio-button value="off"> off </a-radio-button>
                <a-radio-button v-if="item.support_auto" value="auto"> auto </a-radio-button>
              </a-radio-group>
            </a-space>
          </span>
        </template>
        <span v-else-if="!record.is_installed">插件未安装，暂无数据</span>
        <span v-else-if="!record.status">插件已关闭，暂无服务信息</span>
      </template>
    </template>
  </a-table>
</template>

<style lang="less" scoped>
.scene {
  font-size: 11px;
  &-item:not(:first-child) {
    padding-left: 10px;
  }
}
.collect-items {
  display: inline-block;
  min-width: 220px;
  padding: 7px 10px;
  width: 50%;
}
</style>
