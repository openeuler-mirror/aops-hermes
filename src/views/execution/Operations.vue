<script setup lang="ts">
import { message, TablePaginationConfig } from 'ant-design-vue'
import { computed, reactive, ref, h, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { PlusOutlined, QuestionCircleOutlined } from '@ant-design/icons-vue'
import NewOperationModal from './components/NewOperation.vue'
import { api, Operation } from '@/api'
import dayjs from 'dayjs'
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
    title: t('execution.operate.operateName'),
    dataIndex: 'operate_name',
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

const tableState = reactive({
  isLoading: false,
})
const isCreateModalVisible = ref(false)

const operations = ref<Operation[]>([])

/** Query operations */
async function getOperations() {
  tableState.isLoading = true
  const [, res] = await api.queryOperations({
    page: pagination.current,
    per_page: pagination.pageSize,
  })
  if (res) {
    operations.value = res.operate_infos
    pagination.total = res.total_count
  }
  tableState.isLoading = false
}

/** Delete operations */
async function handleDeleteOperation(operationIds: string[]) {
  const [_] = await api.deleteOperations(operationIds)
  if (!_) {
    message.success(t('common.deleteSuccess'))
    getOperations()
  }
}

const selectedOperationId = ref<string>('')
function handleEditOperation(operateId: string) {
  if (!operateId) {
    return
  }
  isCreateModalVisible.value = true
  selectedOperationId.value = operateId
}

function handleCancelCreateOperation() {
  isCreateModalVisible.value = false
  selectedOperationId.value = ''
}

function handleCreateOperation() {
  isCreateModalVisible.value = false
  selectedOperationId.value = ''
  pagination.current = 1
  pagination.pageSize = 10
  getOperations()
}

function handleTableChange(
  page: TablePaginationConfig,
  _filters: any,
  _sorter: SorterResult<Operation> | SorterResult<Operation>[],
) {
  page.current && (pagination.current = page.current)
  page.pageSize && (pagination.pageSize = page.pageSize)
  getOperations()
}

onMounted(() => {
  getOperations()
})
</script>
<template>
  <a-row type="flex" justify="space-between">
    <a-col> </a-col>
    <a-col>
      <a-space>
        <a-button type="primary" :icon="h(PlusOutlined)" @click="isCreateModalVisible = true">
          {{ t('execution.script.newOperate') }}
        </a-button>
      </a-space>
    </a-col>
  </a-row>

  <a-table
    :columns="tableColumn"
    :data-source="operations"
    :pagination="pagination"
    :loading="tableState.isLoading"
    @change="handleTableChange"
  >
    <template #bodyCell="{ record, column }">
      <template v-if="column.dataIndex === 'operate_name'">
        <a-tooltip placement="topLeft">
          <template #title>
            <div>{{ record.operate_name }}</div>
          </template>
          <div class="w-[320px] truncate">{{ record.operate_name }}</div>
        </a-tooltip>
      </template>
      <template v-if="column.dataIndex === 'create_time'">
        {{ dayjs(record.create_time).format('YYYY-MM-DD HH:mm:ss') }}
      </template>
      <template v-if="column.dataIndex === 'operation'">
        <a-row type="flex" justify="center" align="middle">
          <a @click="handleEditOperation(record.operate_id)">{{ t('common.edit') }}</a>
          <a-divider type="vertical" />
          <a-popconfirm
            :title="t('common.sentence.confirmDelete')"
            :ok-text="t('common.confirm')"
            :cancel-text="t('common.cancel')"
            @confirm="handleDeleteOperation([record.operate_id])"
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
  <NewOperationModal
    v-model:visible="isCreateModalVisible"
    :operation-id="selectedOperationId"
    @cancel="handleCancelCreateOperation"
    @success="handleCreateOperation"
  />
</template>
<style scoped></style>

