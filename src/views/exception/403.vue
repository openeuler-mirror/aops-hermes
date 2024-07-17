<script lang="ts" setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function toHome() {
  router.push('/')
}
</script>

<template>
  <a-result status="403" title="403" sub-title="Sorry, you don't have access to this page.">
    <template #extra>
      <a-button type="primary" @click="toHome">
        Back Home
      </a-button>
    </template>
  </a-result>
</template>
