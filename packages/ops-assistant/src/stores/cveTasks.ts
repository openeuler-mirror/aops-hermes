import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface CveTask {
  taskId: string
  fixWay: 'coldpatch' | 'hotpatch'
}

export const useCveTask = defineStore('cveTask', () => {
  const visibleTaskIdList = ref<CveTask[]>([])

  const allTasks = ref<CveTask[]>([])

  function setAllTasks(tasks: CveTask[]) {
    allTasks.value = tasks
  }

  return {
    allTasks,
    visibleTaskIdList,
    setAllTasks,
  }
})
