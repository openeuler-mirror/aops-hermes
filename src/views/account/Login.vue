<script lang="ts" setup>
import { useRouter } from 'vue-router'
import { LockOutlined, UserOutlined } from '@ant-design/icons-vue'
import type { Rule } from 'ant-design-vue/es/form'
import { notification } from 'ant-design-vue'
import { onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAccountStore } from '@/store'
import { api } from '@/api'

const router = useRouter()
const { t } = useI18n()

interface Form {
  username: string
  password: string
}

const formRef = ref()

const loginLoading = ref(false)

const form = reactive<Form>({
  username: '',
  password: '',
})

const rules: Record<string, Rule[]> = {
  username: [{ required: true, message: t('assests.validateMsg.username'), trigger: 'change' }],
  password: [{ required: true, message: t('users.validateMsg.passwordThree'), trigger: 'change' }],
}

function goRegister() {
  router.push('/user/register')
}

async function handleSubmit() {
  loginLoading.value = true
  try {
    await formRef.value.validate()
    const { login } = useAccountStore()
    const res = await login({ username: form.username, password: form.password })
    if (res) {
      router.push('/')
      setTimeout(() => {
        notification.success({
          message: t('account.sentence.welcome'),
          description: t('account.sentence.welcomeBack'),
        })
      }, 1000)
    }
  }
  catch {
  }
  finally {
    loginLoading.value = false
  }
}

async function toGitee() {
  const [_, res] = await api.LoginInGitee()
  if (res)
    window.location.href = res.gitee
}

onMounted(() => {

})
</script>

<template>
  <div class="login">
    <a-form ref="formRef" class="user-layout-login" :model="form" :rules="rules">
      <a-form-item name="username">
        <a-input v-model:value="form.username" class="login-input" :placeholder="$t('users.username')" autocomplete="off">
          <template #prefix>
            <UserOutlined />
          </template>
        </a-input>
      </a-form-item>

      <a-form-item name="password">
        <a-input-password v-model:value="form.password" class="login-input" :placeholder="$t('account.password')">
          <template #prefix>
            <LockOutlined />
          </template>
        </a-input-password>
      </a-form-item>

      <a-form-item>
        <div class="login-gitee" style="text-align: center">
          <div style="cursor: pointer" @click="toGitee">
            <img src="https://gitee.com/static/images/logo-black.svg?t=158106666" alt="">
            <span class="login-gitee-text">{{ $t('account.useGitee') }}</span>
          </div>
        </div>
      </a-form-item>

      <a-form-item style="margin-top: 24px">
        <a-button
          class="login-button"
          size="large"
          type="primary"
          html-type="submit"
          :loading="loginLoading"
          @click="handleSubmit"
        >
          {{ $t('account.login') }}
        </a-button>
      </a-form-item>

      <a-form-item style="margin-top: 24px">
        <div class="jump-registar">
          <a-space>
            <span>{{ $t('account.noAccount') }} </span>
            <span class="spin-top-jump" @click="goRegister"> {{ $t('account.register') }}</span>
          </a-space>
        </div>
      </a-form-item>
    </a-form>
  </div>
</template>

<style lang="less" scoped>
.login {
  .user-layout-login {
    .login-input {
      border: none;
      border-radius: 0;
      height: 40px;
      border-bottom: 1px solid #ccc;
      :deep(.ant-input) {
        border: none;
      }
    }
    .login-button {
      width: 100%;
      background-color: #002fa7;
      border-radius: 0;
    }
  }
  .login-gitee {
    img {
      width: 62px;
    }
    .login-gitee-text {
      font-size: 16px;
      padding-left: 10px;
      line-height: 40px;
    }
  }
  .jump-registar {
    text-align: right;
    margin-top: -20px;
    .spin-top-jump {
      color: #005980;
      cursor: pointer;
    }
  }
}
</style>
