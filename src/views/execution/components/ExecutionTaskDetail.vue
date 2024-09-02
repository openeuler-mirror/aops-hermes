<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { api } from '@/api'
import { useI18n } from 'vue-i18n'

const props = withDefaults(
  defineProps<{
    visible: boolean
    taskName?: string
    taskId?: string
    taskType?: string
  }>(),
  {
    visible: false,
  },
)

const emits = defineEmits(['update:visible'])

const { t } = useI18n()

const searchKey = ref('')
const hostList = ref<
  {
    node_index: number
    host_id: string
    host_name: string
    ip: string
  }[]
>([])

const filteredHostList = computed(() =>
  hostList.value.length === 0 ? [] : hostList.value.filter(i => i.host_name.includes(searchKey.value)),
)

async function getHostByTaskId(taskId: string) {
  if (!taskId) return
  const [, res] = await api.queryHostByTaskId(taskId)
  if (res) {
    const taskDetail = JSON.parse(res.task_detail)
    hostList.value = taskDetail.node_list.map((item: any, idx: number) => ({
      host_id: item.host_id,
      host_name: item.host_name,
      ip: item.ip,
      node_index: idx,
    }))
  }
}

const taskResult = ref('')
const isLoading = ref(false)
const selectedHost = ref()

async function handleSelectHost(host: { node_index: number; host_id: string; host_name: string; ip: string }) {
  selectedHost.value = host.host_id
  isLoading.value = true
  const [_, res] = await api.queryTaskExectionResult({
    taskId: props.taskId!,
    nodeIndex: host.node_index,
    caseIndex: 0,
    taskType: props.taskType,
  })
  if (res) {
    taskResult.value = res.join('') || ''
  } else {
    taskResult.value = ''
  }
  isLoading.value = false
}

function handleClose() {
  taskResult.value = ''
  selectedHost.value = ''
  emits('update:visible', false)
}

watch(
  () => props.visible,
  () => {
    if (!props.visible || !props.taskId) return
    getHostByTaskId(props.taskId)
  },
)
</script>

<template>
  <div class="task-detail">
    <a-modal width="60%" :open="visible" :footer="null" destory-on-close @cancel="handleClose">
      <p class="text-base">{{ t('execution.task.taskDetail') }}{{ taskName }}</p>

      <div class="flex gap-3 h-[500px]">
        <div class="w-[30%] border-1 border-[--border-color] border-solid">
          <p class="text-center py-2 bg-[--background-third-color] m-0">{{ t('execution.task.host') }}</p>
          <div class="p-[5px]">
            <a-input-search v-model:value="searchKey" placeholder="Input" />

            <template v-for="host in filteredHostList" :key="host.host_id">
              <div
                @click="handleSelectHost(host)"
                class="p-1 my-1 bg-[var(--background-third-color)] rounded-[4px] cursor-pointer hover:bg-[var(--bg-hover)]"
                :style="{
                  background: selectedHost === host.host_id ? 'var(--bg-active)' : '',
                }"
              >
                {{ host.host_name }}
              </div>
            </template>
          </div>
        </div>
        <div class="w-[68%] border-1 border-[--border-color] border-solid">
          <p class="text-center py-2 bg-[--background-third-color] m-0">{{ t('execution.task.executeResult') }}</p>
          <div class="p-[5px] whitespace-pre h-[92%] overflow-auto">
            <a-spin v-if="isLoading" class="w-full h-full" />
            <div v-else class="w-full h-full" v-html="taskResult" />
          </div>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<style scoped></style>

