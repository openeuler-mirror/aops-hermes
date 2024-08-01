<script setup lang="ts">
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import en from 'ant-design-vue/es/locale/en_US'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import { computed } from 'vue'
import { theme as antdTheme } from 'ant-design-vue'
import { storeToRefs } from 'pinia'
import { useLangStore } from '@/store/langStore'

import { isDark } from '@/composables/dark'

const { lang } = storeToRefs(useLangStore())

dayjs.locale('zh-cn')

const locale = computed(() => lang.value === 'en' ? en : lang.value === 'zh_cn' ? zhCN : zhCN)
</script>

<template>
  <a-config-provider
    :locale="locale"
    :theme="{
      components: {
        Menu: {
          radiusItem: 0,
          itemMarginInline: 0,
          colorActiveBarWidth: 3,
        },
        Input: {
          borderRadius: 2,
        },
        Button: {
          borderRadius: 2,
        },
        Table: {
          borderRadius: 0,
          borderRadiusLG: 0,
        },
        Checkbox: {
          borderRadiusSM: 0,
        },
        Pagination: {
          borderRadius: 2,
        },
        Select: {
          borderRadius: 2,
          borderRadiusSM: 0,
        },
        Modal: {
          borderRadiusLG: 0,
        },
        Alert: {
          borderRadiusLG: 0,
        },
        Message: {
          borderRadiusLG: 0,
        },
        Radio: {
          borderRadius: 0,
        },
        Collapse: {
          borderRadiusLG: 0,
        },
        Dropdown: {
          borderRadiusLG: 0,
          borderRadiusSM: 0,
        },
        Transfer: {
          borderRadius: 0,
          borderRadiusLG: 0,
          borderRadiusSM: 0,
        },
      },
      algorithm: !isDark ? antdTheme.defaultAlgorithm : antdTheme.darkAlgorithm,

    }"
  >
    <div class="aops-app">
      <keep-alive>
        <router-view v-if="$route.meta.keepAlive" />
      </keep-alive>
      <router-view v-if="!$route.meta.keepAlive" />
    </div>
  </a-config-provider>
</template>

<style lang="less" scoped>
.aops-app {
  height: 100vh;
}
</style>
