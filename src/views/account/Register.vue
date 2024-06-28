<script lang="ts" setup>
import { useRouter } from 'vue-router'
import { LockOutlined, UserOutlined } from '@ant-design/icons-vue'
import { reactive, ref } from 'vue'
import { type FormInstance, message } from 'ant-design-vue'
import type { Rule } from 'ant-design-vue/es/form'
import { api } from '@/api'

const router = useRouter()

interface Form {
  username: string
  password: string
  confirmPassword: string
  email: string
}
const formRef = ref<FormInstance>()
const form = reactive<Form>({
  username: '',
  password: '',
  confirmPassword: '',
  email: '',
})

const rules: Record<keyof Form, Rule[]> = {
  username: [{
    validator: validateUsername,
    trigger: 'blur',
  }],
  password: [{ validator: validatePassword, trigger: 'blur' }],
  confirmPassword: [{ validator: validateConfirmPassword, trigger: 'blur' }],
  email: [{ validator: validateEmail, trigger: 'blur' }],
}

/**
 * @param _rule
 * @param value
 */
function validateUsername(_rule: Rule, value: string) {
  const regex = /^[a-z0-9]{5,20}$/i
  if (!regex.test(value)) {
    return Promise.reject(
      new Error('请输入5-20位字母和数字组成的用户名!'),
    )
  }
  return Promise.resolve()
}
/**
 * @param _rule
 * @param value
 */
function validatePassword(_rule: Rule, value: string) {
  const regex = /^[a-z0-9]{6,20}$/i
  if (!regex.test(value)) {
    return Promise.reject(
      new Error('请输入6-20位字母和数字组成的密码!'),
    )
  }
  return Promise.resolve()
}
/**
 * @param _rule
 * @param value
 */
function validateEmail(_rule: Rule, value: string) {
  const regex = /^[\w.%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i
  if (!regex.test(value)) {
    return Promise.reject(
      new Error('请输入正确的邮箱格式!'),
    )
  }
  return Promise.resolve()
}
/**
 * @param _rule
 * @param value
 */
function validateConfirmPassword(_rule: Rule, value: string) {
  const regex = /^[a-z0-9]{6,20}$/i
  if (!regex.test(value)) {
    return Promise.reject(
      new Error('请输入6-20位字母和数字组成的密码!'),
    )
  }
  else if (value && value !== form.password) {
    return Promise.reject(
      new Error('请确保前后两次输入的密码保持一致！'),
    )
  }
  return Promise.resolve()
}

function backLogin() {
  router.push('/user/login')
}

const isSubmiting = ref(false)
async function handlerRegister() {
  isSubmiting.value = true
  try {
    await formRef.value?.validate()
    const { username, password, email } = form
    const [_] = await api.register({ username, password, email })
    if (!_) {
      message.success('注册成功')
      setTimeout(() => {
        router.push('/user/login')
        formRef.value?.resetFields()
      }, 500)
    }
  }
  catch (error) {

  }
  finally {
    isSubmiting.value = false
  }
}
</script>

<template>
  <div class="register">
    <a-form id="formRegister" ref="formRef" class="user-layout-register" :model="form" :rules="rules">
      <a-form-item
        name="username"
      >
        <a-input
          v-model:value="form.username"
          class="register-input"
          placeholder="用户名5-20位,包含字母或数字"
        >
          <template #prefix>
            <UserOutlined style="color: rgba(0, 0, 0, 0.25)" />
          </template>
        </a-input>
      </a-form-item>

      <a-form-item name="password">
        <a-input-password
          v-model:value="form.password"
          class="register-input"
          placeholder="密码长度6-20位,包含字母或数字"
        >
          <template #prefix>
            <LockOutlined style="color: rgba(0, 0, 0, 0.25)" />
          </template>
        </a-input-password>
      </a-form-item>

      <a-form-item name="confirmPassword">
        <a-input-password
          v-model:value="form.confirmPassword"
          class="register-input"
          placeholder="确认前后两次输入的密码保持一致"
        >
          <template #prefix>
            <LockOutlined style="color: rgba(0, 0, 0, 0.25)" />
          </template>
        </a-input-password>
      </a-form-item>

      <a-form-item name="email">
        <a-input
          v-model:value="form.email"
          class="register-input"
          placeholder="输入邮箱地址: eg: xxxx@163.com"
        >
          <template #prefix>
            <UserOutlined style="color: rgba(0, 0, 0, 0.25)" />
          </template>
        </a-input>
      </a-form-item>

      <a-form-item style="margin-top: 24px">
        <a-button class="register-button" size="large" type="primary" html-type="submit" :loading="isSubmiting" @click="handlerRegister">
          注册
        </a-button>
      </a-form-item>

      <a-form-item style="margin-top: 24px">
        <div class="jump-login">
          <span>已有账号? </span>
          <span class="spin-top-jump" @click="backLogin">返回登录</span>
        </div>
      </a-form-item>
    </a-form>
  </div>
</template>

<style lang="less" scoped>
.register {
  .user-layout-register {
    .register-input {
      border: none;
      border-radius: 0;
      height: 40px;
      border-bottom: 1px solid #ccc;
      :deep(.ant-input) {
        border: none;
      }
    }
    .register-button {
      width: 100%;
      border-radius: 0;
      background-color: #002fa7;
    }
    .jump-login {
      text-align: right;
      margin-top: -20px;
      .spin-top-jump {
        color: #005980;
        cursor: pointer;
      }
    }
  }
}
</style>
