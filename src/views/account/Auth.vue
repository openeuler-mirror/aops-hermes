<script setup lang="ts">
import { api } from "@/api";
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAccountStore } from "@/store";

const route = useRoute();
const router = useRouter();

const isAuthing = ref(true);

const { saveInfo } = useAccountStore();
async function auth(code: string) {
  isAuthing.value = true;

  const [_, res] = await api.queryTokenByAuthCode(code);
  if (!_ && res) {
    saveInfo({
      username: res.username,
      token: res.token,
      type: res.type || "",
    });
    setTimeout(() => {
      router.push("/eulercopilot");
      isAuthing.value = false;
    }, 1000);
  } else {
    isAuthing.value = false;
  }
}

onMounted(() => {
  const code = route.query.code as string;
  if (code) auth(code);
});
</script>
<template>
  <div class="flex justify-center">
    <div
      class="flex items-center justify-center w-[250px] h-[250px] rounded-sm"
    >
      <div class="flex flex-col gap-3" v-if="isAuthing">
        <div class="auth-loading" />
        <h2>Loading...</h2>
      </div>
    </div>
  </div>
</template>
<style scoped>
.auth-loading {
  -webkit-animation: spin 1s linear infinite;
  animation: spin 1s linear infinite;
  border: 14px solid #ddd;
  border-bottom: 14px solid #64b5f6;
  border-radius: 50%;
  width: 85px;
  height: 85px;
}

@-webkit-keyframes spin {
  0% {
    -webkit-transform: rotate(0deg);
  }
  100% {
    -webkit-transform: rotate(-360deg);
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(-360deg);
  }
}

h2 {
  animation: typing 1s infinite;
  font-size: 20px;
  overflow: hidden;
  line-height: 30px;
}

@keyframes typing {
  from {
    width: 82%;
  }
  to {
    width: 100%;
  }
}
</style>
