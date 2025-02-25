<script setup lang="ts">
import Typed from 'typed.js'
import { onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { Icon } from '@iconify/vue'
import { ElSelect, ElOption } from 'element-plus'
import { userApi } from '@aops-assistant/apis/account'
import { usePlugin, useConversation } from '@aops-assistant/stores/conversation'
import { useFlow } from '@aops-assistant/stores/flow'
import { queryHostSummaryInfo } from '@aops-assistant/apis/host'
import type { HostSummary } from '@aops-assistant/apis/types'

import type { RecommendItem } from '@aops-assistant/stores/conversation'

const emits = defineEmits<{
  (e: 'changePage', page: string, content?: string, pluginList?: string[]): void
}>()
const { selectedPlugins, pluginOptions } = storeToRefs(usePlugin())
const { flowRequestParams, requestFlowId } = storeToRefs(useFlow())
const { currentQuestion, currentRecommend } = storeToRefs(useConversation())

const { waringRef, isRecommendVisible } = useTypedInstance()

/**
 * This composable function initializes and manages a Typed.js instance
 * for displaying animated text on a webpage. It sets up references for
 * elements and controls the visibility of recommendations. The function
 * initializes the Typed.js instance with provided content and updates
 * the text based on changes in summary information. It also handles
 * cleanup by destroying the Typed.js instance before initializing.
 *
 * @returns {Object} Contains references for warning and recommendation
 * elements, and a boolean indicating recommendation visibility.
 */
function useTypedInstance() {
  const waringRef = ref<HTMLElement | null>(null)
  const recommendRef = ref<HTMLElement | null>(null)

  const isRecommendVisible = ref(false)

  const typedInstance = ref<Typed>()

  function initTypedInstance(content: string) {
    if (typedInstance.value) typedInstance.value.destroy()

    typedInstance.value = new Typed(waringRef.value, {
      strings: [content],
      typeSpeed: 50,
      showCursor: false,
      startDelay: 2000,
      onComplete: () => {
        isRecommendVisible.value = true
      },
    })
  }

  const summaryInfo = ref<HostSummary>()

  async function getHostSummary() {
    const [, res] = await queryHostSummaryInfo()
    if (res) {
      summaryInfo.value = res
    }
  }

  watch(
    () => summaryInfo.value,
    val => {
      if (val && val.cve_summary) {
        const { critical_num, high_num } = val.cve_summary
        const waitingContent = `检测到${critical_num}个严重CVE和${high_num}个高风险CVE，请尽快修复`
        initTypedInstance(waitingContent)
      } else {
        initTypedInstance('有什么可以帮助您?')
      }
    },
  )

  onMounted(() => {
    getHostSummary()
    if (summaryInfo.value && summaryInfo.value.cve_summary) {
      const { critical_num, high_num } = summaryInfo.value.cve_summary
      const waitingContent = `检测到${critical_num}个严重CVE和${high_num}个高风险CVE，请尽快修复`
      initTypedInstance(waitingContent)
    }
  })

  return {
    waringRef,
    recommendRef,
    isRecommendVisible,
  }
}

const recommendList = ref<RecommendItem[]>([
  {
    plugin_id: 'aops-apollo',
    flow_id: 'query_cve_recommend',
    flow_description: '查看推荐修复CVE',
    question: '查看推荐修复CVE',
    params: {
      min_score: 9,
      fixed: 'false',
    },
  },
  {
    plugin_id: 'aops-apollo',
    flow_id: 'query_cve_hotpatch',
    flow_description: '查看推荐修复的热补丁',
    question: '查看推荐修复的热补丁',
    params: {
      hot_patch: 'true',
      fixed: 'false',
    },
  },
  {
    plugin_id: 'aops-apollo',
    flow_id: 'query_cve_unfix',
    flow_description: '查看未修复的cve',
    question: '查看未修复的cve',
    params: {
      fixed: 'false',
    },
  },
  {
    plugin_id: 'aops-apollo',
    flow_id: 'query_conf_unsync_host',
    flow_description: '查看未同步业务域的主机',
    question: '查看未同步业务域的主机',
    params: {
      sync_status: 0,
    },
  },
])
const questionInput = ref()

/**
 *  When the Enter key is pressed, switch to the 'core' page
 *  with the current input value and the selected plugins.
 */
function onKeyDown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    emits('changePage', 'core', questionInput.value, [selectedPlugins.value])
    currentQuestion.value = questionInput.value
  }
}

function onInputClick() {
  emits('changePage', 'core', questionInput.value, [selectedPlugins.value])
  currentQuestion.value = questionInput.value
}

