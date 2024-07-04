<script setup lang="ts">
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import { ref } from 'vue'

dayjs.locale('zh-cn')

const theme = ref({
  white: '#ffffff',
  borderRadius: 2,
  colorPrimary: '#002FA7',
  colorItemTextHover: '#1890ff',
})

const locale = ref(zhCN)
</script>

<template>
  <a-config-provider
    :locale="locale"
    :theme="{
      components: {
        Menu: {
          radiusItem: 0,
          colorItemBgHover: theme.white,
          colorSubItemBg: theme.white,
          itemMarginInline: 0,
          colorItemText: 'rgba(0, 0, 0, 0.6)',
          colorItemTextSelected: '#1677ff',
          colorItemTextHover: '#1677ff',
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
