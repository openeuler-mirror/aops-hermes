<script setup lang="ts">
import { computed, h, onBeforeMount, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  QuestionCircleOutlined,
  RedoOutlined,
  FileSearchOutlined,
  DeleteOutlined,
  CaretRightOutlined,
  PauseCircleOutlined,
  FileOutlined,
} from '@ant-design/icons-vue'
import { type TablePaginationConfig, message } from 'ant-design-vue'
import dayjs from 'dayjs'
import BatchExecution from './components/BatchExecution.vue'
import ExecutionTaskDetail from './components/ExecutionTaskDetail.vue'
import type { CommandTask, OperationTask } from '@/api'
import { api } from '@/api'
import { SorterResult } from 'ant-design-vue/es/table/interface'

const { t } = useI18n()

const taskExecutionStatusEnum = computed<Record<string, string>>(() => ({
  '200': 'SUCCESS',
  '201': 'RUNNABLE',
  '202': 'RUNNING',
  '203': 'PAUSE',
  '204': 'CANCELED',
  '206': 'PARTIAL_PASSED',
  '207': 'TIMEOUT',
  '208': 'WAITING',
  '209': 'NO_DATA_REPORTED',
  '400': 'FAILED',
  '401': 'SERVER_RESTART',
  '402': 'RECOVER',
  '600': 'UNKNOWN',
}))

const props = defineProps<{
  taskType: 'COMMAND_EXECUTION' | 'SCRIPT_EXECUTION'
}>()

const pagination = reactive<TablePaginationConfig>({
  total: 0,
  current: 1,
  pageSize: 10,
  showTotal: (total: number) => `${t('common.total', { count: total })}`,
  showSizeChanger: true,
  pageSizeOptions: ['10', '20', '30', '40'],
})

const tableColumn = computed(() => [
  {
    title: t('execution.task.taskName'),
    dataIndex: 'task_name',
  },
  {
    title: t('common.status'),
    dataIndex: 'status',
  },
  {
    title: t('execution.task.progress'),
    dataIndex: 'progress',
    width: 200,
  },
  {
    title: t('common.startTime', { type: t('common.excute') }),
    dataIndex: 'start_time',
  },
  {
    title: t('execution.task.duration'),
    dataIndex: 'duration',
  },
  {
    title: t('common.operation'),
    dataIndex: 'operation',
    align: 'center',
  },
])

const tableState = reactive<{
  isLoading: boolean
  selectedRowKeys: string[]
}>({
  isLoading: false,
  selectedRowKeys: [],
})

function onSelectChange(selectedRowKeys: string[]) {
  tableState.selectedRowKeys = selectedRowKeys
}

const commandTasks = ref<CommandTask[]>([])

let timer: NodeJS.Timer | null
/**
 * Query command tasks from the server and update the table with the results.
 *
 * If the tasks are still running, the function will call itself again after 5 seconds.
 * This continues until all tasks have completed.
 * If no tasks are running, the timer is set to null.
 *
 * The function returns a promise that resolves when the table has been updated with the latest results.
 */
async function getCommandTask() {
  tableState.isLoading = true
  tableState.selectedRowKeys = []
  const [, res] = await api.queryCommandTasks({
    page: pagination.current,
    per_page: pagination.pageSize,
    task_type: props.taskType,
  })

  if (res) {
    commandTasks.value = res.task_infos
    pagination.total = res.total_count
    if (res.task_infos.some((item) => item.status === '202')) {
      timer = setTimeout(() => {
        getCommandTask()
      }, 5000)
    } else {
      timer = null
    }
  }
  tableState.isLoading = false
}

async function deleteTasks(taskList?: string[]) {
  const tasks = taskList ?? tableState.selectedRowKeys

  if (!tasks.length) {
    message.info(t('execution.task.sentence.atLeastOneTaskDelete'))
    return
  }
  const [, res] = await api.deleteCommandTasks(tasks)
  if (res) {
    tableState.selectedRowKeys = []
    message.success(t('common.deleteSuccess'))
    refresh()
  }
}

function handleRefresh() {
  pagination.current = 1
  pagination.pageSize = 10
  getCommandTask()
}

const isBatchVisible = ref(false)
const isExecutionDetailVisible = ref(false)

const taskDetailParams = reactive({
  taskId: '',
  taskName: '',
})

function handleCheckDetail(task: OperationTask) {
  if (!task.end_time) {
    message.warning(t('execution.task.sentence.taskNotFinish'))
    return
  }

  taskDetailParams.taskId = task.task_id
  taskDetailParams.taskName = task.task_name
  isExecutionDetailVisible.value = true
}

const selectedTaskId = ref('')
function viewDetail(task: OperationTask) {
  selectedTaskId.value = task.task_id
  isBatchVisible.value = true
}

async function handleExecute(taskId: string, action: 'start' | 'retry' | 'cancel') {
  const [_] = await api.executeOperationTask(taskId, action)
  if (!_) {
    if (action === 'cancel') {
      timer && clearTimeout(timer)
      timer = null
    }
    getCommandTask()
  }
}

function handleTableChange(
  page: TablePaginationConfig,
  _filters: any,
  _sorter: SorterResult<CommandTask> | SorterResult<CommandTask>[],
) {
  page.current && (pagination.current = page.current)
  page.pageSize && (pagination.pageSize = page.pageSize)
  getCommandTask()
}

