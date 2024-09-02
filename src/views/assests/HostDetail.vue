<script lang="ts" setup>
import { ref } from 'vue'
import HostOverview from './components/HostDetailOverview.vue'
// import HostPlugin from './components/HostDetailPlugin.vue'
import PageWrapper from '@/components/PageWrapper.vue'

const activeKey = ref('overview')
</script>

<template>
  <PageWrapper>
    <a-card>
      <a-tabs v-model:activeKey="activeKey">
        <a-tab-pane key="overview" :tab="$t('assests.overview')">
          <HostOverview />
        </a-tab-pane>
        <!-- <a-tab-pane key="plugin" :tab="$t('assests.plugin')">
          <HostPlugin />
        </a-tab-pane> -->
      </a-tabs>
    </a-card>
  </PageWrapper>
</template>

<style lang="less" scoped></style>
