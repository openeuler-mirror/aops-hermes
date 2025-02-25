<script setup lang="ts">
import { computed, ref, shallowRef } from 'vue'
import { Icon } from '@iconify/vue'
import { storeToRefs } from 'pinia'
import { ElMessage } from 'element-plus'
import { useConversation } from '../../stores/conversation'
import Operations from './Operations.vue'
import HistoryRecord from './HistoryRecord.vue'
import Dialogue from './Dialogue.vue'

const emits = defineEmits<{
  (e: 'changeVisible', visible: boolean): void
}>()

const {
  historyRecord,
  selectedConversationId,
  currentRecordConversationList,
  isGeneratingConversation,
  recommendList,
} = storeToRefs(useConversation())
const { generateNewSession, getRecordByConversationId, changeSelectedConversationId, getHistoryConversation } =
  useConversation()

const pageType = ref('dialogue')
const pageMap = shallowRef([
  {
    key: 'dialogue',
    component: Dialogue,
  },
  {
    key: 'history',
    component: HistoryRecord,
  },
])
const currentComponent = computed(() => pageMap.value.find(page => page.key === pageType.value)?.component)

async function handleGenerateSession() {
  if (isGeneratingConversation.value) {
    ElMessage.warning('正在生成中')
    return
  }
  if (
    selectedConversationId.value === historyRecord.value[0].conversation_id &&
    currentRecordConversationList.value.length === 0
  ) {
    ElMessage.success('已是最新对话')
    pageType.value = 'dialogue'
    return
  }
  const record = await getRecordByConversationId(historyRecord.value[0].conversation_id)
  if (record.length === 0) changeSelectedConversationId(historyRecord.value[0].conversation_id)
  else {
    recommendList.value = []
    const cId = await generateNewSession()
    await getHistoryConversation()
    await changeSelectedConversationId(cId)
  }
}
</script>
<template>
  <div class="bg-[var(--ops-bg-color)]">
    <header class="flex justify-between h-[60px] px-[26px] items-center bg-[#f4f6fa] header">
      <div class="font-semibold">
        <span v-if="pageType === 'dialogue'" class="flex items-center gap-2 text-[18px]">
          <img src="./images/logo.svg" alt="" />
          <p class="font-bold">openEuler Copilot System</p>
        </span>
        <div
          v-else-if="pageType === 'history'"
          class="w-[28px] h-[28px] cursor-pointer hover:bg-[var(--bg-hover)] flex justify-center items-center rounded-md"
          @click="pageType = 'dialogue'"
        >
          <Icon class="w-[16px] h-[16px]" icon="carbon:chevron-left" />
        </div>
      </div>
      <Operations @switch="(key: string) => (pageType = key)" />
    </header>

    <div class="chat-main-container">
      <transition name="slide" mode="out-in">
        <component :is="currentComponent" @switch="(key: string) => (pageType = key)"></component>
      </transition>
    </div>
  </div>
</template>
<style scoped>
.chat-main-container {
  height: calc(100% - 61px);
  background-image: var(--ops-bg-image);
  background-repeat: no-repeat;
  background-position: center;
}

.header {
  box-shadow:
    0 0 transparent,
    0 0 transparent,
    0 2px 4px #00000005,
    0 1px 0 #0000000f;
  backdrop-filter: saturate(50%) blur(8px);
}
</style>
