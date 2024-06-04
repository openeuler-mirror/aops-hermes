<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { computed, onMounted, reactive, ref } from 'vue'
import type { HostGroup } from '@/api'
import { api } from '@/api'
import PageWrapper from '@/components/PageWrapper.vue'

const route = useRoute()
const router = useRouter()

const assignedPermission = ref<
  {
    cluster_id: string
    cluster_name: string
    host_groups: HostGroup[]
  }[]
>([])

const unAssignedPermission = ref<
  {
    cluster_id: string
    cluster_name: string
    host_groups: HostGroup[]
    assigned_host_groups?: HostGroup[]
  }[]
  >([])

const state = reactive<{
  username: string
  searchKey: string
  isSpinning: boolean
  isSubmiting: boolean
  activeKey: string[]
  pageTotal: number
  currentPage: number
}>({
  username: '',
  searchKey: '',
  isSpinning: false,
  isSubmiting: false,
  activeKey: [],
  pageTotal: 0,
  currentPage: 1,
})

const filteredUnAssignedPermission = computed(() =>
  state.searchKey
    ? unAssignedPermission.value.filter(item => item.cluster_name.includes(state.searchKey))
    : unAssignedPermission.value,
)

/**
 * querty already assigned permission
 */
async function queryAssignedPermission() {
  const [_, res] = await api.getAccountPermission(state.username)
  if (res) {
    assignedPermission.value = res
    res.forEach((item) => {
      const perm = unAssignedPermission.value.find(u => u.cluster_id === item.cluster_id)
      if (perm)
        perm.assigned_host_groups = item.host_groups
    })
  }
}

async function queryUnassignedPermission() {
  const [_, res] = await api.getAccountPermission()
  if (res) {
    unAssignedPermission.value = res.map(item => ({
      ...item,
      assigned_host_groups: [],
    }))
    state.pageTotal = res.length
    state.activeKey = res.map(i => i.cluster_id)
  }
}

const checkedList = computed(
  () =>
    (permission: {
      cluster_id: string
      cluster_name: string
      host_groups: HostGroup[]
      assigned_host_groups?: HostGroup[]
    }) => {
      return permission.assigned_host_groups
        ? permission.assigned_host_groups.map(i => i.host_group_id)
        : []
    },
)

function handleChange(clusterId: string, group: HostGroup) {
  const cluster = unAssignedPermission.value.find(item => item.cluster_id === clusterId)
  if (!cluster)
    return
  if (cluster.assigned_host_groups?.map(i => i.host_group_id).includes(group.host_group_id)) {
    cluster.assigned_host_groups = cluster.assigned_host_groups.filter(
      item => item.host_group_id !== group.host_group_id,
    )
  }
  else {
    cluster.assigned_host_groups?.push({
      host_group_id: group.host_group_id,
      host_group_name: group.host_group_name,
    })
  }
}

async function configurationPermission() {
  const permission = unAssignedPermission.value
    .filter(item => item.assigned_host_groups!.length > 0)
    .map(item => ({
      cluster_id: item.cluster_id,
      host_group: item.assigned_host_groups!.map(group => group.host_group_id),
    }))

  const [_] = await api.registerPermission(state.username, permission)
  message.success('配置成功')
  router.replace('/user')
}

onMounted(async () => {
  state.username = (route.params.username as string) || ''
  state.isSpinning = true
  await queryUnassignedPermission()
  await queryAssignedPermission()
  state.isSpinning = false
})
</script>

<template>
  <PageWrapper>
    <a-card>
      <a-spin :spinning="state.isSpinning">
        <a-row>
          <a-col>
            <a-input-search
              v-model:value="state.searchKey"
              placeholder="按集群名搜索"
            />
          </a-col>
        </a-row>
        <a-form>
          <template v-for="item in filteredUnAssignedPermission" :key="item.cluster_id">
            <a-form-item class="form-item">
              <a-collapse v-model:activeKey="state.activeKey">
                <a-collapse-panel :key="item.cluster_id">
                  <template #header>
                    <h4 class="title">
                      {{ item.cluster_name }}
                    </h4>
                  </template>
                  <a-checkbox-group class="check" :value="checkedList(item)">
                    <a-checkbox
                      v-for="group in item.host_groups"
                      :key="group.host_group_id"
                      :value="group.host_group_id"
                      @change="handleChange(item.cluster_id, group)"
                    >
                      {{ group.host_group_name }}
                    </a-checkbox>
                  </a-checkbox-group>
                </a-collapse-panel>
              </a-collapse>
            </a-form-item>
          </template>
          <a-form-item>
            <a-row type="flex" justify="end" style="margin-top: 15px">
              <!-- <a-col>
                <a-pagination v-model:current="state.currentPage" :total="state.pageTotal" />
              </a-col> -->
              <a-col>
                <a-space>
                  <a-button @click="$router.back()">
                    取消
                  </a-button>
                  <a-button type="primary" @click="configurationPermission">
                    确认
                  </a-button>
                </a-space>
              </a-col>
            </a-row>
          </a-form-item>
        </a-form>
      </a-spin>
    </a-card>
  </PageWrapper>
</template>

<style lang="less" scoped>
.form-item {
  margin: 0;
}
.title {
  font-weight: bold;
}
.check {
  display: block;
}
</style>
