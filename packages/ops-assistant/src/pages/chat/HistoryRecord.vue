<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useConversation } from '../../stores/conversation'
import dayjs from 'dayjs'
import { Icon } from '@iconify/vue'
import { deleteConversation } from '../../apis/conversation'
import { ElMessage } from 'element-plus'

const { historyRecord, selectedConversationId } = storeToRefs(useConversation())
const { changeSelectedConversationId, getHistoryConversation } = useConversation()

const emits = defineEmits<{
  (e: 'switch', key: string): void
}>()

function onRecordItemClick(id: string) {
  if (id === selectedConversationId.value) {
    emits('switch', 'dialogue')
    return
  }
  changeSelectedConversationId(id)
  emits('switch', 'dialogue')
}

async function onRecordItemDelete(id: string) {
  const [, res] = await deleteConversation([id])
  if (res) {
    ElMessage.success('删除成功')
    await getHistoryConversation()
    await changeSelectedConversationId(historyRecord.value[0].conversation_id)
  }
}
</script>
<template>
  <ul class="h-full px-2 overflow-y-auto">
    <li
      v-for="item in historyRecord"
      :key="item.conversation_id"
      class="flex justify-between px-2 py-4 cursor-pointer my-1 bg-[var(--ops-record-bg-color)] rounded-[3px] hover:outline hover:outline-1 hover:outline-[#7aa5ff]"
      :class="{ 'active-record-item': item.conversation_id === selectedConversationId }"
      @click="onRecordItemClick(item.conversation_id)"
    >
      <div class="w-[80%] truncate">
        {{ item.title }}
        <div class="text-[12px] mt-1">{{ dayjs(item.created_time).format('MM-DD HH:mm:ss') }}</div>
      </div>
      <div
        class="w-[32px] h-[32px] cursor-pointer hover:bg-red-200 rounded-md flex justify-center items-center opacity-0 hover:opacity-100"
        @click.stop="onRecordItemDelete(item.conversation_id)"
      >
        <Icon class="w-[20px] h-[20px] text-red-600" icon="material-symbols:auto-delete-outline" />
      </div>
    </li>
  </ul>
</template>
<style scoped>
.active-record-item {
  background-image: linear-gradient(to right, rgba(109, 117, 250, 0.2), rgba(90, 179, 255, 0.2));
}
</style>
