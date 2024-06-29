<script lang="ts" setup>
import { message } from 'ant-design-vue'
import { CheckCircleTwoTone, CloseCircleTwoTone, Loading3QuartersOutlined, PlusCircleOutlined, QuestionCircleOutlined } from '@ant-design/icons-vue'
import { onMounted, ref } from 'vue'
import type { Cluster } from '@/api'
import { api } from '@/api'
import PageWrapper from '@/components/PageWrapper.vue'
import { useClusterStore } from '@/store'

const { queryPermission } = useClusterStore()

enum SynchronousState {
  running = '同步中',
  succeed = '同步成功',
  fail = '同步失败',
}

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
    align: 'center',
  },
  {
    dataIndex: 'synchronous_state',
    title: '同步状态',
    align: 'center',
  },
  {
    dataIndex: 'operation',
    title: '操作',
    align: 'center',
  },
]

const clusters = ref<Cluster[]>([])

async function queryClusters() {
  const parseRunning = async (list: Cluster[]) => {
    return list.some(item => item.synchronous_state === 'running')
  }
  const [, res] = await api.getClusters()
  if (res)
    clusters.value = res
  const isRunning = await parseRunning(clusters.value)
  if (isRunning) {
    setTimeout(() => {
      queryClusters()
    }, 5000)
  }
}

async function handleDeleteCluster(clusterId: string) {
  const [_] = await api.deleteCluster(clusterId)
  if (!_) {
    message.success('删除成功')
    await queryClusters()
    await queryPermission()
  }
}

async function handleSync(record: Cluster) {
  if (!record.subcluster)
    return
  const [_] = await api.syncClusterData(record.cluster_id, record.cluster_ip!)
  if (_)
    return
  message.info('开始执行同步任务')
  queryClusters()
}

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
      <a-table :columns="clusterColumns" :data-source="clusters">
        <template #bodyCell="{ record, column }">
          <template v-if="column.dataIndex === 'synchronous_state'">
            <CheckCircleTwoTone v-if="record.synchronous_state === 'succeed'" two-tone-color="#52c41a" />
            <CloseCircleTwoTone v-else-if="record.synchronous_state === 'fail'" two-tone-color="#ff0000" />
            <Loading3QuartersOutlined v-else-if="record.synchronous_state === 'running'" spin />
            {{ SynchronousState[record.synchronous_state] }}
          </template>
          <template v-if="column.dataIndex === 'operation'">
            <router-link :to="{ path: `/user/cluster/edit-cluster/${record.cluster_id}` }">
              <a>修改</a>
            </router-link>
            <a-divider type="vertical" />
            <a-popconfirm
              v-if="record.subcluster"
              title="你确定同步数据吗?"
              ok-text="确认"
              cancel-text="取消"
              @confirm="handleSync(record)"
            >
              <template #icon>
                <QuestionCircleOutlined style="color: red" />
              </template>
              <a>同步数据</a>
            </a-popconfirm>
            <a v-else class="disable-button">同步数据</a>
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
              <a v-if="record.subcluster">删除</a>
              <a v-else class="disable-button">删除</a>
            </a-popconfirm>
          </template>
        </template>
      </a-table>
    </a-card>
  </PageWrapper>
</template>

<style lang="less" scoped>
.disable-button {
  color:  #909399;
  pointer-events: none;
  cursor: no-drop;
  opacity: 0.8;
  &:hover {
    color:  #909399;
    opacity: 0.8;

  }
}
</style>
