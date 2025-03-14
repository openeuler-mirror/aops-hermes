<script setup lang="ts">
defineProps<{
  content: string
  createTime?: string
}>()
</script>
<template>
  <div class="flex flex-col mt-3">
    <div class="flex justify-center text-[12px]">
      <span class="bg-[var(--ops-bg-color--secondary)] px-[8px] py-[1px] rounded-[12px] text-[rgb(78,88,101 )]">
        {{ createTime }}
      </span>
    </div>
    <div class="flex items-start mt-2">
      <img class="w-[42px] h-[42px] mr-[16px]" src="../../../images/dark_user.png" alt="" />
      <div class="panel break-all p-[16px] min-h-[42px] rounded-r-[6px] rounded-bl-[6px]">{{ content }}</div>
    </div>
  </div>
</template>
<style scoped>
.panel {
  background-image: linear-gradient(to right, rgba(109, 117, 250, 0.2), rgba(90, 179, 255, 0.2));
}
</style>
