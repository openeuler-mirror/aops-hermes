<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElTable, ElTableColumn, ElPagination, ElConfigProvider } from 'element-plus'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import { useFlow } from '@aops-assistant/stores/flow'
import { queryChangeRecord } from '@aops-assistant/apis/host'
import type { ConfChangeRecord } from '@aops-assistant/apis/types'

const confRecords = ref<ConfChangeRecord[]>([])

async function initParams() {
  const { flowRequestParams } = useFlow()
  if (flowRequestParams) {
    pagination.currentPage = flowRequestParams.page
    pagination.pageSize = flowRequestParams.per_page
  }
}

const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0,
})

async function getConfChangeRecord() {
  const [, res] = await queryChangeRecord({
    page: pagination.currentPage,
    per_page: pagination.pageSize,
  })
  if (res) {
    confRecords.value = res.conf_change_records
    pagination.total = res.total_count
  }
}

function onPageChange(currentPage: number, pageSize: number) {
  pagination.currentPage = currentPage
  pagination.pageSize = pageSize
  getConfChangeRecord()
}

onMounted(() => {
  initParams()
  getConfChangeRecord()
})
</script>

<template>
  <div>
    <el-table
      :data="confRecords"
      :header-cell-style="{ backgroundColor: 'rgb(244, 246, 250)', color: 'rgb(72, 88, 101)' }"
    >
      <el-table-column prop="host_ip" label="主机IP" width="140" />
      <el-table-column prop="conf_name" label="配置" width="200" />
      <el-table-column prop="domain_name" label="业务域名称" width="200" />
      <el-table-column prop="create_time" label="配置修改时间" width="180" />
      <el-table-column prop="conf_change_record" label="配置变更记录" />
    </el-table>
    <div class="flex justify-end mt-[8px]">
      <ElConfigProvider :locale="zhCn">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 30, 40]"
          @change="onPageChange"
          background
          layout="sizes, prev, pager, next"
          :total="pagination.total"
        />
      </ElConfigProvider>
    </div>
  </div>
</template>
