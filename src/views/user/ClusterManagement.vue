<script lang="ts" setup>
import { message } from 'ant-design-vue'
import { PlusCircleOutlined, QuestionCircleOutlined } from '@ant-design/icons-vue'
import { onMounted, ref } from 'vue'
// import { useRouter } from 'vue-router'
import type { Cluster } from '@/api'
import { api } from '@/api'
import PageWrapper from '@/components/PageWrapper.vue'

// const router = useRouter()

const clusterColumns = [
  {
    dataIndex: 'cluster_name',
    title: '集群名',
  },
  {
    dataIndex: 'description',
    title: '描述',
  },
  {
    dataIndex: 'cluster_ip',
    title: 'IP',
  },

  {
    dataIndex: 'operation',
    title: '操作',
    align: 'center',
  },
]

const isTableLoading = ref(false)

const clusters = ref<Cluster[]>([])

async function queryClusters() {
  isTableLoading.value = true
  const [, res] = await api.getClusters()
  if (res) {
    clusters.value = res.map(
      ({ cluster_id, cluster_ip, cluster_name, description, subcluster }) => ({
        cluster_id,
        cluster_ip,
        cluster_name,
        description,
        subcluster,
      }),
    )
  }
  isTableLoading.value = false
}

async function handleDeleteCluster(clusterId: string) {
  const [_] = await api.deleteCluster(clusterId)
  if (!_) {
    message.success('删除成功')
    await queryClusters()
  }
}

// function handleLinkToEdit(cluster:Cluster) {
//   router.push({name: 'editCluster', paramsz})
// }

onMounted(() => {
  queryClusters()
})
</script>

<template>
  <PageWrapper>
    <a-card>
      <a-row type="flex" justify="end">
        <a-col>
          <a-space>
            <router-link to="/user/cluster/register-cluster">
              <a-button type="primary">
                <template #icon>
                  <PlusCircleOutlined />
                </template>添加集群
              </a-button>
            </router-link>
            <a-button type="primary" style="display: none">
              批量添加
            </a-button>
          </a-space>
        </a-col>
      </a-row>
      <a-table :columns="clusterColumns" :data-source="clusters" :loading="isTableLoading">
        <template #bodyCell="{ record, column }">
          <template v-if="column.dataIndex === 'operation'">
            <router-link :to="{ path: `/user/cluster/edit-cluster/${record.cluster_id}` }">
              <a>修改</a>
            </router-link>
            <a-divider type="vertical" />
            <a-popconfirm
              title="你确定取消纳管该集群吗?"
              ok-text="确认"
              cancel-text="取消"
              @confirm="handleDeleteCluster(record.cluster_id)"
            >
              <template #icon>
                <QuestionCircleOutlined style="color: red" />
              </template>
              <a>删除</a>
            </a-popconfirm>
          </template>
        </template>
      </a-table>
    </a-card>
  </PageWrapper>
</template>
