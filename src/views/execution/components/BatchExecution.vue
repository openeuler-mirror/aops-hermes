<script setup lang="ts">
import { type TableColumnsType, message } from 'ant-design-vue'
import { computed, reactive, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import type { Rule } from 'ant-design-vue/es/form'
import type { Command, HostsTableItem, Operation } from '@/api'
import { api } from '@/api'
import { useClusterStore } from '@/store/useClusterStore'
import dayjs, { Dayjs } from 'dayjs'
import CronSelect from '@aops/cron-select'
import { useLangStore } from '@/store/langStore'

const cronReflect = ['second', 'minute', 'hour', 'day', 'month', 'day_of_week', 'year']

interface Form {
  task_name: string
  host_group?: string
  hostIps?: string
  hosts: string[]
  command_list: string[]
  onlyPush?: boolean
  isDelay?: boolean
  execution_time?: string
  cron?: string
  strategy: 'single' | 'cron'
  remotePath?: string
}
interface Selectoption {
  label: string
  value: string
}

const props = withDefaults(
  defineProps<{
    visible: boolean
    taskType: 'COMMAND_EXECUTION' | 'SCRIPT_EXECUTION'
    taskId?: string
  }>(),
  {
    visible: false,
  },
)
const emits = defineEmits(['update:visible', 'success'])
const { t } = useI18n()
const { lang } = storeToRefs(useLangStore())
const { hostGroups: hostGroupOptions } = storeToRefs(useClusterStore())

const isModalVisible = computed(() => props.visible)
const isBatchImport = ref(false)

const commandList = ref<Command[]>([])
const operationList = ref<Operation[]>([])

const commandOptions = computed<Selectoption[]>(() =>
  props.taskType === 'COMMAND_EXECUTION'
    ? commandList.value.map(i => ({
        label: i.command_name,
        value: i.command_id,
      }))
    : operationList.value.map(i => ({
        label: i.operate_name,
        value: i.operate_id,
      })),
)

const formRef = ref()
const form = reactive<Form>({
  task_name: '',
  hosts: [],
  hostIps: '',
  host_group: undefined,
  command_list: [],
  onlyPush: false,
  isDelay: false,
  execution_time: '',
  strategy: 'single',
  cron: '0 0 0 * * ? *',
  remotePath: '',
})

function remotePath(_rule: Rule, value: string) {
  if (!value) return Promise.reject(new Error(t('execution.task.validate.requireRemotePath')))
  const regex = /^(?!.*(?:\.|\.\.)).+$/
  if (!regex.test(value)) {
    return Promise.reject(new Error(t('execution.task.validate.remotePath')))
  }
  return Promise.resolve()
}

function executionTimeValidate(_rule: Rule, value: string) {
  if (!value) return Promise.reject(new Error(t('execution.task.validate.requireExecutiontime')))
  if (dayjs(value) < dayjs()) {
    return Promise.reject(new Error(t('execution.task.validate.executeTimeLimit')))
  }

  return Promise.resolve()
}

const rules = computed<Record<string, Rule[]>>(() => {
  return {
    task_name: [
      { required: true, message: t('execution.task.validate.requireTaskName') },
      {
        max: 128,
        trigger: 'blur',
        message: t('execution.script.validate.notOver128Character', { key: t('execution.task.taskName') }),
      },
    ],
    host_group: [{ required: true, message: t('execution.task.validate.requireHostGroup') }],
    hosts: [{ required: true, message: t('execution.task.validate.requireHosts') }],
    command_list: [{ required: true, message: t('execution.task.validate.requireCommandList') }],
    onlyPush: [{ required: true }],
    hostIps: [{ required: true, message: t('execution.task.validate.requireHostIps') }],
    isDelay: [{ required: true }],
    execution_time: [
      { required: true, message: '' },
      {
        validator: executionTimeValidate,
        trigger: 'blur',
      },
    ],
    cron: [{ required: true, message: t('execution.task.validate.requireCron') }],
    strategy: [{ required: true }],
    remotePath: [
      { required: true, message: '' },
      {
        validator: remotePath,
        trigger: 'blur',
      },
    ],
  }
})

const hostTableColumn = computed(() => {
  const columns = [
    {
      title: t('execution.task.host'),
      dataIndex: 'host_name',
    },
    {
      title: t('execution.task.hostIp'),
      dataIndex: 'host_ip',
    },
  ]
  if (!props.taskId) {
    columns.push({
      title: t('common.operation'),
      dataIndex: 'operation',
    })
  }
  return columns
})

const commandTableData = ref<
  {
    action_id: string
    name: string
    content?: string
  }[]
>([])
const commandTableColumn = computed<TableColumnsType>(() => {
  const columns = [
    {
      title: t('execution.task.commandName'),
      dataIndex: 'name',
    },
    {
      title: t('execution.task.commandContent'),
      dataIndex: 'content',
      width: '50%',
    },
  ]
  if (props.taskType === 'COMMAND_EXECUTION' && !props.taskId) {
    columns.unshift({
      title: t('execution.task.executeIndex'),
      dataIndex: 'order',
    })
    columns.push({
      title: t('common.operation'),
      dataIndex: 'operation',
    })
  }
  return columns
})

/**
 * custom table header style
 */
function customHeaderRow() {
  return {
    style: {
      'font-size': '12px',
    },
  }
}

async function getAllCommands() {
  const [, res] = await api.queryCommands()
  if (res) {
    commandList.value = res.command_infos
  }
}

async function getAllOperations() {
  const [, res] = await api.queryOperations()
  if (res) {
    operationList.value = res.operate_infos
  }
}

function handleSelectedHostGroupChange(value: string) {
  if (!value) return
  form.hosts = []
  hostTableData.value = []
  getHostsByGroup(value)
}

const hostOptions = ref<HostsTableItem[]>([])

/**
 * Retrieves a list of hosts belonging to a specific host group.
 *
 * @param {string} hostGroupId - The ID of the host group to retrieve hosts from.
 * @return {void}
 */
async function getHostsByGroup(hostGroupId: string): Promise<void> {
  const [, res] = await api.getHosts({
    host_group_list: [hostGroupId],
  })
  if (res) {
    hostOptions.value = res.host_infos
    if (hostOptions.value.length === 0) message.info(t('execution.task.sentence.noHostInGroup'))
  }
}

const hostTableData = ref<
  { host_id: string; host_name: string; host_ip: string; host_group_id: string; host_group: string }[]
>([])

/**
 * Updates the host table data based on the selected host IDs.
 *
 * @param {string[]} value - An array of selected host IDs.
 * @return {void}
 */
function handleHostChange(value: string[]): void {
  const hosts = hostOptions.value
    .filter(i => value.includes(i.host_id))
    .map(host => ({
      host_id: host.host_id,
      host_ip: host.host_ip,
      host_name: host.host_name,
      host_group_id: form.host_group!,
      host_group: host.host_group_name,
    }))
  hostTableData.value = hosts
}

function handleHostDelete(hostId: string) {
  hostTableData.value = hostTableData.value.filter(i => i.host_id !== hostId)
  form.hosts = form.hosts.filter(i => i !== hostId)
}

/** delete command with command id  */
function handleCommandDelete(actionId: string) {
  commandTableData.value = commandTableData.value.filter(i => i.action_id !== actionId)
  if (props.taskType === 'COMMAND_EXECUTION') {
    form.command_list = form.command_list.filter(i => i !== actionId)
  } else {
    form.command_list = []
  }
}

function handleCommandChange(value: string | string[], _option: Selectoption | Array<Selectoption>) {
  if (!Array.isArray(value)) {
    value = [value]
  }

  if (props.taskType === 'COMMAND_EXECUTION') {
    commandTableData.value = commandList.value
      .filter(i => value.includes(i.command_id))
      .map(i => ({
        action_id: i.command_id,
        name: i.command_name,
        content: i.content,
      }))
  } else {
    commandTableData.value = operationList.value
      .filter(i => value.includes(i.operate_id))
      .map(i => ({
        action_id: i.operate_id,
        name: i.operate_name,
      }))
  }
}

/** cancel to create exectution task */
function handleCancel() {
  initTaskFromData()
  emits('update:visible', false)
}

/**
 * Move two table rows relative to each other
 * @param type
 * @param id
 */
function move(type: 'up' | 'down', id: string) {
  if (!type) return
  const idx = commandTableData.value.findIndex(i => i.action_id === id)
  if (idx === -1) return
  if (type === 'up') {
    ;[commandTableData.value[idx], commandTableData.value[idx - 1]] = [
      commandTableData.value[idx - 1],
      commandTableData.value[idx],
    ]
  } else {
    ;[commandTableData.value[idx], commandTableData.value[idx + 1]] = [
      commandTableData.value[idx + 1],
      commandTableData.value[idx],
    ]
  }
}

/**
 * Handles the enter event for host IPs input.
 *
 * @param {KeyboardEvent} e - The keyboard event triggered by the enter key press.
 * @return {Promise<void>} A promise that resolves when the host IP query is complete.
 */
async function handleIpsEnter(e?: KeyboardEvent): Promise<void> {
  e && e.preventDefault()
  if (!form.hostIps) return
  const ipList = form.hostIps.split(',').map(i => i.trim())
  const [_, res] = await api.queryHostInfoByHostIps(ipList)
  if (res) {
    const exitedHost = res.hosts
    const notExitedHost = res.not_found_ips
    if (notExitedHost.length > 0) {
      message.warning(t('execution.task.sentence.filterHostIp', { ipStr: notExitedHost.join(',') }))
      form.hostIps = exitedHost.map(host => host.host_ip).join(',')
    }
    hostTableData.value = exitedHost.map(host => ({
      host_id: host.host_id,
      host_name: host.host_name,
      host_ip: host.host_ip,
      host_group_id: host.host_group_name,
      host_group: host.host_group_name,
    }))
  }
}

const isSubmiting = ref(false)
async function handleConfirm(type: 'create' | 'update') {
  isSubmiting.value = true
  try {
    await formRef.value.validate()
    if (type === 'create') {
      await createTask()
    } else {
      await updateTask()
    }
  } catch {
  } finally {
    isSubmiting.value = false
  }
}

/**
 * Creates a new task by calling the `/tasks` endpoint with the provided
 * parameters.
 *
 * @return {Promise<void>} A promise that resolves when the task creation is
 * complete.
 */
async function createTask(): Promise<void> {
  const { task_name, isDelay, execution_time, onlyPush, strategy, cron } = form
  let cronInfo: any = {}
  if (strategy === 'cron' && cron) {
    cron.split(' ').forEach((i, idx: number) => {
      if (i === '?') return
      if (cronReflect[idx] === 'day_of_week') {
        cronInfo[cronReflect[idx]] = String(Number(i) - 1)
        return
      }
      cronInfo[cronReflect[idx]] = i
    })
  }

  if (hostTableData.value.map((i) => i.host_id).length === 0) {
    handleIpsEnter()
  }

  const taskParams = {
    task_name: task_name,
    host_ids: hostTableData.value.map((i) => i.host_id),
    action_ids: commandTableData.value.map((i) => i.action_id),
    task_type: props.taskType,
    only_push: props.taskType === 'SCRIPT_EXECUTION' ? onlyPush : undefined,
    remote_path: props.taskType === 'SCRIPT_EXECUTION' ? (form.remotePath ? form.remotePath : undefined) : undefined,
    scheduler_info: isDelay
      ? strategy === 'single'
        ? {
            type: strategy,
            params: {
              run_date: execution_time,
            },
          }
        : {
            type: strategy,
            params: cronInfo,
          }
      : undefined,
  }

  const [_] = await api.generateTask(taskParams)
  if (!_) {
    message.success(t('common.createSuccess'))
    initTaskFromData()
    emits('update:visible', false)
    emits('success')
  }
}

async function updateTask() {
  const { isDelay, execution_time, strategy, cron } = form
  let cronInfo: any = {}
  if (strategy === 'cron' && cron) {
    cron.split(' ').forEach((i, idx: number) => {
      if (i === '?') return
      if (cronReflect[idx] === 'day_of_week') {
        cronInfo[cronReflect[idx]] = String(Number(i) - 1)
        return
      }
      cronInfo[cronReflect[idx]] = i
    })
  }

  const schedulerInfo = isDelay
    ? strategy === 'single'
      ? {
          type: strategy,
          params: {
            run_date: execution_time,
          },
        }
      : {
          type: strategy,
          params: cronInfo,
        }
    : undefined

  const [_] = await api.updateOperateTask(props.taskId!, schedulerInfo)

  if (!_) {
    message.success(t('common.editSuccess'))
    initTaskFromData()
    emits('update:visible', false)
    emits('success')
  }
}

function onCancelBatchImport() {
  isBatchImport.value = false
  form.hosts = []
  hostTableData.value = []
  form.host_group = undefined
}

function onBatchImport() {
  isBatchImport.value = true
  form.hostIps = ''
  hostTableData.value = []
}

function handleDateChange(_value: Dayjs, dateString: string) {
  if (!dateString) return
  form.execution_time = dateString
}

function initTaskFromData() {
  formRef.value.resetFields()
  isBatchImport.value = false
  hostOptions.value = []
  hostTableData.value = []
  commandTableData.value = []
  form.host_group = undefined
  form.isDelay = false
  form.command_list = []
  form.hosts = []
  form.execution_time = ''
  ;(form.cron = '0 0 0 * * ? *'), (form.strategy = 'single')
}

const datePicker = computed(() => {
  return form.execution_time ? dayjs(form.execution_time) : null
})

const disabledDate = (current: Dayjs) => {
  return current && current < dayjs().subtract(1, 'day').endOf('day')
}

async function getTaskInfoByTaskId(taskId: string) {
  const [, res] = await api.queryTaskInfoByTaskId(taskId)

  if (res) {
    const taskDetail = JSON.parse(res.task_detail)
    isBatchImport.value = true
    form.hostIps = taskDetail.node_list.map((i: any) => i.ip).join(',')

    hostTableData.value = taskDetail.node_list.map((i: any) => ({
      host_id: i.host_id,
      host_ip: i.ip,
      host_name: i.host_name,
      host_group_id: i.host_group_name,
      host_group: i.host_group_name,
    }))
    form.isDelay = taskDetail.ext_props.scheduler_info ? true : false
    form.strategy = taskDetail.ext_props.scheduler_info?.type
    form.task_name = taskDetail.task_name
    form.onlyPush = taskDetail.ext_props.only_push
    form.remotePath = taskDetail.ext_props.remote_path || ''
    form.command_list = taskDetail.actions

    if (props.taskType === 'COMMAND_EXECUTION') {
      commandTableData.value = commandList.value
        .filter((i) => taskDetail.actions.includes(i.command_id))
        .map((i) => ({
          action_id: i.command_id,
          name: i.command_name,
          content: i.content,
        }))
    } else if (props.taskType === 'SCRIPT_EXECUTION') {
      commandTableData.value = operationList.value
        .filter((i) => form.command_list.includes(i.operate_id))
        .map((i) => ({
          action_id: i.operate_id,
          name: i.operate_name,
        }))
    }

    if (form.strategy === 'cron') {
      const cornParams = taskDetail.ext_props.scheduler_info?.params
      form.cron = `${cornParams.second} ${cornParams.minute} ${cornParams.hour} ${cornParams.day || '?'} ${cornParams.month || '?'} ${cornParams.day_of_week ? String(Number(cornParams.day_of_week) + 1) : '?'} ${cornParams.year || ''}`
    } else if (form.strategy === 'single') {
      form.execution_time = taskDetail.ext_props.scheduler_info?.params.run_date
    }
  }
}

watch(
  () => props.visible,
  async () => {
    if (!props.visible) return
    if (props.taskType === 'COMMAND_EXECUTION') {
      await getAllCommands()
    } else {
      await getAllOperations()
    }
    if (props.taskId) {
      await getTaskInfoByTaskId(props.taskId)
    }
  },
)
</script>

<template>
  <div class="batch-execution">
    <a-modal
      :open="isModalVisible"
      :title="props.taskId ? t('execution.task.editTask') : t('execution.task.newTask')"
      :style="{ width: '60%' }"
      :confirmLoading="isSubmiting"
      @cancel="handleCancel"
      @ok="taskId ? handleConfirm('update') : handleConfirm('create')"
    >
      <a-form ref="formRef" style="margin-top: 20px" :rules="rules" :model="form" :wrapper-col="{ span: 24 }">
        <a-form-item name="task_name" :label="t('execution.task.taskName')" class="w-[40%]">
          <a-input
            v-model:value="form.task_name"
            :placeholder="t('execution.task.placeHolder.requireTaskName')"
            autocomplete="off"
            :disabled="Boolean(taskId)"
          />
        </a-form-item>

        <div v-if="!taskId">
          <div class="flex items-start w-[100%] gap-2" v-if="!isBatchImport">
            <a-form-item name="host_group" :label="t('execution.task.hostSelect')" class="w-[40%]">
              <a-select
                v-model:value="form.host_group"
                :placeholder="t('execution.task.placeHolder.requireHostGroup')"
                @change="handleSelectedHostGroupChange"
              >
                <a-select-option
                  v-for="hostGroup in hostGroupOptions"
                  :key="hostGroup.host_group_id"
                  :value="hostGroup.host_group_id"
                >
                  {{ hostGroup.host_group_name }}
                </a-select-option>
              </a-select>
            </a-form-item>

            <a-form-item v-if="hostOptions.length" name="hosts" class="flex-1">
              <div class="w-full flex flex-row gap-3">
                <a-select
                  v-model:value="form.hosts"
                  mode="multiple"
                  :max-tag-count="2"
                  :placeholder="t('execution.task.placeHolder.requireHost')"
                  @change="handleHostChange"
                >
                  <a-select-option v-for="host in hostOptions" :key="host.host_id" :value="host.host_id">
                    {{ host.host_name }}
                  </a-select-option>
                </a-select>
              </div>
            </a-form-item>
            <a-form-item>
              <a-button type="primary" @click="onBatchImport" v-show="!taskId">{{
                t('execution.task.batchImportHost')
              }}</a-button>
            </a-form-item>
          </div>

          <div class="flex items-start w-[100%] gap-2" v-else>
            <a-form-item name="hostIps" :label="t('execution.task.hostImport')" class="w-[90%]">
              <a-textarea
                v-model:value="form.hostIps"
                :autoSize="{ minRows: 2, maxRows: 5 }"
                :placeholder="t('execution.task.placeHolder.requireHostArea')"
                @pressEnter="handleIpsEnter"
                @blur="handleIpsEnter"
              />
            </a-form-item>

            <a-form-item>
              <a-button type="primary" @click="onCancelBatchImport" v-show="!taskId">{{
                t('execution.task.cancelBatchImport')
              }}</a-button>
            </a-form-item>
          </div>
        </div>

        <a-form-item v-if="hostTableData.length">
          <a-table
            size="small"
            :data-source="hostTableData"
            :columns="hostTableColumn"
            :custom-header-row="customHeaderRow"
            :pagination="false"
            :scroll="{ y: 160 }"
          >
            <template #emptyText>
              <div>{{ t('common.none') }}</div>
            </template>
            <template #bodyCell="{ record, column }">
              <template v-if="column.dataIndex === 'operation'">
                <a @click="handleHostDelete(record.host_id)">{{ t('common.delete') }}</a>
              </template>
            </template>
          </a-table>
        </a-form-item>

        <a-form-item name="isDelay" :label="t('execution.task.scheduledTask')" class="w-[40%]">
          <a-switch v-model:checked="form.isDelay" />
        </a-form-item>

        <div class="flex items-start w-[100%] gap-2" v-if="form.isDelay">
          <a-form-item name="strategy" :label="t('execution.task.executionStrategy')" class="w-[70%]">
            <a-radio-group v-model:value="form.strategy" button-style="solid">
              <a-radio-button value="single">{{ t('execution.task.singleExecution') }}</a-radio-button>
              <a-radio-button value="cron">{{ t('execution.task.cycleExecution') }}</a-radio-button>
            </a-radio-group>
            <a-form-item name="execution_time" v-if="form.strategy === 'single'">
              <a-date-picker
                :value="datePicker"
                :showNow="false"
                :disabled-date="disabledDate"
                :placeholder="t('execution.task.placeHolder.requireExecutiontime')"
                @change="handleDateChange"
                :show-time="{ defaultValue: dayjs('00:00:00', 'HH:mm:ss') }"
              />
            </a-form-item>
            <a-form-item name="cron" v-else>
              <a-space>
                <CronSelect :cron="form.cron" @change="(val) => (form.cron = val)" :lang="lang" />
              </a-space>
            </a-form-item>
          </a-form-item>
        </div>

        <a-form-item
          name="command_list"
          :label="
            taskType === 'SCRIPT_EXECUTION' ? t('execution.task.operateSelect') : t('execution.task.commandSelect')
          "
          class="w-[100%]"
        >
          <a-select
            v-model:value="form.command_list"
            :placeholder="t('execution.task.validate.requireCommandList')"
            :options="commandOptions"
            :mode="taskType === 'SCRIPT_EXECUTION' ? '' : 'multiple'"
            :max-tag-count="4"
            :disabled="Boolean(taskId)"
            @change="handleCommandChange"
          />
        </a-form-item>

        <a-form-item v-if="taskType === 'COMMAND_EXECUTION'">
          <a-table
            row-key="command_id"
            size="small"
            :data-source="commandTableData"
            :columns="commandTableColumn"
            :custom-header-row="customHeaderRow"
            :pagination="false"
            :scroll="{ y: 160 }"
          >
            <template #emptyText>
              <div>{{ t('common.none') }}</div>
            </template>
            <template #bodyCell="{ column, record, index }">
              <template v-if="column.dataIndex === 'name'">
                <div class="truncate w-[100px]">{{ record.name }}</div>
              </template>
              <template v-if="column.dataIndex === 'content'">
                <div class="truncate">{{ record.content }}</div>
              </template>
              <template v-if="column.dataIndex === 'order'">
                <a-space>
                  <a-button
                    class="move-button"
                    type="primary"
                    :disabled="index === 0"
                    @click="move('up', record.action_id)"
                  >
                    {{ t('execution.task.moveUp') }}
                  </a-button>
                  <a-button
                    class="move-button"
                    type="primary"
                    :disabled="index === commandTableData.length - 1"
                    @click="move('down', record.action_id)"
                  >
                    {{ t('execution.task.moveDown') }}
                  </a-button>
                </a-space>
              </template>
              <template v-if="column.dataIndex === 'operation'">
                <a @click="handleCommandDelete(record.action_id)">{{ t('common.delete') }}</a>
              </template>
            </template>
          </a-table>
        </a-form-item>

        <a-form-item
          v-if="taskType === 'SCRIPT_EXECUTION' && !form.isDelay"
          :label="t('execution.task.pushOnly')"
          name="onlyPush"
        >
          <a-switch class="ml-[13px]" v-model:checked="form.onlyPush" :disabled="Boolean(taskId)" />
        </a-form-item>
        <a-form-item v-if="form.onlyPush" :label="t('execution.task.remotePath')" name="remotePath">
          <a-input v-model:value="form.remotePath" :placeholder="t('execution.task.placeHolder.requireRemotePath')" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<style scoped>
.ant-form-item {
  margin-bottom: 0px;
  margin-top: 10px;
}

.move-button {
  display: inline-block;
  width: 34px;
  padding: 0;
  height: 22px;
  font-size: 12px;
}
</style>
