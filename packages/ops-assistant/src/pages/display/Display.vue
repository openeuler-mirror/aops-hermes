<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { shallowRef, ref, watch } from 'vue'
import { useDisplay } from '@aops-assistant/stores/display'
import Skeleton from '@aops-assistant/components/Skeleton.vue'
import Empty from './Empty.vue'
import { FLOW_COMPONENT_MAP } from '@aops-assistant/conf/flow'
import { useFlow } from '@aops-assistant/stores/flow'
import TabBar from './components/TabBar.vue'

import type { Tab } from './components/TabBar.vue'

const emits = defineEmits<{
  (e: 'change', key: string): void
}>()

const { currentFlow } = storeToRefs(useFlow())
const { currentPage } = storeToRefs(useDisplay())

const currentComponent = shallowRef<any>(Skeleton)
const dynamicComponentKey = ref('')

const displayDynamicComponent = shallowRef(
  Object.values(FLOW_COMPONENT_MAP).map(item => ({
    key: item.componentKey,
    label: item.label,
    component: item.component,
  })),
)

const { tabList, activeTab, tabUniqueKeys, addTab, removeTab, clearTab } = useDisplayTab()

watch(
  () => currentPage.value,
  () => {
    if (tabList.value.filter(item => item.key === currentPage.value).length === 0) {
      const barLabel = displayDynamicComponent.value.find(item => item.key === currentPage.value)
      if (!barLabel) return
      addTab({
        key: currentPage.value,
        title: barLabel.label,
        flowId: currentFlow.value,
      })
    }
    activeTab.value = currentPage.value
  },
)

watch(
  () => currentFlow.value,
  () => {
    const component = displayDynamicComponent.value.find(page => page.key === currentPage.value)?.component
    const key = tabUniqueKeys.value.find(item => item.startsWith(`${currentPage.value}`))
    const a = `${currentPage.value}-${currentFlow.value}#${new Date().getTime()}`
    if (key) {
      tabUniqueKeys.value = tabUniqueKeys.value.filter(item => !item.startsWith(`${currentPage.value}`))
      const tab = tabList.value.find(item => item.key === currentPage.value)
      tab!.flowId = currentFlow.value
      tabUniqueKeys.value.push(a)
    }
    console.log(tabUniqueKeys.value)
    dynamicComponentKey.value = a
    if (!component) {
      clearTab()
      currentComponent.value = Empty
      return
    }
    currentComponent.value =
      displayDynamicComponent.value.find(page => page.key === currentPage.value)?.component || Skeleton
  },
)

function onTableClose(key: string) {
  if (!key) return
  removeTab(key)
}

function useDisplayTab() {
  const activeTab = ref('')

  const tabList = ref<Tab[]>([])
  function addTab(tab: Tab) {
    tabList.value.push(tab)
    tabUniqueKeys.value.push(`${tab.key}-${tab.flowId}#${new Date().getTime()}`)
  }

  function removeTab(key: string) {
    const tab = tabList.value.find(item => item.key === key)
    if (!tab) return
    tabList.value = tabList.value.filter(item => item.key !== key)
    tabUniqueKeys.value = tabUniqueKeys.value.filter(item => !item.startsWith(`${tab.key}-${tab.flowId}`))
    if (activeTab.value === tabList.value[tabList.value.length - 1]?.key) {
      return
    }
    activeTab.value = tabList.value[tabList.value.length - 1]?.key || ''
    if (!activeTab.value) emits('change', activeTab.value)
  }

  function clearTab() {
    tabList.value = []
  }

  const tabUniqueKeys = ref<string[]>([])

  return { tabList, activeTab, tabUniqueKeys, addTab, removeTab, clearTab }
}

function onTabChange(tab: Tab) {
  activeTab.value = tab.key
  const foundTab = tabList.value.find(item => item.key === tab.key)
  if (!foundTab) return
  const tabKey = tabUniqueKeys.value.find(item => item.startsWith(`${tab.key}-${tab.flowId}`))
  if (tabKey) {
    dynamicComponentKey.value = tabKey
  }
  currentComponent.value =
    displayDynamicComponent.value.find(page => page.key === activeTab.value)?.component || Skeleton
}
</script>
<template>
  <div class="w-full display-page hide-scrollbar overflow-y-scroll">
    <TabBar class="px-[10px]" :active-key="activeTab" :tab-list="tabList" @change="onTabChange" @close="onTableClose" />
    <main class="px-[10px] w-full display-container">
      <transition name="slide" mode="out-in">
        <keep-alive>
          <component :key="dynamicComponentKey" :is="currentComponent"></component>
        </keep-alive>
      </transition>
    </main>
  </div>
</template>
<style scoped>
.display-container {
  height: calc(100% - 36px);
}
.display-page {
  background: var(--ops-bg-color);
}
.hide-scrollbar {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

/* Webkit browsers */
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.slide-enter-active,
.slide-leave-active {
  transition:
    transform 0.4s,
    opacity 0.4s;
}
.slide-enter,
.slide-leave-to {
  opacity: 0;
}
</style>
