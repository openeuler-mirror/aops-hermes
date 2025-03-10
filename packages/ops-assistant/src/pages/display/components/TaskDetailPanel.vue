<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElDescriptions, ElDescriptionsItem } from 'element-plus'
import { queryTaskDetail, queryTaskExecuteStatus, queryCveFixInfo } from '@aops-assistant/apis/host'
import TaskStatus from './taskStatus.vue'
import type { TaskDetail } from '@aops-assistant/apis/types'
import dayjs from 'dayjs'
import { ElProgress, ElTable, ElTableColumn } from 'element-plus'
import TaskResult from './TaskResult.vue'

const props = defineProps<{
  taskId: string
  taskFixWay: 'coldpatch' | 'hotpatch'
}>()

const emits = defineEmits<{
  (e: 'finish', taskType: 'coldpatch' | 'hotpatch', taskStatus: 'succeed' | 'failed', taskResult: string): void
}>()

const taskDetail = ref<TaskDetail>()
const taskStatus = reactive({
  succeed: 0,
  fail: 0,
  running: 0,
  unknown: 0,
})

async function getTaskDetail(taskId: string) {
  const [, res] = await queryTaskDetail(taskId)
  if (res) {
    taskDetail.value = res
  }
}

let taskStatusTimer: NodeJS.Timer | null
async function queryTaskStatus(taskId: string) {
  const [, res] = await queryTaskExecuteStatus(taskId)
  if (res) {
    taskStatus.fail = res.result[taskId].fail
    taskStatus.succeed = res.result[taskId].succeed
    taskStatus.running = res.result[taskId].running
    taskStatus.unknown = res.result[taskId].unknown
  }
  if (taskStatus.running > 0) {
    taskStatusTimer = setTimeout(() => {
      queryTaskStatus(taskId)
    }, 5000)
  } else {
    getTaskDetail(taskId)
    emits(
      'finish',
      props.taskFixWay,
      `${taskStatus.fail > 0 || taskStatus.unknown > 0 ? 'failed' : 'succeed'}`,
      `${taskDetail.value?.task_name}任务执行完成，修复CVE: ${cveFixTableData.value![0].cve_num}个，执行失败主机： ${taskStatus.fail + taskStatus.unknown}台，执行成功主机： ${taskStatus.succeed}台`,
    )
    taskStatusTimer && clearTimeout(taskStatusTimer)
    taskStatusTimer = null
  }
}

const { tableData: cveFixTableData, getCveFixInfo } = useCveFix()

function useCveFix() {
  interface CveFixInfo {
    host_id: string
    host_ip: string
    host_name: string
    cve_num: number
    status: string
  }

  const tableData = ref<CveFixInfo[]>()
  async function getCveFixInfo(taskId: string) {
    const [, res] = await queryCveFixInfo(taskId)
    if (res) {
      tableData.value = res.result
      const isRunning = res.result.some(item => item.status === 'running')
      if (isRunning) {
        setTimeout(async () => {
          await getCveFixInfo(taskId)
        }, 3000)
      }
    }
  }

  return {
    tableData,
    getCveFixInfo,
  }
}

const centerDialogVisible = ref(false)

onMounted(async () => {
  if (!props.taskId) return
  await getCveFixInfo(props.taskId)
  await getTaskDetail(props.taskId)
  await queryTaskStatus(props.taskId)
})
</script>
<template>
  <div v-if="taskDetail" class="flex flex-col bg-[var(--ops-bg-color)] rounded-tr-[4px] rounded-b-[4px] p-[24px]">
    <div class="flex flex-col gap-3">
      <el-descriptions :column="1" border :label-width="120">
        <el-descriptions-item label="任务类型">{{ taskDetail.task_type }}</el-descriptions-item>
        <el-descriptions-item label="任务描述">{{ taskDetail.description }}</el-descriptions-item>
        <el-descriptions-item label="主机个数">{{ taskDetail.host_num }}</el-descriptions-item>
        <el-descriptions-item label="最新状态"><TaskStatus :status="taskStatus" /></el-descriptions-item>
        <el-descriptions-item label="上次执行时间">
          {{
            taskDetail.latest_execute_time
              ? dayjs(Number(taskDetail.latest_execute_time) * 1000).format('YYYY-MM-DD HH:mm:ss')
              : '未执行'
          }}
          <a
            class="ml-2"
            v-if="!taskStatus.running && taskDetail.latest_execute_time"
            @click="centerDialogVisible = true"
            >查看日志</a
          ></el-descriptions-item
        >
        <template #title>
          <h2>{{ taskDetail?.task_name }}</h2>
        </template>
      </el-descriptions>
    </div>
    <div class="mt-[12px]">
      <el-table
        :data="cveFixTableData"
        :header-cell-style="{
          backgroundColor: 'rgb(244, 246, 250)',
          color: 'rgb(78, 88, 101)',
        }"
      >
        <el-table-column prop="host_name" label="主机"></el-table-column>
        <el-table-column prop="host_ip" label="IP"></el-table-column>
        <el-table-column prop="cve_num" label="CVE数量"></el-table-column>
        <el-table-column prop="status" label="修复状态">
          <template #default="scoped">
            <div class="w-[150px] text-[11px]">
              <el-progress
                v-if="scoped.row.status === 'running'"
                :percentage="50"
                :show-text="false"
                :indeterminate="true"
              ></el-progress>
              <div
                v-else-if="scoped.row.status === 'succeed'"
                class="px-[8px] bg-[#24ab36] inline-block text-[#fff] rounded-[2px]"
              >
                修复成功
              </div>
              <div
                v-else-if="scoped.row.status === 'unknown'"
                class="bg-[#f1f2f6] inline-block text-[#fff] px-[8px] rounded-[2px]"
              >
                未知
              </div>
              <div v-else class="bg-[#E4211F] inline-block text-[#fff] px-[8px] rounded-[2px]">修复失败</div>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <!-- <div ref="chartRef" class="w-[50%]"></div> -->
    <TaskResult v-model:visible="centerDialogVisible" :task-id="taskId" />
  </div>
</template>
<style scoped>
:deep(.el-descriptions .el-descriptions__body .el-descriptions__table.is-bordered .el-descriptions__cell) {
  border: none;
  background: none;
  font-weight: 500;
  padding: 5px 0;
}
:deep(.el-descriptions .el-descriptions__header) {
  margin-bottom: 0;
}
</style>
