<script lang="ts" setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function toHome() {
  router.push('/')
}
</script>

<template>
  <a-result status="404" title="404" sub-title="Sorry, the page you visited does not exist.">
    <template #extra>
      <a-button type="primary" @click="toHome">
        Back Home
      </a-button>
    </template>
  </a-result>
</template>
