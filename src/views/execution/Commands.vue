<script setup lang="ts">
import { type TablePaginationConfig, message } from 'ant-design-vue'
import { useI18n } from 'vue-i18n'
import { computed, h, onMounted, reactive, ref } from 'vue'
import { PlusOutlined, QuestionCircleOutlined, RedoOutlined } from '@ant-design/icons-vue'
import dayjs from 'dayjs'
import NewCommand from './components/NewCommand.vue'
import type { Command } from '@/api'
import { api } from '@/api'

const { t } = useI18n()

const pagination = reactive<TablePaginationConfig>({
  total: 0,
  current: 1,
  pageSize: 10,
  showTotal: (total: number) => `${t('common.total', { count: total })}`,
  showSizeChanger: true,
  pageSizeOptions: ['10', '20', '30', '40'],
})

const tableState = reactive({
  loading: false,
})

const tableColumn = computed(() => [
  {
    title: t('execution.command.commandName'),
    dataIndex: 'command_name',
  },
  {
    title: t('execution.command.commandContent'),
    dataIndex: 'content',
    width: 400,
  },
  {
    title: t('common.createTime'),
    dataIndex: 'create_time',
    align: 'center',
  },
  {
    title: t('common.operation'),
    dataIndex: 'operation',
    align: 'center',
  },
])

const commandList = ref<Command[]>([])

/** Get command list */
async function getCommands() {
  tableState.loading = true
  const [, res] = await api.queryCommands({
    page: pagination.current,
    per_page: pagination.pageSize,
  })
  if (res) {
    commandList.value = res.command_infos
    pagination.total = res.total_count
  }
  tableState.loading = false
}

/** Delete commands */
async function handleDeleteCommand(commandIds: string[]) {
  const [, res] = await api.deleteCommands(commandIds)
  if (res) {
    message.success(t('common.deleteSuccess'))
    getCommands()
  }
}

function handleTableChange(page: TablePaginationConfig) {
  page.current && (pagination.current = page.current)
  page.pageSize && (pagination.pageSize = page.pageSize)
  getCommands()
}

function handleRefresh() {
  pagination.current = 1
  pagination.pageSize = 10
  getCommands()
}

const isCreateModalVisible = ref(false)
const currentSelectCommandId = ref<string>('')

function handleNewCommandSuccess() {
  currentSelectCommandId.value = ''
  isCreateModalVisible.value = false
  handleRefresh()
}

function handleNewCommandCancel() {
  currentSelectCommandId.value = ''
  isCreateModalVisible.value = false
}

function handleEditCommand(commandId: string) {
  currentSelectCommandId.value = commandId
  isCreateModalVisible.value = true
}

onMounted(() => {
  getCommands()
})
</script>

<template>
  <a-row type="flex" justify="space-between">
    <a-col></a-col>
    <a-col>
      <a-space>
        <a-button type="primary" :icon="h(PlusOutlined)" @click="isCreateModalVisible = true">
          {{ t('execution.command.newCommand') }}
        </a-button>
        <a-button :icon="h(RedoOutlined)" @click="handleRefresh">
          {{ t('common.refresh') }}
        </a-button>
      </a-space>
    </a-col>
  </a-row>

  <a-table
    :columns="tableColumn"
    :data-source="commandList"
    :pagination="pagination"
    :loading="tableState.loading"
    @change="handleTableChange"
  >
    <template #bodyCell="{ record, column }">
      <template v-if="column.dataIndex === 'command_name'">
        <a-tooltip placement="topLeft">
          <template #title>
            <div>{{ record.command_name }}</div>
          </template>
          <div class="w-[120px] truncate">{{ record.command_name }}</div>
        </a-tooltip>
      </template>
      <template v-if="column.dataIndex === 'content'">
        <a-tooltip placement="topLeft">
          <template #title>
            <div>{{ record.content }}</div>
          </template>
          <div class="w-[400px] truncate">{{ record.content }}</div>
        </a-tooltip>
      </template>
      <template v-if="column.dataIndex === 'create_time'">
        {{ dayjs(record.create_time).format('YYYY-MM-DD HH:mm:ss') }}
      </template>
      <template v-if="column.dataIndex === 'operation'">
        <a-row type="flex" justify="center" align="middle">
          <a @click="handleEditCommand(record.command_id)">{{ t('common.edit') }}</a>
          <a-divider type="vertical" />
          <a-popconfirm
            :title="t('common.sentence.confirmDelete')"
            :ok-text="t('common.confirm')"
            :cancel-text="t('common.cancel')"
            @confirm="handleDeleteCommand([record.command_id])"
          >
            <template #icon>
              <QuestionCircleOutlined style="color: red" />
            </template>
            <a>{{ t('common.delete') }}</a>
          </a-popconfirm>
        </a-row>
      </template>
    </template>
  </a-table>

  <NewCommand
    :visible="isCreateModalVisible"
    :command-id="currentSelectCommandId"
    @success="handleNewCommandSuccess"
    @cancel="handleNewCommandCancel"
  />
</template>

<style scoped></style>