function onInputInsert() {
  if (!inputRef.value) return
  questionInput.value = inputRef.value.innerText.trim() || ''
}

async function getUserInfo() {
  await userApi.queryUserInfo()
}

function onRecommendClick(recommend: RecommendItem) {
  const { plugin_id, flow_id, params } = recommend
  if (plugin_id) selectedPlugins.value = plugin_id
  if (params) flowRequestParams.value = params
  if (flow_id) requestFlowId.value = flow_id
  currentRecommend.value = recommend
  emits('changePage', 'core', recommend.question, [selectedPlugins.value])
  currentQuestion.value = recommend.question
}

const inputRef = ref<HTMLElement>()

onMounted(() => {
  getUserInfo()
})
</script>
<template>
  <div class="flex flex-col items-center justify-center w-full front-page">
    <div class="w-[54%] flex flex-col items-center">
      <h1 class="text-[30px] font-bold mb-4 w-full">早上好，我是你的智能运维助手</h1>
      <h1 ref="waringRef" class="text-[22px] leading-[22px] h-[22px] font-semibold mb-3 w-full"></h1>
      <div class="flex w-full justify-start min-h-[72px]">
        <transition
          enter-active-class="animate__animated animate__fadeIn"
          leave-active-class="animate__animated animate__fadeOut"
        >
          <ul v-if="isRecommendVisible" class="flex w-full justify-start my-4">
            <li
              v-for="item in recommendList"
              :key="item.plugin_id"
              class="cursor-pointer rounded-[25px] bg-[var(--ops-bg-color)] mr-[12px] px-[20px] py-[12px] recommend font-semibold"
              @click="onRecommendClick(item)"
            >
              {{ item.question }}
            </li>
          </ul>
        </transition>
      </div>
      <div class="w-full mb-2 flex">
        <span class="font-semibold flex items-center">
          <Icon class="w-[18px] h-[18px] mr-1" icon="mingcute:plugin-2-line" />
          插件：</span
        >
        <el-select v-model="selectedPlugins" multiple placeholder="请选择插件" style="width: 60%" suffix-icon="">
          <el-option v-for="item in pluginOptions" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
      </div>
      <div class="w-full bg-[var(--ops-bg-color)] rounded-[25px] pl-3 pr-[0] flex items-center relative">
        <p
          ref="inputRef"
          contenteditable="true"
          placeholder="请输入你的问题"
          class="w-full my-[14px] mx-2 outline-none text-base max-h-[150px] overflow-y-auto cursor-text"
          :class="{ placeholder: !Boolean(questionInput) }"
          @input="onInputInsert"
          @keydown="onKeyDown"
        ></p>
        <div
          class="bg-[#f1f3f5] w-[32px] h-[32px] cursor-pointer rounded-full send-button absolute right-[14px]"
          :class="{ 'send-button-disabled': !questionInput }"
          @click="onInputClick"
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            class="icon-2xl"
          >
            <path
              color="#000"
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M15.1918 8.90615C15.6381 8.45983 16.3618 8.45983 16.8081 8.90615L21.9509 14.049C22.3972 14.4953 22.3972 15.2189 21.9509 15.6652C21.5046 16.1116 20.781 16.1116 20.3347 15.6652L17.1428 12.4734V22.2857C17.1428 22.9169 16.6311 23.4286 15.9999 23.4286C15.3688 23.4286 14.8571 22.9169 14.8571 22.2857V12.4734L11.6652 15.6652C11.2189 16.1116 10.4953 16.1116 10.049 15.6652C9.60265 15.2189 9.60265 14.4953 10.049 14.049L15.1918 8.90615Z"
              fill="currentColor"
            ></path>
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped lang="less">
.front-page {
  background-image: var(--ops-bg-image);
  background-size: cover;
}
.recommend {
  &:hover {
    background-image: linear-gradient(to right, rgba(109, 117, 250, 0.8), rgba(90, 179, 255, 0.8));
    color: #fff;
  }
  &:active {
    background-image: linear-gradient(to right, rgba(109, 117, 250, 1), rgba(90, 179, 255, 1));
    color: #fff;
  }
}

.send-button {
  &:hover {
    filter: brightness(80%);
  }
  &-disabled {
    filter: brightness(89%);
  }
}
:deep(.el-select__wrapper) {
  box-shadow: none;
  background: transparent;
}
:deep(.el-select__wrapper.is-hovering:not(.is-focused)) {
  box-shadow: none;
}
:deep(.el-select__wrapper.is-focused) {
  box-shadow: none;
}
.placeholder {
  position: relative;
  &::before {
    content: attr(placeholder);
    color: #999;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    overflow: hidden;
  }
}
</style>
