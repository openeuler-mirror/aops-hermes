<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { api } from '@/api'
import type { HostsTableItem } from '@/api/paths/assests'

const props = defineProps<{
  hostGroup: string
}>()

const isLoading = ref(false)

const hostsTableColums = [
  {
    title: '主机名称',
    dataIndex: 'host_name',
  },
  {
    title: 'IP地址',
    dataIndex: 'host_ip',
  },
  {
    title: 'SSH登录端口',
    dataIndex: 'ssh_port',
  },
  {
    title: '管理节点',
    dataIndex: 'management',
  },
]

const tableData = ref<HostsTableItem[]>()

async function queryHostsWithGroup() {
  isLoading.value = true
  const [, res] = await api.getHosts({
    host_group_list: [props.hostGroup],
  })
  if (res)
    tableData.value = res.host_infos

  isLoading.value = false
}

onMounted(() => {
  queryHostsWithGroup()
})
</script>

<template>
  <a-table
    :row-key="(record:HostsTableItem) => `${record.host_name}${record.host_ip}`"
    :columns="hostsTableColums"
    :data-source="tableData"
    :loading="isLoading"
    :pagination="false"
  >
    <template #bodyCell="{ record, column }">
      <template v-if="column.dataIndex === 'management'">
        {{ record.management ? '是' : '否' }}
      </template>
    </template>
  </a-table>
</template>
