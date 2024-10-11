<script setup lang="ts">
import { ref, computed } from 'vue'
import ScriptTable from './Scripts.vue'
import OperationTask from './OperationTask.vue'
import PageWrapper from '@/components/PageWrapper.vue'
import OperationManagement from './Operations.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const activeKey = ref('scriptManagement')

const tabList = computed<{ key: string; value: string }[]>(() => [
  {
    key: 'scriptManagement',
    value: t('execution.script.scriptManagement'),
  },
  {
    key: 'scriptExecution',
    value: t('execution.script.scriptExecution'),
  },
  {
    key: 'operationManagement',
    value: t('execution.script.operationManagement'),
  },
])
</script>

<template>
  <PageWrapper>
    <a-card>
      <a-tabs v-model:activeKey="activeKey" destroy-inactive-tab-pane>
        <a-tab-pane v-for="item in tabList" :key="item.key" :tab="item.value" destroy-inactive-tab-pane>
          <ScriptTable v-if="activeKey === 'scriptManagement'" />
          <OperationTask v-if="activeKey === 'scriptExecution'" task-type="SCRIPT_EXECUTION" />
          <OperationManagement v-if="activeKey === 'operationManagement'" />
        </a-tab-pane>
      </a-tabs>
    </a-card>
  </PageWrapper>
</template>

<style scoped></style>

