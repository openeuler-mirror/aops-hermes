<script lang="ts" setup>
import type { Account, AccountRole } from '@/api'

withDefaults(
  defineProps<{
    users: Account[]
    operable?: boolean
  }>(),
  {
    operable: true,
  },
)

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
</script>

<template>
  <a-table
    :columns="usersColumns"
    :data-source="users"
    :loading="!users.length"
    :pagination="false"
  >
    <template #bodyCell="{ record, column }">
      <template v-if="column.dataIndex === 'type'">
        {{ AccountRoleMap[record.type] }}
      </template>
      <template v-if="column.dataIndex === 'operation'">
        <a>分配权限</a>
        <a-divider type="vertical" />
        <a>重置密码</a>
      </template>
    </template>
  </a-table>
</template>
