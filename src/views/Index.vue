<script lang="ts" setup>
import type { RouteRecordRaw } from 'vue-router'
import { onBeforeMount, ref } from 'vue'
import BasicLayout from '@/layouts/BasicLayout.vue'
import GlobalFooter from '@/components/GlobalFooter.vue'
import RightContent from '@/components/GlobalHeader/RightContent.vue'
import { useRouteStore } from '@/store'

const { routeMap } = useRouteStore()
const menus = ref<RouteRecordRaw[]>()

onBeforeMount(() => {
  const routes = routeMap.find(item => item.path === '/')
  menus.value = routes && routes.children
})
</script>

<template>
  <BasicLayout :menus="menus || []">
    <template #menuHeaderLogo>
      <div class="logo">
        <div class="logo-content">
          <img style="width: 22px;" src="@/assets/imgs/openeuler_logo.png" alt="logo">
          <img class="openeuler" src="@/assets/imgs/openeuler.png" alt="logo">
        </div>
        <h1>A-Ops</h1>
      </div>
    </template>
    <template #headerRight>
      <RightContent />
    </template>
    <template #footer>
      <GlobalFooter />
    </template>
  </BasicLayout>
</template>

<style lang="less" scoped>
.logo {
  display: flex;
  align-items: center;
  &-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    .openeuler {
      filter: var(--openeuler-logo-filter)
    }
  }
  img {
    width: 32px;
    height: auto;
  }
  h1 {
    font-size: 20px;
    margin: 0 0 0 25px;
    font-family: Avenir, Helvetica Neue, Arial, Helvetica, sans-serif;
    font-weight: 600;
    vertical-align: middle;
    color: #3265f2;
  }
}
</style>
