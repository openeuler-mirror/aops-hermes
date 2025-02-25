<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { shallowRef, ref, watch } from 'vue'
import { useDisplay } from '@aops-assistant/stores/display'
import Skeleton from '@aops-assistant/components/Skeleton.vue'
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

const { tabList, activeTab, addTab, removeTab } = useDisplayTab()

watch(
  () => currentPage.value,
  () => {
    if (tabList.value.filter(item => item.key === currentPage.value).length === 0) {
      addTab({
        key: currentPage.value,
        title: displayDynamicComponent.value.find(item => item.key === currentPage.value)?.label || '',
        flowId: currentFlow.value,
      })
    }
    activeTab.value = currentPage.value
    dynamicComponentKey.value = `${currentPage.value}-${currentFlow.value}`
    currentComponent.value =
      displayDynamicComponent.value.find(page => page.key === currentPage.value)?.component || Skeleton
  },
)

watch(
  () => currentFlow.value,
  () => {
    dynamicComponentKey.value = `${currentPage.value}-${currentFlow.value}`
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
  }

  function removeTab(key: string) {
    tabList.value = tabList.value.filter(item => item.key !== key)
    if (activeTab.value === tabList.value[tabList.value.length - 1]?.key) {
      return
    }
    activeTab.value = tabList.value[tabList.value.length - 1]?.key || ''
    if (!activeTab.value) emits('change', activeTab.value)
  }

  return { tabList, activeTab, addTab, removeTab }
}

function onTabChange(tab: Tab) {
  activeTab.value = tab.key
  dynamicComponentKey.value = `${tab.key}-${tab.flowId}`
  currentComponent.value =
    displayDynamicComponent.value.find(page => page.key === activeTab.value)?.component || Skeleton
}
</script>
<template>
  <div class="w-full display-page hide-scrollbar overflow-y-scroll">
    <TabBar class="px-[10px]" :active-key="activeTab" :tab-list="tabList" @change="onTabChange" @close="onTableClose" />
    <main class="px-[10px] w-full">
      <transition name="slide" mode="out-in">
        <keep-alive>
          <component :key="dynamicComponentKey" :active-flow="dynamicComponentKey" :is="currentComponent"></component>
        </keep-alive>
      </transition>
    </main>
  </div>
</template>
<style scoped>
.display-page {
  background: rgb(235, 239, 246);
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
