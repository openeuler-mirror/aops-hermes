<script lang="ts" setup>
import { message } from 'ant-design-vue'
import {
  CheckCircleTwoTone,
  CloseCircleTwoTone,
  Loading3QuartersOutlined,
  PlusCircleOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons-vue'
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Cluster } from '@/api'
import { api } from '@/api'
import PageWrapper from '@/components/PageWrapper.vue'
import { useClusterStore } from '@/store'

const { t } = useI18n()

const { queryPermission } = useClusterStore()

const SynchronousState = computed(() => ({
  running: t('users.clusters.running'),
  succeed: t('users.clusters.succeed'),
  fail: t('users.clusters.fail'),
}))

const clusterColumns = computed(() => [
  {
    dataIndex: 'cluster_name',
    title: t('users.clusterName'),
  },
  {
    dataIndex: 'description',
    title: t('users.clusterDes'),
  },
  {
    dataIndex: 'cluster_ip',
    title: 'IP',
    align: 'center',
  },
  {
    dataIndex: 'synchronous_state',
    title: t('user.clusterStatus'),
    align: 'center',
  },
  {
    dataIndex: 'operation',
    title: t('common.operation'),
    align: 'center',
  },
])

const clusters = ref<Cluster[]>([])

async function queryClusters() {
  const parseRunning = async (list: Cluster[]) => {
    return list.some(item => item.synchronous_state === 'running')
  }
  const [, res] = await api.getClusters()
  if (res) clusters.value = res
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
    message.success(t('common.succeed'))
    await queryClusters()
    await queryPermission()
  }
}

async function handleSync(record: Cluster) {
  if (!record.subcluster) return
  const [_] = await api.syncClusterData(record.cluster_id, record.cluster_ip!)
  if (_) return
  message.info(t('users.sentence.syncStart'))
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
                <template #icon> <PlusCircleOutlined /> </template>{{ $t('users.addCluster') }}
              </a-button>
            </router-link>
          </a-space>
        </a-col>
      </a-row>
      <a-table :columns="clusterColumns" :data-source="clusters">
        <template #bodyCell="{ record, column }">
          <template v-if="column.dataIndex === 'synchronous_state'">
            <CheckCircleTwoTone v-if="record.synchronous_state === 'succeed'" two-tone-color="#52c41a" />
            <CloseCircleTwoTone v-else-if="record.synchronous_state === 'fail'" two-tone-color="#ff0000" />
            <Loading3QuartersOutlined v-else-if="record.synchronous_state === 'running'" spin />
            {{ SynchronousState[record.synchronous_state as keyof typeof SynchronousState] }}
          </template>
          <template v-if="column.dataIndex === 'operation'">
            <router-link :to="{ path: `/user/cluster/edit-cluster/${record.cluster_id}` }">
              <a>{{ t('common.modify') }}</a>
            </router-link>
            <a-divider type="vertical" />
            <a-popconfirm
              v-if="record.subcluster"
              :title="$t('users.sentence.syncConfirm')"
              :ok-text="t('common.confirm')"
              :cancel-text="t('common.cancel')"
              @confirm="handleSync(record)"
            >
              <template #icon>
                <QuestionCircleOutlined style="color: red" />
              </template>
              <a>{{ $t('users.syncData') }}</a>
            </a-popconfirm>
            <a v-else class="disable-button">{{ $t('users.syncData') }}</a>
            <a-divider type="vertical" />
            <a-popconfirm
              :title="$t('users.sentence.deleteCluster')"
              :ok-text="t('common.confirm')"
              :cancel-text="t('common.cancel')"
              @confirm="handleDeleteCluster(record.cluster_id)"
            >
              <template #icon>
                <QuestionCircleOutlined style="color: red" />
              </template>
              <a v-if="record.subcluster">{{ t('common.delete') }}</a>
              <a v-else class="disable-button">{{ t('common.delete') }}</a>
            </a-popconfirm>
          </template>
        </template>
      </a-table>
    </a-card>
  </PageWrapper>
</template>

<style lang="less" scoped>
.disable-button {
  color: #909399;
  pointer-events: none;
  cursor: no-drop;
  opacity: 0.8;
  &:hover {
    color: #909399;
    opacity: 0.8;
  }
}
</style>

