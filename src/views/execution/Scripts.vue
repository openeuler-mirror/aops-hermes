<script setup lang="ts">
import { message, type TablePaginationConfig } from 'ant-design-vue'
import { computed, h, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { PlusOutlined, QuestionCircleOutlined, RedoOutlined } from '@ant-design/icons-vue'
import dayjs from 'dayjs'
import NewScript from './components/NewScript.vue'
import type { Script } from '@/api'
import { api } from '@/api'
import { SorterResult } from 'ant-design-vue/es/table/interface'

const { t } = useI18n()

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
    title: t('execution.script.scriptName'),
    dataIndex: 'script_name',
  },
  {
    title: t('execution.script.operateName'),
    dataIndex: 'operate_name',
  },
  {
    title: t('execution.script.command'),
    dataIndex: 'command',
  },
  {
    title: t('execution.script.arch'),
    dataIndex: 'arch',
  },
  {
    title: t('execution.script.osName'),
    dataIndex: 'os_name',
  },
  {
    title: t('common.createTime'),
    dataIndex: 'create_time',
  },
  {
    title: t('common.operation'),
    dataIndex: 'operation',
    align: 'center',
  },
])

const scriptsTableData = ref<Script[]>([])

const tableState = reactive({
  loading: false,
  selectedScriptId: '',
})

async function getScripts() {
  tableState.loading = true
  const [, res] = await api.queryScripts({
    page: pagination.current,
    per_page: pagination.pageSize,
  })
  if (res) {
    scriptsTableData.value = res.script_infos
    pagination.total = res.total_count
  }
  tableState.loading = false
}

function handleTableChange(
  page: TablePaginationConfig,
  _filters: any,
  _sorter: SorterResult<Script> | SorterResult<Script>[],
) {
  page.current && (pagination.current = page.current)
  page.pageSize && (pagination.pageSize = page.pageSize)
  getScripts()
}

function handleEdit(scriptId: string) {
  tableState.selectedScriptId = scriptId
  isModalVisible.value = true
}

const isModalVisible = ref(false)

function handleSuccess() {
  isModalVisible.value = false
  getScripts()
}

async function handleDeleteScript(scriptIds: string[]) {
  const [_] = await api.deleteScript(scriptIds)
  if (!_) {
    message.success(t('common.deleteSuccess'))
    getScripts()
  }
}

function handleRefresh() {
  pagination.current = 1
  pagination.pageSize = 10
  getScripts()
}

onMounted(() => {
  getScripts()
})
</script>

<template>
  <a-row type="flex" justify="space-between" align="middle">
    <a-col></a-col>
    <a-col>
      <a-space>
        <a-button type="primary" :icon="h(PlusOutlined)" @click="isModalVisible = true">
          {{ t('execution.script.newScript') }}
        </a-button>

        <a-button :icon="h(RedoOutlined)" @click="handleRefresh">{{ t('common.refresh') }}</a-button>
      </a-space>
    </a-col>
  </a-row>

  <a-table
    :data-source="scriptsTableData"
    :pagination="pagination"
    :columns="tableColumn"
    @change="handleTableChange"
    :loading="tableState.loading"
  >
    <template #bodyCell="{ record, column }">
      <template v-if="column.dataIndex === 'script_name'">
        <a-tooltip placement="topLeft">
          <template #title>
            <div>{{ record.script_name }}</div>
          </template>
          <div class="w-[120px] truncate">{{ record.script_name }}</div>
        </a-tooltip>
      </template>
      <template v-if="column.dataIndex === 'operation'">
        <a @click="handleEdit(record.script_id)">{{ t('common.edit') }}</a>
        <a-divider type="vertical" />
        <a-popconfirm
          :title="t('common.sentence.confirmDelete')"
          :ok-text="t('common.confirm')"
          :cancel-text="t('common.cancel')"
          @confirm="handleDeleteScript([record.script_id])"
        >
          <template #icon>
            <QuestionCircleOutlined style="color: red" />
          </template>
          <a>{{ t('common.delete') }}</a>
        </a-popconfirm>
      </template>
      <template v-if="column.dataIndex === 'create_time'">
        {{ dayjs(record.create_time).format('YYYY-MM-DD hh:mm:ss') }}
      </template>
    </template>
  </a-table>

  <NewScript
    :visible="isModalVisible"
    :script-id="tableState.selectedScriptId"
    @success="handleSuccess"
    @cancel="isModalVisible = false"
  />
</template>

<style scoped></style>

