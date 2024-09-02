<script lang="ts" setup>
import dayjs from 'dayjs'
import { ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons-vue'
import { Table } from 'ant-design-vue'
import { onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { api } from '@/api'
import type { ChangeLog, ConfBaseInfo, ConfFile } from '@/api'

const props = defineProps<{
  domainName: string
  confFile?: ConfFile
  clusterId: string
}>()

const { t } = useI18n()

const logIsLoading = ref(false)
const confChangeColumns = [
  { title: t('conftrace.domainConf.changeId'), dataIndex: 'changeId', key: 'changeId' },
  {
    title: t('conftrace.domainConf.changeDate'),
    dataIndex: 'date',
    key: 'date',
  },
  { title: t('conftrace.domainConf.changeAuthor'), dataIndex: 'author', key: 'author' },
  { title: t('conftrace.domainConf.changeReason'), dataIndex: 'changeReason', key: 'changeReason' },
  Table.EXPAND_COLUMN,
]

const tableState = reactive<{
  loading: boolean
  expandedRowKeys: string[]
}>({
  loading: false,
  expandedRowKeys: [],
})

const manageConfChange = ref<ConfBaseInfo>()

/**
 * query domain config change log
 */
async function queryDomainConfLog() {
  tableState.loading = true
  const params = {}
  params[props.clusterId] = {
    domainName: props.domainName,
    confFiles: [
      { filePath: props.confFile!.filePath },
    ],
  }
  const [, res] = await api.getDomainConfLog(params)
  if (res)
    manageConfChange.value = res[props.clusterId].data.confBaseInfos[0]

  tableState.loading = false
}

/**
 * expand table row for display config detail
 */
function expand(expanded: boolean, record: ChangeLog) {
  if (!expanded) {
    tableState.expandedRowKeys.push(record.changeId)
  }
  else {
    tableState.expandedRowKeys = tableState.expandedRowKeys.filter(
      item => item !== record.changeId,
    )
  }
}

onMounted(() => {
  queryDomainConfLog()
})
</script>

<template>
  <a-spin :spinning="logIsLoading">
    <a-descriptions :column="1" layout="horizontal">
      <a-descriptions-item :label="$t('conftrace.domainConf.belongDomain')">
        {{ domainName }}
      </a-descriptions-item>
    </a-descriptions>
    <a-descriptions :column="1" layout="vertical" bordered>
      <a-descriptions-item :label="`${t('conftrace.domainConf.file')}：${manageConfChange?.filePath}`">
        <p class="pContent">
          {{ $t('conftrace.domainConf.expectedConfiguration') }}
        </p>
        <div class="contentBox">
          <span class="diffContent"> {{ manageConfChange?.expectedContents }} </span>
        </div>
        <p class="pLog">
          {{ $t('conftrace.domainConf.changeHistory') }}
        </p>
        <a-table
          v-model:expandedRowKeys="tableState.expandedRowKeys"
          row-key="changeId"
          :columns="confChangeColumns"
          :data-source="manageConfChange?.changeLog"
          :pagination="false"
          bordered
        >
          <template #expandIcon="{ expanded, record }">
            <span
              v-if="!expanded"
              style="color: #1677ff; cursor: pointer"
              @click="expand(expanded, record)"
            >
              {{ $t('common.more') }}<ArrowDownOutlined />
            </span>
            <span v-else style="color: #1677ff; cursor: pointer" @click="expand(expanded, record)">
              {{ $t('common.close') }}<ArrowUpOutlined />
            </span>
          </template>
          <template #expandColumnTitle>
            <span style="white-space: nowrap">{{ $t('conftrace.domainConf.changeDetail') }}</span>
          </template>
          <template #expandedRowRender="{ record }">
            <p>preValue:</p>
            {{ record.preValue }}
            <p>postValue:</p>
            {{ record.postValue }}
          </template>
          <template #bodyCell="{ record, column }">
            <template v-if="column.dataIndex === 'date'">
              {{
                dayjs(record.date).format('YYYY-MM-DD HH:mm:ss')
              }}
            </template>
          </template>
        </a-table>
      </a-descriptions-item>
    </a-descriptions>
  </a-spin>
</template>

<style lang="less" scoped>
.contentBox {
  box-sizing: border-box;
  border: 1px solid #e8e8e8;
  overflow: auto;
  height: 400px;
  width: 100%;
  white-space: nowrap;
}
.diffContent {
  word-break: break-all;
  white-space: pre;
}
.pLog {
  font-size: 16px;
  padding-top: 10px;
}
</style>
