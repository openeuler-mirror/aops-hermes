import { defineStore, storeToRefs } from 'pinia'
import { nextTick, computed, ref } from 'vue'
import { FLOW_COMPONENT_MAP } from '../conf/flow'
import { useFlow } from './flow'

export const useDisplay = defineStore('display', () => {
  const currentPage = computed(() => {
    const { currentFlow } = storeToRefs(useFlow())
    const currentFlowValue = FLOW_COMPONENT_MAP[currentFlow.value]
    return currentFlowValue ? currentFlowValue.componentKey : ''
  })

  const isDynamicPageActive = ref(true)

  function reloadDynamicPage() {
    isDynamicPageActive.value = false
    nextTick(() => {
      isDynamicPageActive.value = true
    })
  }

  return {
    currentPage,
    isDynamicPageActive,
    reloadDynamicPage,
  }
})
