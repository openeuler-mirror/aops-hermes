<script lang="ts" setup>
import { QuestionCircleOutlined } from '@ant-design/icons-vue'

import type { TableProps } from 'ant-design-vue'
import { message } from 'ant-design-vue'
import { computed, onMounted, reactive, ref } from 'vue'
import PageWrapper from '@/components/PageWrapper.vue'
import { api } from '@/api'
import type { Account, AccountRole } from '@/api'

const AccountRoleMap: Record<AccountRole, string> = {
  administrator: '管理员',
  normal: '普通用户',
}

const usersColumns = [
  {
    dataIndex: 'username',
    title: '用户名',
  },
  {
    dataIndex: 'role_type',
    title: '类型',
  },
  {
    dataIndex: 'email',
    title: '邮箱',
  },
  {
    dataIndex: 'clusters_num',
    title: '集群',
  },
  {
    dataIndex: 'operation',
    title: '操作',
    align: 'center',
  },
]

const usersExpandColumns = computed(() => [
  {
    dataIndex: 'cluster_name',
    title: '集群',
  },
  {
    dataIndex: 'host_groups',
    title: '主机组',
    align: 'center',
  },
])

const pagination = reactive({
  total: 0,
  current: 1,
  pageSize: 10,
  showTotal: (total: number) => `总计 ${total} 项`,
  showSizeChanger: true,
  pageSizeOptions: ['10', '20', '30', '40'],
})

const tableState = reactive({
  expandedRowKeys: [],
  searchKey: '',
  isUsersTableLoading: false,
  isExpandTableLoading: false,
})

const users = ref<Account[]>([])

async function queryAccounts(searchKey?: string) {
  tableState.isUsersTableLoading = true
  const [, res] = await api.getUserAccounts({
    page: pagination.current,
    per_page: pagination.pageSize,
    username: searchKey,
  })
  if (res) {
    users.value = res.result
    pagination.total = res.total_count
  }
  tableState.isUsersTableLoading = false
}

async function queryAccountPermission(username: string) {
  tableState.isExpandTableLoading = true
  const [_, res] = await api.getAccountPermission(username)
  if (res) {
    const user = users.value.find(item => item.username === username)
    if (user)
      user.clusters = res
  }
  tableState.isExpandTableLoading = false
}

function onExpand(expanded: boolean, record: Account) {
  if (expanded)
    queryAccountPermission(record.username)
}

const onChange: TableProps<Account>['onChange'] = (page) => {
  page.current && (pagination.current = page.current)
  page.pageSize && (pagination.pageSize = page.pageSize)
  queryAccounts(tableState.searchKey)
}

async function handleResetPass(record: Account) {
  const [_] = await api.resetPassword(record.username)
  if (!_)
    message.success('重置密码成功')
}

function handleSearch() {
  tableState.expandedRowKeys = []
  queryAccounts(tableState.searchKey)
}

onMounted(() => {
  queryAccounts()
})
</script>

<template>
  <PageWrapper>
    <a-card>
      <a-row type="flex">
        <a-input-search
          v-model:value="tableState.searchKey"
          :maxlength="40"
          placeholder="按照用户名搜索"
          style="width: 200px"
          @search="handleSearch"
        />
      </a-row>
      <a-table
        v-model:expandedRowKeys="tableState.expandedRowKeys"
        row-key="username"
        :columns="usersColumns"
        :data-source="users"
        :loading="tableState.isUsersTableLoading"
        :pagination="pagination"
        @expand="onExpand"
        @change="onChange"
      >
        <template #bodyCell="{ record, column }">
          <template v-if="column.dataIndex === 'type'">
            {{ AccountRoleMap[record.type] }}
          </template>
          <template v-if="column.dataIndex === 'operation'">
            <router-link :to="{ path: `/user/users/user-permission/${record.username}` }">
              <a>分配权限</a>
            </router-link>
            <a-divider type="vertical" />
            <a-popconfirm
              ok-text="确认"
              cancel-text="取消"
              @confirm="handleResetPass(record)"
            >
              <template #title>
                你确定将该用户密码重置为<span style="color: red">changeme</span>吗?
              </template>
              <template #icon>
                <QuestionCircleOutlined style="color: red" />
              </template>
              <a>重置密码</a>
            </a-popconfirm>
          </template>
        </template>
        <template #expandedRowRender="{ record }">
          <a-table
            :columns="usersExpandColumns"
            :data-source="record.clusters"
            :loading="tableState.isExpandTableLoading"
            :pagination="false"
          >
            <template #bodyCell="{ record: expandRecord, column }">
              <template v-if="column.dataIndex === 'host_groups'">
                {{
                  expandRecord.host_groups.reduce((acc, cur) => {
                    if (acc === '') return cur.host_group_name;
                    else return `${acc},${cur.host_group_name}`;
                  }, '')
                }}
              </template>
            </template>
          </a-table>
        </template>
      </a-table>
    </a-card>
  </PageWrapper>
</template>

<style lang="less" scoped>
.title {
  font-size: 18px;
  font-weight: 700;
}
.expand-icon {
  transform: translate(0, 33px);
}
.label {
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 5px;
}
.value {
  font-size: 16px;
  margin: 0;
}
</style>