function refresh() {
  pagination.current = 1
  pagination.pageSize = 10
  getCommandTask()
}

watch(
  () => isBatchVisible.value,
  (val) => {
    if (!val) {
      selectedTaskId.value = ''
    }
  },
)

onBeforeMount(() => {
  getCommandTask()
})

onBeforeUnmount(() => {
  if (timer) clearTimeout(timer)
  timer = null
})
</script>

<template>
  <a-row type="flex" justify="space-between">
    <a-col></a-col>
    <a-col v-if="tableState.selectedRowKeys.length > 0">
      <a-alert type="info" show-icon class="delete-alert">
        <template #message>
          <span>{{
            t('common.selectItems', {
              count: tableState.selectedRowKeys.length,
            })
          }}</span>
          <a-divider type="vertical" />
          <a @click="tableState.selectedRowKeys = []"> {{ t('common.clear') }}</a>
        </template>
      </a-alert>
    </a-col>
    <a-col>
      <a-space>
        <a-button type="primary" @click="isBatchVisible = true"> {{ t('execution.task.newTask') }} </a-button>
        <a-button type="primary" @click="deleteTasks()"> {{ t('common.deleteBatch') }} </a-button>
        <a-button :icon="h(RedoOutlined)" @click="handleRefresh">
          {{ t('common.refresh') }}
        </a-button>
      </a-space>
    </a-col>
  </a-row>

  <a-table
    row-key="task_id"
    :data-source="commandTasks"
    :columns="tableColumn"
    :pagination="pagination"
    :loading="tableState.isLoading"
    :row-selection="{
      selectedRowKeys: tableState.selectedRowKeys,
      onChange: onSelectChange,
    }"
    @change="handleTableChange"
  >
    <template #bodyCell="{ column, record }">
      <template v-if="column.dataIndex === 'status'">
        {{ taskExecutionStatusEnum[record.status] || t('common.none') }}
      </template>
      <template v-if="column.dataIndex === 'progress'">
        <a-progress :percent="record.progress * 100" size="small" :status="record.progress === 1 ? 'none' : 'active'" />
      </template>
      <template v-if="column.dataIndex === 'start_time'">
        {{ record.start_time ? dayjs(record.start_time).format('YYYY-MM-DD HH:mm:ss') : t('common.none') }}
      </template>
      <template v-if="column.dataIndex === 'duration'">
        <span v-if="record.start_time && record.end_time">
          {{
            `${(dayjs(record.end_time).diff(dayjs(record.start_time), 'millisecond') / 1000).toFixed(2)}${t('common.secends')}` ||
            t('common.none')
          }}
        </span>
        <span v-else>{{ t('common.none') }}</span>
      </template>
      <template v-if="column.dataIndex === 'operation'">
        <div class="flex items-center justify-center">
          <a-tooltip placement="top">
            <template #title>
              <span>{{
                record.status === '202'
                  ? t('execution.task.cancelExecute')
                  : record.end_time
                    ? t('execution.task.retry')
                    : t('execution.task.startExecute')
              }}</span>
            </template>
            <a-button
              size="small"
              type="text"
              @click="
                handleExecute(record.task_id, record.status === '202' ? 'cancel' : record.end_time ? 'retry' : 'start')
              "
            >
              <template #icon>
                <PauseCircleOutlined v-if="record.status === '202'" />
                <RedoOutlined v-else-if="record.end_time" />
                <CaretRightOutlined v-else />
              </template>
            </a-button>
          </a-tooltip>
          <a-divider type="vertical" />
          <a-tooltip placement="top">
            <template #title>
              <span>{{ t('common.viewDetail') }}</span>
            </template>
            <a-button size="small" type="text" @click="viewDetail(record)">
              <template #icon>
                <FileOutlined />
              </template>
            </a-button>
          </a-tooltip>
          <a-divider type="vertical" />
          <a-tooltip placement="top">
            <template #title>
              <span>{{ t('execution.task.executeResult') }}</span>
            </template>
            <a-button size="small" type="text" @click="handleCheckDetail(record)">
              <template #icon>
                <FileSearchOutlined />
              </template>
            </a-button>
          </a-tooltip>

          <a-divider type="vertical" />
          <a-popconfirm
            :title="t('common.sentence.confirmDelete')"
            :ok-text="t('common.confirm')"
            :cancel-text="t('common.cancel')"
            @confirm="deleteTasks([record.task_id])"
          >
            <template #icon>
              <QuestionCircleOutlined style="color: red" />
            </template>
            <a-tooltip placement="top">
              <template #title>
                <span>{{ t('common.delete') }}</span>
              </template>
              <a-button size="small" type="text">
                <template #icon>
                  <DeleteOutlined />
                </template>
              </a-button>
            </a-tooltip>
          </a-popconfirm>
        </div>
      </template>
    </template>
  </a-table>

  <BatchExecution
    v-model:visible="isBatchVisible"
    :task-id="selectedTaskId"
    @success="handleRefresh"
    :task-type="taskType"
  />
  <ExecutionTaskDetail
    v-model:visible="isExecutionDetailVisible"
    :task-id="taskDetailParams.taskId"
    :task-name="taskDetailParams.taskName"
  />
</template>

<style scoped></style>

