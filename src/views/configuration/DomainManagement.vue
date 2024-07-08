<script lang="ts" setup>
import { PlusOutlined, QuestionCircleOutlined, RedoOutlined } from '@ant-design/icons-vue'
import { onMounted, reactive, ref } from 'vue'
import type { TableColumnProps, TablePaginationConfig, TableProps } from 'ant-design-vue'
import { message } from 'ant-design-vue'
import { storeToRefs } from 'pinia'
import type { SorterResult } from 'ant-design-vue/es/table/interface'
import AddDomainModal from './components/AddDomainModal.vue'
import PageWrapper from '@/components/PageWrapper.vue'
import type { Domain } from '@/api'
import { api } from '@/api'
import type { DistributionParams } from '@/api/paths/types'
import { useAccountStore } from '@/store'

const { userInfo } = storeToRefs(useAccountStore())

const pagination = reactive<TablePaginationConfig>({
  total: 0,
  current: 1,
  pageSize: 10,
  showTotal: (total: number) => `总计 ${total} 项`,
  showSizeChanger: true,
  pageSizeOptions: ['10', '20', '30', '40'],
})

const tableColumns: TableColumnProps[] = [
  {
    dataIndex: 'domain_name',
    title: '业务域名称',
  },
  {
    dataIndex: 'cluster_name',
    title: '集群',
  },
  {
    dataIndex: 'operation',
    title: '操作',
    align: 'center',
  },
]
const domains = ref<Domain[]>([])

const tableLoading = ref(false)

async function queryDomains() {
  tableLoading.value = true
  const [, res] = await api.getDomains({
    page: pagination.current,
    per_page: pagination.pageSize,
  })
  if (res) {
    domains.value = res.domain_infos
    pagination.total = res.total_count
  }
  tableLoading.value = false
}

/**
 * re request when conditions changed
 * @param page
 */
const handleTableChange: TableProps<Domain>['onChange'] = (
  page,
  _filters,
  _sorter: SorterResult<Domain>,
) => {
  page.current && (pagination.current = page.current)
  page.pageSize && (pagination.pageSize = page.pageSize)

  queryDomains()
}

async function handleDelete(record: Domain) {
  const params: DistributionParams<{ domainId: string, domainName: string }> = {}
  params[record.cluster_id] = {
    domainId: record.domain_id,
    domainName: record.domain_name,
  }
  const [, res] = await api.deleteDomain(params)
  if (res && res[record.cluster_id].label === 'Succeed')
    refresh('删除成功')

  else message.error('删除失败')
}

function refresh(msg?: string) {
  pagination.current = 1
  setTimeout(() => {
    if (msg)
      message.success(msg)

    queryDomains()
  }, 1000)
}
onMounted(() => {
  queryDomains()
})
</script>

<template>
  <PageWrapper>
    <a-card>
      <a-row type="flex" justify="space-between">
        <a-col>
          <h3 class="card-title">
            业务域列表
          </h3>
          <span>共有业务域{{ pagination.total }}个</span>
        </a-col>
        <a-col>
          <a-space>
            <AddDomainModal v-if="userInfo?.type === 'administrator'" @success="refresh">
              <template #trigger>
                <a-button type="primary">
                  <PlusOutlined />
                  创建业务域
                </a-button>
              </template>
            </AddDomainModal>

            <a-button @click="refresh()">
              <RedoOutlined />
              刷新
            </a-button>
          </a-space>
        </a-col>
      </a-row>

      <a-table :columns="tableColumns" :data-source="domains" :loading="tableLoading" :pagination="pagination" @change="handleTableChange">
        <template #bodyCell="{ record, column }">
          <template v-if="column.dataIndex === 'operation'">
            <router-link :to="{ path: `/configuration/domain-management/detail/${record.domain_id}/${record.domain_name}/${record.cluster_id}` }">
              业务域详情
            </router-link>
            <a-divider type="vertical" />
            <router-link :to="{ path: `/configuration/domain-management/conf-list/${record.domain_id}/${record.domain_name}/${record.cluster_id}` }">
              查看域内配置
            </router-link>
            <template v-if="userInfo?.type === 'administrator'">
              <a-divider type="vertical" />
              <a-popconfirm
                title="你确定删除该业务域吗?"
                ok-text="确认"
                cancel-text="取消"
                @confirm="handleDelete(record)"
              >
                <template #icon>
                  <QuestionCircleOutlined style="color: red" />
                </template>
                <a>删除</a>
              </a-popconfirm>
            </template>
          </template>
        </template>
      </a-table>
    </a-card>
  </PageWrapper>
</template>

<style lang="less" scoped>
.card-title {
  display: inline-block;
  margin-right: 10px;
}
</style>
