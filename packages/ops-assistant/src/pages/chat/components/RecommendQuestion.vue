<script setup lang="ts">
import { useConversation } from '@aops-assistant/stores/conversation'
import type { RecommendItem } from '@aops-assistant/stores/conversation'
import { storeToRefs } from 'pinia'

const props = defineProps({
  recommendList: {
    type: Array<RecommendItem>,
    default: () => [],
  },
})

const emits = defineEmits<{
  (e: 'select', question: RecommendItem): void
}>()

const { currentRecommend } = storeToRefs(useConversation())

function onRecommendClick(recommend: RecommendItem) {
  currentRecommend.value = recommend
  emits('select', recommend)
}
</script>
<template>
  <div class="flex ml-[82px] mt-[16px]">
    <p class="text-[12px] h-[32px] flex items-center">你可以继续问我：</p>
    <ul class="flex flex-col flex-1">
      <li
        v-for="(item, key) in props.recommendList"
        :key="key"
        class="cursor-pointer px-[16px] py-[8px] rounded-[8px] text-[12px] bg-[var(--ops-bg-color--panel)] inline w-fit recommend mr-2 mb-2"
        @click="onRecommendClick(item)"
      >
        {{ item.question }}
      </li>
    </ul>
  </div>
</template>
<style scoped lang="less">
.recommend {
  &:hover {
    background-image: linear-gradient(to right, rgba(109, 117, 250, 0.8), rgba(90, 179, 255, 0.8));
    color: #fff;
  }
  &:active {
    background-image: linear-gradient(to right, rgba(109, 117, 250, 1), rgba(90, 179, 255, 1));
    color: #fff;
  }
}
</style>
