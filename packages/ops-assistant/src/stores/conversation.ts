// Copyright (c) Huawei Technologies Co., Ltd. 2023-2024. All rights reserved.
// licensed under the Mulan PSL v2.
// You can use this software according to the terms and conditions of the Mulan PSL v2.
// You may obtain a copy of Mulan PSL v2 at:
//      http://license.coscl.org.cn/MulanPSL2
// THIS SOFTWARE IS PROVIDED ON AN 'AS IS' BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT, MERCHANTABILITY OR FIT FOR A PARTICULAR
// PURPOSE.
// See the Mulan PSL v2 for more details.

import { defineStore } from 'pinia'
import dayjs from 'dayjs'
import { ref, onMounted, shallowRef } from 'vue'
import {
  queryHistoryConversation,
  queryRecordByConversationId,
  newConversation,
  queryPlugins,
} from '../apis/conversation'
import { ElMessage } from 'element-plus'
import { FLOW_COMPONENT_MAP } from '@aops-assistant/conf/flow'
import { userApi } from '../apis/account'
import { useFlow } from './flow'
import type { RecordConversationItem, RecordItem, Plugin } from '../apis/types'

interface ChatReqBody {
  question: string
  conversation_id: string
  group_id: string
  language: 'zh' | 'en'
  plugins: PluginReq[]
  features: {
    max_tokens?: number
    context_num: number
  }
}

interface PluginReq {
  plugin_id: string
  flow_id: string
  params: unknown
  auth?: unknown
}

export interface ConversationRecordItem {
  conversationId: string
  createdTime: string
  type: 'USER' | 'BOT'
  contents: string
  recordId?: string
}

export interface Flow {
  id: string
  flow_id: string
  total_steps: number
  current_step: number
}

interface MetaData {
  input_tokens: number
  output_tokens: number
  time: number
}

export interface FlowConversation {
  event: string
  id: string
  group_id: string
  conversation_id: string
  task_id: string
  flow: Flow
  content: any
  metadata: MetaData
}

export interface RecommendItem {
  plugin_id: string
  flow_id: string
  flow_description: string
  question: string
  params?: any
}

