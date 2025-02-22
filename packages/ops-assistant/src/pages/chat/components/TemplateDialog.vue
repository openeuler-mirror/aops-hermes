<script setup lang="ts">
import { computed, ref } from 'vue'
import EXPERTISE from '../../../images/expertise.png'
import EXPAND_KNOWLEDGE from '../../../images/expand_knowledge.png'
import APPLICATION_CASE from '../../../images/application_case.png'
import GENERAL_KNOWLEDGE from '../../../images/general_knowledge.png'

const recommendList = computed(() => [
  {
    key: 'os_knowledge',
    value: 'OS领域通用知识问答',
    desc: '包含Linux常规知识、上游信息和工具链介绍及指导',
    icon: GENERAL_KNOWLEDGE,
  },
  {
    key: 'openEuler_expertise',
    value: 'OpenEuler专业知识',
    desc: '包含openEuler社区信息、技术原理和使用指导',
    icon: EXPERTISE,
  },
  {
    key: 'beyond_openEuler',
    value: 'openEuler扩展知识',
    desc: '包含openEuler周边硬件特性知识和ISV、OSV相关信息',
    icon: EXPAND_KNOWLEDGE,
  },
  {
    key: 'openEuler_use_cases',
    value: 'openEuler应用案例',
    desc: '包含openEuler技术案例、行业应用案例',
    icon: APPLICATION_CASE,
  },
])

const listRef = ref<HTMLElement | null>(null)
</script>
<template>
  <div class="w-full flex flex-col items-center mt-[10px]">
    <p>您好，很高兴为您服务</p>
    <ul ref="listRef" class="w-full recommend-list grid bg-[var(--ops-bg-color--panel)] rounded-[6px] p-2 mt-3">
      <li v-for="item in recommendList" :key="item.key" class="flex items-center m-2">
        <img class="h-[32px]" :src="item.icon" alt="" />
        <div class="ml-2">
          <p class="text-base">{{ item.value }}</p>
          <p class="text-[11px]">{{ item.desc }}</p>
        </div>
      </li>
    </ul>
  </div>
</template>
<style lang="less" scoped>
.recommend-list {
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
}
</style>
