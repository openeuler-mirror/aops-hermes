<script setup lang="ts">
import { ElEmpty } from 'element-plus'
import { onMounted, shallowRef, watch } from 'vue'
import { storeToRefs } from 'pinia'
import TaskDetailPanel from './components/TaskDetailPanel.vue'
import { useConversation } from '@aops-assistant/stores/conversation'
import { useFlow } from '@aops-assistant/stores/flow'

export interface CveTask {
  task_id: string
  fix_way: 'coldpatch' | 'hotpatch'
}

const { currentRecordConversationList, isGeneratingConversation } = storeToRefs(useConversation())

const visibleTaskList = shallowRef<CveTask[]>([])
let executeResultQueue: string[] = []

async function onTaskFinish(fixWay: 'coldpatch' | 'hotpatch', status: 'succeed' | 'failed', desc: string) {
  const { scrollToBottom } = useConversation()
  if (fixWay === 'hotpatch') {
    const content =
      status === 'succeed'
        ? `<div class="result result-success"><div class="label label-success">√</div><div class="desc">${desc}</div></div>`
        : `<div class="result result-fail"><div class="label label-fail">×</div><div class="desc">${desc}</div></div>`
    const message = status === 'succeed' ? `任务执行成功，热补丁正常启用.` : `任务执行失败.`
    if (isGeneratingConversation.value) {
      executeResultQueue = [...executeResultQueue, ...[content, message]]
    } else {
      currentRecordConversationList.value[currentRecordConversationList.value.length - 1].contents += content
      currentRecordConversationList.value[currentRecordConversationList.value.length - 1].contents += message
    }
  } else {
    const content =
      status === 'succeed'
        ? `<div class="result result-success"><div class="label label-success">√</div><div class="desc">${desc}</div></div>`
        : `<div class="result result-fail"><div class="label label-fail">×</div><div class="desc">${desc}</div></div>`
    const message = status === 'succeed' ? `任务执行成功，需重新启动机器使冷补丁生效.` : `任务执行失败.`
    if (isGeneratingConversation.value) {
      executeResultQueue = [...executeResultQueue, ...[content, message]]
    } else {
      currentRecordConversationList.value[currentRecordConversationList.value.length - 1].contents += content
      currentRecordConversationList.value[currentRecordConversationList.value.length - 1].contents += message
    }
  }
  scrollToBottom()
}

watch(
  () => isGeneratingConversation.value,
  () => {
    if (isGeneratingConversation.value) {
      return
    }
    executeResultQueue.forEach(result => {
      currentRecordConversationList.value[currentRecordConversationList.value.length - 1].contents += result
    })
    executeResultQueue = []
  },
)

onMounted(() => {
  const { currentFlowOutput } = useFlow()
  if (currentFlowOutput) {
    visibleTaskList.value = currentFlowOutput
  }
})
</script>
<template>
  <div v-if="visibleTaskList.length > 0" class="flex flex-col gap-2">
    <TaskDetailPanel
      v-for="cveTask in visibleTaskList"
      :key="cveTask.task_id"
      :task-id="cveTask.task_id"
      :task-fix-way="cveTask.fix_way"
      @finish="onTaskFinish"
    ></TaskDetailPanel>
  </div>
  <div v-else>
    <el-empty description="任务不存在" />
  </div>
</template>
<style scoped></style>