export const useConversation = defineStore('conversationStore', () => {
  const historyRecord = ref<RecordItem[]>([])
  const selectedConversationId = ref<string>('')
  const recordConversationList = ref<RecordConversationItem[]>([])

  const currentRecordConversationList = ref<ConversationRecordItem[]>([])

  const isGeneratingConversation = ref(false)
  const recommendList = ref<RecommendItem[]>([])

  const currentRecommend = ref<RecommendItem>()

  const currentQuestion = ref<string>()

  /**
   * Retrieves the history of conversations from the server and updates the state.
   * This function fetches the conversation history, reverses the order to show the most recent first,
   * and sets the selected conversation ID to the first item in the history if available.
   */
  async function getHistoryConversation() {
    const [, res] = await queryHistoryConversation()
    if (res) {
      historyRecord.value = res.conversations.reverse()
      if (historyRecord.value.length > 0) {
        selectedConversationId.value = historyRecord.value[0].conversation_id
      }
    }
  }

  const contentRef = shallowRef<HTMLDivElement>()

  async function scrollToBottom() {
    setTimeout(() => {
      if (contentRef.value)
        contentRef.value.scrollTo({
          top: contentRef.value.scrollHeight,
          behavior: 'smooth',
        })
    }, 0)
  }

  /**
   * Retrieves the conversation record for a given conversation ID and updates the current record conversation list.
   * This function fetches the conversation record, processes each record item to create user and bot conversation items,
   * and updates the current record conversation list with these items. It also scrolls to the bottom of the content after updating the list.
   *
   * @param conversationId - The ID of the conversation for which to retrieve the record.
   */
  async function getSelectedConversationRecord(conversationId: string) {
    const res = await getRecordByConversationId(conversationId)
    if (res) {
      currentRecordConversationList.value = []
      res.forEach(({ conversation_id, created_at, content }) => {
        const userRecord: ConversationRecordItem = {
          conversationId: conversation_id,
          type: 'USER',
          createdTime: dayjs(created_at * 1000).format('YYYY-MM-DD HH:mm:ss'),
          contents: content.answer,
        }
        const botRecord: ConversationRecordItem = {
          conversationId: conversation_id,
          type: 'BOT',
          createdTime: dayjs(created_at * 1000).format('YYYY-MM-DD HH:mm:ss'),
          contents: content.answer,
        }
        currentRecordConversationList.value.push(userRecord, botRecord)
      })
    }
    scrollToBottom()
  }

  async function getRecordByConversationId(conversationId: string): Promise<RecordConversationItem[]> {
    const [, res] = await queryRecordByConversationId(conversationId)
    return res?.records || []
  }

  async function changeSelectedConversationId(id: string) {
    selectedConversationId.value = id
    getSelectedConversationRecord(id)
  }

  async function generateNewSession() {
    const [error, res] = await newConversation()
    if (error) {
      console.log(error.response.data.message === 'No need to create new conversation.')
      ElMessage({
        message: '已是最新对话！',
        type: 'success',
      })
    } else {
      getHistoryConversation()
      getSelectedConversationRecord(res?.conversation_id || '')
    }

    return res?.conversation_id || ''
  }

  /**
   * Get intelligent question and answer results through sse
   * @param question
   * @param sessionId
   * @param plugin_list
   * @param groupId
   */
  async function queryStreamAnswer(
    question: string,
    sessionId: string,
    plugin_list: PluginReq[] = [],
    groupId: string = '',
  ) {
    isGeneratingConversation.value = true

    const headers = {
      'Content-Type': 'application/json; charset=UTF-8',
    }
    const reqBody: ChatReqBody = {
      question,
      conversation_id: sessionId,
      group_id: groupId,
      language: 'zh',
      plugins: plugin_list,
      features: {
        max_tokens: 2048,
        context_num: 2,
      },
    }
    try {
      const resp = await fetch('/api/chat', {
        method: 'POST',
        keepalive: true,
        headers: headers,
        body: JSON.stringify(reqBody),
      })

      if (!resp.ok) {
        if (resp.status === 401) {
          const [, authObj] = await userApi.queryAuthUrl()
          if (!authObj) return
          const authUrl = `${authObj.url}&redirect_index=${location.href}`
          window.location.href = authUrl
        }
      }
      if (!resp.body) {
        throw new Error(`HTTP error, body not exits`)
      }

      const reader = resp.body.getReader()
      const decoder = new TextDecoder('utf-8')

      let isEnd = false
      let nextFlow: string | undefined = undefined
      const conversation = currentRecordConversationList.value[currentRecordConversationList.value.length - 1]
      let tempMessage = ''

      const endProcess = (nextFlow?: string) => {
        isEnd = true
        isGeneratingConversation.value = false
        scrollToBottom()
        if (nextFlow) {
          const { setRequestFlowId } = useFlow()
          setRequestFlowId(nextFlow)
          console.log(nextFlow)
        }
      }

      while (!isEnd) {
        const { done, value } = await reader.read()

        if (done) {
          endProcess(nextFlow)
          break
        }

        const decodedValue = decoder.decode(value)
        if (decodedValue === 'data: [ERROR]\n\n') {
          endProcess(nextFlow)
          throw new Error(`error`)
        }

        if (decodedValue.endsWith('data: [DONE]\n\n')) {
          endProcess(nextFlow)
          break
        }

        if (!decodedValue.endsWith('}\n\n') || tempMessage) tempMessage += decodedValue

        if (tempMessage && !tempMessage.endsWith('}\n\n')) continue

        const lines = tempMessage ? tempMessage.split('data: ') : decodedValue.split('data: ')
        lines.shift()
        lines.forEach(line => {
          let message: any = null
          try {
            message = JSON.parse(line)
          } catch {
            console.error('json parse error')
          }
          if (message) {
            const { setCurrentFlow, setCurrentFlowOutput } = useFlow()
            if (message.event === 'flow.start') {
              if (message.flow && message.flow.flow_id) {
                nextFlow = FLOW_COMPONENT_MAP[message.flow.flow_id].nextFlow
              }
            }
            if (message.event === 'step.output') {
              setCurrentFlowOutput(message.content.output)
              setCurrentFlow(message.flow.flow_id)
            }
            if (message.event === 'text.add') {
              const content = message.content.text
              conversation.contents += content
              // console.log(message)
            }

            if (message.event === 'suggest') {
              const suggestContent = message.content
              const flow = FLOW_COMPONENT_MAP[message.content.flow_id]
              const recommend: RecommendItem = {
                plugin_id: flow ? flow.plugin_id : suggestContent.plugin_id,
                flow_id: suggestContent.flow_id || '',
                flow_description: flow
                  ? flow.description || suggestContent.flow_description
                  : suggestContent.flow_description,
                question: flow ? flow.description || suggestContent.question : suggestContent.question,
                params: flow ? flow.params : undefined,
              }
              recommendList.value.push(recommend)
            }
          }
          if (tempMessage) tempMessage = ''
          scrollToBottom()
        })
      }
    } catch (err) {
      console.log(err)
      const conversation = currentRecordConversationList.value[currentRecordConversationList.value.length - 1]
      conversation.contents += '系统异常，请稍后重试'
      isGeneratingConversation.value = false
    }
  }

  /**
   * 发送问题并处理对话记录
   * @param q - 要发送的问题字符串
   * @param hasInput - 一个布尔值，指示是否有用户输入，默认为 true
   */
  async function sendQuestion(q: string, hasInput = true) {
    if (!q) return
    if (isGeneratingConversation.value) return
    recommendList.value = []
    const newItem: ConversationRecordItem[] = hasInput
      ? [
          {
            conversationId: selectedConversationId.value!,
            type: 'USER',
            createdTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
            contents: q,
          },
          {
            conversationId: selectedConversationId.value!,
            type: 'BOT',
            createdTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
            contents: '',
          },
        ]
      : [
          {
            conversationId: selectedConversationId.value!,
            type: 'BOT',
            createdTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
            contents: '',
          },
        ]
    currentRecordConversationList.value = [...currentRecordConversationList.value, ...newItem]

    scrollToBottom()
    const { selectedPlugins } = usePlugin()
    const { requestFlowId, flowRequestParams } = useFlow()
    const plugins: PluginReq[] = selectedPlugins
      ? [
          {
            plugin_id: selectedPlugins,
            flow_id: requestFlowId,
            params: flowRequestParams,
            auth: {},
          },
        ]
      : []

    queryStreamAnswer(q, selectedConversationId.value, plugins)

    currentQuestion.value = ''
  }

  onMounted(async () => {
    await getHistoryConversation()
    if (selectedConversationId.value) await getSelectedConversationRecord(selectedConversationId.value)
  })

  return {
    currentRecommend,
    currentQuestion,
    recommendList,
    contentRef,
    historyRecord,
    isGeneratingConversation,
    getHistoryConversation,
    changeSelectedConversationId,
    currentRecordConversationList,
    selectedConversationId,
    recordConversationList,
    scrollToBottom,
    generateNewSession,
    getRecordByConversationId,
    sendQuestion,
  }
})

/**
 * plugin global store, manage plugin options and selected plugins
 */
export const usePlugin = defineStore('pluginStore', () => {
  const selectedPlugins = ref<string>('')

  const pluginOptions = ref<Plugin[]>([])

  async function getPlugins() {
    const [, res] = await queryPlugins()
    if (res) {
      pluginOptions.value = res.plugins
    }
  }

  onMounted(() => {
    getPlugins()
  })

  return {
    selectedPlugins,
    pluginOptions,
    getPlugins,
  }
})
