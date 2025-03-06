<script lang="ts" setup>
import { ElTable, ElTableColumn } from 'element-plus'
import { onMounted, ref } from 'vue'
import { useFlow } from '@aops-assistant/stores/flow'

export interface SyncHost {
  domain_name: string
  host_name: string
  host_ip: string
  status: string
  syncFileList: {
    filePath: string
    status: string
  }[]
}

const syncResultList = ref<SyncHost[]>([])

function initData() {
  const { currentFlowOutput } = useFlow()
  currentFlowOutput.forEach(item => {
    const domain = item.domain
    const host = item.data.map(
      (host: {
        host_id: string
        host_ip: string
        host_name: string
        syncResult: { filePath: string; result: string }[]
      }) => ({
        domain_name: domain,
        host_name: host.host_name || '',
        host_ip: host.host_ip || '',
        status: host.syncResult.every(({ result }) => result === 'SUCCESS') ? 'SUCCESS' : 'FAIL',
        syncFileList: host.syncResult.map(({ filePath, result }) => ({ filePath, status: result })) || [],
      }),
    )
    syncResultList.value = [...syncResultList.value, ...host]
  })
}

onMounted(() => {
  initData()
})
</script>

<template>
  <el-table
    :data="syncResultList"
    ref="multipleTableRef"
    row-key="host_ip"
    :header-cell-style="{ backgroundColor: 'rgb(244, 246, 250)', color: 'rgb(72, 88, 101)' }"
  >
    <el-table-column type="expand">
      <template #default="props">
        <el-table
          :data="props.row.syncFileList"
          :header-cell-style="{ backgroundColor: 'rgb(244, 246, 250)', color: 'rgb(72, 88, 101)' }"
        >
          <el-table-column label="配置路径" prop="filePath" />
          <el-table-column label="同步结果" prop="status">
            <template #default="fileSync">
              <span
                v-if="fileSync.row.status === 'SUCCESS'"
                class="px-[8px] py-[1px] rounded-[2px] bg-[#24ab36] text-[#fff] text-[12px]"
              >
                同步成功
              </span>
              <span
                v-else-if="fileSync.row.status === 'FAIL'"
                class="px-[8px] py-[1px] rounded-[2px] text-[#fff] text-[12px] bg-[#e32020]"
              >
                成功失败
              </span>
            </template>
          </el-table-column>
        </el-table>
      </template>
    </el-table-column>
    <el-table-column prop="host_name" label="主机名" />
    <el-table-column prop="host_ip" label="主机" />
    <el-table-column prop="domain_name" label="业务域" />
    <el-table-column prop="status" label="同步状态">
      <template #default="hostSync">
        <span
          v-if="hostSync.row.status === 'SUCCESS'"
          class="px-[8px] py-[1px] rounded-[2px] bg-[#24ab36] text-[#fff] text-[12px]"
        >
          同步成功
        </span>
        <span
          v-else-if="hostSync.row.status === 'FAIL'"
          class="px-[8px] py-[1px] rounded-[2px] text-[#fff] text-[12px] bg-[#e32020]"
        >
          成功失败
        </span>
      </template>
    </el-table-column>
  </el-table>
</template>
