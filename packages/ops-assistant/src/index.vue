<script setup lang="ts">
import { computed, ref, shallowRef, onBeforeUnmount } from 'vue'
import FrontPage from './pages/FrontPage.vue'
import CorePage from './Core.vue'
import { useFlow } from '@aops-assistant/stores/flow'

const { setCurrentFlow } = useFlow()

const currentPage = ref('frontPage')
const currentComponent = computed(() => pages.value.find(page => page.key === currentPage.value)?.component)
const pages = shallowRef([
  {
    key: 'frontPage',
    component: FrontPage,
  },
  {
    key: 'core',
    component: CorePage,
  },
])

function handleChangePage(page: string, _content?: string, _pluginList?: string[]) {
  currentPage.value = page || 'frontPage'
}

onBeforeUnmount(() => {
  setCurrentFlow('')
})
</script>
<template>
  <div class="h-full flex justify-center">
    <Suspense>
      <component :is="currentComponent" @change-page="handleChangePage"></component>

      <template #fallback> 正在加载... </template>
    </Suspense>
  </div>
</template>
<style scoped></style>
