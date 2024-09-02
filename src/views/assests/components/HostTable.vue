<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { api } from '@/api'
import type { HostsTableItem } from '@/api/paths/assests'

const props = defineProps<{
  hostGroup: string
}>()

const { t } = useI18n()
const isLoading = ref(false)

const hostsTableColums = [
  {
    title: t('assests.hostName'),
    dataIndex: 'host_name',
  },
  {
    title: t('assests.ip'),
    dataIndex: 'host_ip',
  },
  {
    title: t('assests.sshPort'),
    dataIndex: 'ssh_port',
  },
  {
    title: t('assests.management'),
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
        {{ record.management ? t('common.yes') : t('common.no') }}
      </template>
    </template>
  </a-table>
</template>
