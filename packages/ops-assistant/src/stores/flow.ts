import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { FLOW_CUSTOM_CONTENT } from '@aops-assistant/conf/flow'

export interface FlowOutput<T = any> {
  code: string
  data: T
}

export const useFlow = defineStore('flowConversation', () => {
  const currentFlow = ref<string>('')

  function setCurrentFlow(flow: string) {
    currentFlow.value = flow
  }

  const requestFlowId = ref<string>('')

  function setRequestFlowId(id: string) {
    requestFlowId.value = id || ''
  }

  const flowRequestParams = ref<any>()

  const currentFlowOutput = ref<any>()

  function setCurrentFlowOutput(output: FlowOutput) {
    currentFlowOutput.value = output.data
  }

  function setFlowRequestParams(params: any) {
    if (!params) return
    flowRequestParams.value = JSON.parse(JSON.stringify(params))
  }

  const currentFlowCustomContent = computed<string>(() => FLOW_CUSTOM_CONTENT[currentFlow.value] || '')

  return {
    currentFlow,
    requestFlowId,
    flowRequestParams,
    currentFlowOutput,
    currentFlowCustomContent,
    setCurrentFlow,
    setCurrentFlowOutput,
    setFlowRequestParams,
    setRequestFlowId,
  }
})
