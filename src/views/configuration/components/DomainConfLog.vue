<template>
  <a-spin :spinning="logIsLoading">
    <a-descriptions :column="1" layout="horizontal">
      <a-descriptions-item label="所属业务域">
        {{ domainName }}
      </a-descriptions-item>
    </a-descriptions>
    <a-descriptions :column="1" layout="vertical" bordered>
      <a-descriptions-item :label="'配置文件：' + manageConfChange?.filePath">
        <p class="pContent">期望配置文本：</p>
        <div class="contentBox">
          <span class="diffContent"> {{ manageConfChange?.expectedContents }} </span>
        </div>
        <p class="pLog">变更历史：</p>
        <a-table
          rowKey="changeId"
          v-model:expandedRowKeys="tableState.expandedRowKeys"
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
              更多<ArrowDownOutlined />
            </span>
            <span v-else style="color: #1677ff; cursor: pointer" @click="expand(expanded, record)">
              收起<ArrowUpOutlined />
            </span>
          </template>
          <template #expandColumnTitle>
            <span style="white-space: nowrap">变更详情</span>
          </template>
          <template #expandedRowRender="{ record }">
            <p>preValue:</p>
            {{ record.preValue }}
            <p>postValue:</p>
            {{ record.postValue }}
          </template>
          <template #bodyCell="{ record, column }">
            <template v-if="column.dataIndex === 'date'">{{
              dayjs(record.date).format('YYYY-MM-DD HH:mm:ss')
            }}</template>
          </template>
        </a-table>
      </a-descriptions-item>
    </a-descriptions>
  </a-spin>
</template>

<script lang="ts" setup>
import { ConfBaseInfo, ConfFile, ChangeLog, api } from '@/api';
import dayjs from 'dayjs';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons-vue';
import { Table } from 'ant-design-vue';

const props = defineProps<{
  domainName: string;
  confFile: ConfFile;
}>();

const logIsLoading = ref(false);
const confChangeColumns = [
  { title: '变更ID', dataIndex: 'changeId', key: 'changeId' },
  {
    title: '变更时间',
    dataIndex: 'date',
    key: 'date',
  },
  { title: '变更人', dataIndex: 'author', key: 'author' },
  { title: '变更原因', dataIndex: 'changeReason', key: 'changeReason' },
  Table.EXPAND_COLUMN,
];

const tableState = reactive<{
  loading: boolean;
  expandedRowKeys: string[];
}>({
  loading: false,
  expandedRowKeys: [],
});

const manageConfChange = ref<ConfBaseInfo>();

/**
 * query domain config change log
 */
const queryDomainConfLog = async () => {
  tableState.loading = true;
  const [, res] = await api.getDomainConfLog(props.domainName, [
    { filePath: props.confFile.filePath },
  ]);
  if (res) {
    manageConfChange.value = res.confBaseInfos[0];
  }
  tableState.loading = false;
};

/**
 * expand table row for display config detail
 */
const expand = (expanded: boolean, record: ChangeLog) => {
  if (!expanded) tableState.expandedRowKeys.push(record.changeId);
  else
    tableState.expandedRowKeys = tableState.expandedRowKeys.filter(
      (item) => item !== record.changeId
    );
};

onMounted(() => {
  queryDomainConfLog();
});
</script>

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
