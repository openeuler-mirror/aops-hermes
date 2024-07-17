<script lang="ts" setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function toHome() {
  router.push('/')
}
</script>

<template>
  <a-result status="500" title="500" sub-title="Sorry, the server is reporting an error.">
    <template #extra>
      <a-button type="primary" @click="toHome">
        Back Home
      </a-button>
    </template>
  </a-result>
</template>
