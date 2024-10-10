<script setup lang="ts">
import { ref, computed } from 'vue'
import CommandTable from './Commands.vue'
import CommandTask from './OperationTask.vue'
import PageWrapper from '@/components/PageWrapper.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const activeKey = ref('commandManagement')

const tabList = computed<{ key: string; value: string }[]>(() => [
  {
    key: 'commandManagement',
    value: t('execution.command.commandManagement'),
  },
  {
    key: 'commandExecution',
    value: t('execution.command.commandExecution'),
  },
])
</script>

<template>
  <PageWrapper>
    <a-card>
      <a-tabs v-model:activeKey="activeKey" destroy-inactive-tab-pane>
        <a-tab-pane v-for="item in tabList" :key="item.key" :tab="item.value" destroy-inactive-tab-pane>
          <CommandTable v-if="activeKey === 'commandManagement'" />
          <CommandTask v-if="activeKey === 'commandExecution'" task-type="COMMAND_EXECUTION" />
        </a-tab-pane>
      </a-tabs>
    </a-card>
  </PageWrapper>
</template>

<style scoped></style>

