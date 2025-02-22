import { defineStore } from 'pinia'
import { ref } from 'vue'

import { useDisplay } from './display'

export interface DisplayTab {
  key: string
  title: string
}

const displayTabsMap: Record<string, string> = {
  overview: '概览',
  cves: '漏洞',
  taskDetail: '任务详情',
}

export const useCves = defineStore('cves', () => {

  const currentPage = ref<string>('loading')

  /**
   * change the display page
   * @param page
   */
  function setCurrentPage(page: string) {
    if (currentPage.value === page) {
      const { reloadDynamicPage } = useDisplay()
      reloadDynamicPage()
      return
    }
    currentPage.value = page
  }

  const displayTabs = ref<DisplayTab[]>([])

  function setDisplayTab(tab: string, title?: string) {
    if (displayTabs.value.map((item) => item.key).includes(tab)) return
    displayTabs.value.push({
      key: tab,
      title: title || displayTabsMap[tab],
    })
  }

  const selectedCveIds = ref<string[]>([])
  return {
    selectedCveIds,
    displayTabs,
    currentPage,
    setCurrentPage,
    setDisplayTab,
  }
})
