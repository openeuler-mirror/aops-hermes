<script lang="ts" setup>
import { QuestionCircleOutlined } from '@ant-design/icons-vue'

import type { TableProps } from 'ant-design-vue'
import { message } from 'ant-design-vue'
import { computed, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import PageWrapper from '@/components/PageWrapper.vue'
import { api } from '@/api'
import type { Account, AccountRole } from '@/api'

const { t } = useI18n()

const AccountRoleMap: Record<AccountRole, string> = {
  administrator: t('users.administrator'),
  normal: t('users.normal'),
}

const usersColumns = computed(() => [
  {
    dataIndex: 'username',
    title: t('users.username'),
  },
  {
    dataIndex: 'role_type',
    title: t('users.role'),
  },
  {
    dataIndex: 'email',
    title: t('users.email'),
  },
  {
    dataIndex: 'clusters_num',
    title: t('users.cluster'),
  },
  {
    dataIndex: 'operation',
    title: t('common.operation'),
    align: 'center',
  },
])

const usersExpandColumns = computed(() => [
  {
    dataIndex: 'cluster_name',
    title: t('users.cluster'),
  },
  {
    dataIndex: 'host_groups',
    title: t('users.hostGroup'),
    align: 'center',
  },
])

const pagination = reactive({
  total: 0,
  current: 1,
  pageSize: 10,
  showTotal: (total: number) => t('common.total', { count: total }),
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
    if (user) user.clusters = res
  }
  tableState.isExpandTableLoading = false
}

function onExpand(expanded: boolean, record: Account) {
  if (expanded) queryAccountPermission(record.username)
}

const onChange: TableProps<Account>['onChange'] = page => {
  page.current && (pagination.current = page.current)
  page.pageSize && (pagination.pageSize = page.pageSize)
  queryAccounts(tableState.searchKey)
}

async function handleResetPass(record: Account) {
  const [_] = await api.resetPassword(record.username)
  if (!_) message.success(t('common.succeed'))
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
          :placeholder="t('users.placeHolder.searchBy')"
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
            {{ AccountRoleMap[record.type as AccountRole] }}
          </template>
          <template v-if="column.dataIndex === 'operation'">
            <router-link :to="{ path: `/user/users/user-permission/${record.username}` }">
              <a>{{ $t('users.permissions') }}</a>
            </router-link>
            <a-divider type="vertical" />
            <a-popconfirm
              :ok-text="t('common.confirm')"
              :cancel-text="t('common.cancel')"
              @confirm="handleResetPass(record)"
            >
              <template #title>
                {{ $t('users.sentence.resetPassword') }}
              </template>
              <template #icon>
                <QuestionCircleOutlined style="color: red" />
              </template>
              <a>{{ $t('users.resetPassword') }}</a>
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
                  expandRecord.host_groups.reduce((acc: any, cur: any) => {
                    if (acc === '') return cur.host_group_name
                    else return `${acc},${cur.host_group_name}`
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

