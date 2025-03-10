<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { onMounted, ref } from 'vue'
import { ElSelect, ElOption } from 'element-plus'
import UserDialog from './components/UserDialog.vue'
import Assistant from './components/AssistantDialog.vue'
import { RecommendItem, useConversation, usePlugin } from '@aops-assistant/stores/conversation'
import TemplateDialog from './components/TemplateDialog.vue'
import RecommendQuestion from './components/RecommendQuestion.vue'
import { useFlow } from '../../stores/flow'

const { contentRef, currentRecordConversationList, isGeneratingConversation, recommendList, currentQuestion } =
  storeToRefs(useConversation())

const { scrollToBottom, sendQuestion, generateNewSession } = useConversation()

const { currentFlowCustomContent } = storeToRefs(useFlow())
const { setRequestFlowId, setFlowRequestParams } = useFlow()

const { selectedPlugins, pluginOptions } = storeToRefs(usePlugin())

const questionInput = ref<string>('')

function handleSelectQuestion(recommend: RecommendItem) {
  if (recommend) {
    const flowId = recommend.flow_id
    const { setRequestFlowId, setFlowRequestParams } = useFlow()
    setRequestFlowId(flowId)
    setFlowRequestParams(recommend.params || {})
    questionInput.value = recommend.question
    sendQuestion(questionInput.value)
    questionInput.value = ''
  }
}

async function initDefaultQuestion(q?: string) {
  if (!q) return
  sendQuestion(q)
  questionInput.value = ''
}

function onInnerClick(desc: string) {
  sendQuestion(desc, false)
}

function onKeyDown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    if (isGeneratingConversation.value) return
    setRequestFlowId('')
    setFlowRequestParams({})
    sendQuestion(questionInput.value)
    questionInput.value = ''
  }
}

function onSendButtonClick() {
  if (isGeneratingConversation.value) return
  setRequestFlowId('')
  setFlowRequestParams({})
  sendQuestion(questionInput.value)
  questionInput.value = ''
}

onMounted(() => {
  initDefaultQuestion(currentQuestion.value)
  scrollToBottom()
})
</script>
<template>
  <div class="flex flex-col w-full h-full justify-between">
    <div ref="contentRef" class="h-[74%] w-full overflow-y-scroll">
      <div v-for="item in currentRecordConversationList" :key="item.recordId" id="markdown" class="mx-[24px]">
        <UserDialog v-if="item.type === 'USER'" :content="item.contents" :create-time="item.createdTime" />
        <Assistant
          v-else-if="item.type === 'BOT'"
          :content="item.contents"
          :is-generating="isGeneratingConversation"
          @inner-operate-click="onInnerClick"
        >
          <template #innerOperate>
            <div v-html="currentFlowCustomContent"></div>
          </template>
        </Assistant>
      </div>
      <TemplateDialog v-if="currentRecordConversationList.length === 0" />
      <RecommendQuestion
        :recommend-list="recommendList"
        @select="handleSelectQuestion"
        v-if="!isGeneratingConversation && recommendList.length !== 0"
      />
    </div>
    <div class="mx-[24px]">
      <div class="w-full h-full flex flex-col justify-end gap-[8px]">
        <div class="flex justify-between">
          <el-select
            v-model="selectedPlugins"
            collapse-tags
            collapse-tags-tooltip
            clearable
            placeholder="请选择插件"
            style="width: 20%; min-width: 120px"
          >
            <el-option v-for="item in pluginOptions" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
          <div
            class="w-[40px] h-[40px] flex justify-center items-center bg-[#fff] shadow-default rounded-[8px] cursor-pointer"
            @click="generateNewSession"
          >
            <img class="w-[40px] h-[40px]" src="./images/new_chat.png" alt="" />
          </div>
        </div>
        <div class="relative mb-[20px] shadow-default">
          <textarea
            v-model="questionInput"
            placeholder="在此输入你想了解的内容，输入Shift+Enter换行"
            maxlength="2000"
            class="focus:outline-none w-full h-[120px] resize-none rounded-md border-none p-3 text-base bg-[var(--ops-bg-color--panel)] pr-10"
            @keydown="onKeyDown"
          />
          <img
            class="w-[40px] absolute right-2 bottom-2 cursor-pointer"
            :class="{ disabled: isGeneratingConversation || !questionInput }"
            src="../../images/send.png"
            alt=""
            @click="onSendButtonClick"
          />
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped lang="less">
.disabled {
  filter: grayscale(100%);
  cursor: not-allowed;
}
:deep(.el-select) {
  .el-select__wrapper {
    height: 40px;
    box-shadow: none;
    border-radius: 8px;
    .el-select__selection {
      .el-select__selected-item {
        color: #000;
        font-size: 12px;
      }
    }
  }
}
</style>
