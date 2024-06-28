<script setup lang='ts'>
import type { FormInstance } from 'ant-design-vue'
import { message, notification } from 'ant-design-vue'
import { onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { CheckCircleOutlined, LoadingOutlined, UserAddOutlined } from '@ant-design/icons-vue'
import { useAccountStore } from '@/store'
import { api } from '@/api'

interface Form {
  username: string
  password: string
}

const router = useRouter()

const auth_account = ref()
const countDown = ref(5)

const loginloading = ref(true)
const isbindvisible = ref(false)
const confirmLoading = ref(false)

const formRef = ref<FormInstance>()
const form = reactive<Form>({
  username: '',
  password: '',
})

function goRegistar() {
  isbindvisible.value = false
  formRef.value?.resetFields()
  router.push('/user/reigster')
}

let timer: NodeJS.Timer

function handleCancel() {
  message.info('取消第三方授权！')
  setTimeout(() => {
    router.push('/user/login')
  }, 1000)
  isbindvisible.value = false
}

async function handleOk() {
  confirmLoading.value = true
  try {
    await formRef.value?.validate()
    const [_, res] = await api.bindAccount({
      auth_account: auth_account.value,
      username: form.username,
      password: form.password,
    })

    if (!_ && res) {
      const { saveInfo } = useAccountStore()
      const { username, token, refresh_token, type } = res
      saveInfo({
        username,
        token,
        refreshToken: refresh_token,
        type: type || '',
      })
      message.success('绑定成功！')
      isbindvisible.value = false
      loginloading.value = false
      timer = setInterval(() => {
        countDown.value -= 1
        if (countDown.value === 0) {
          loginSuccess()
          clearInterval(timer)
        }
      }, 1000)
    }
  }
  catch (error) {

  }
  finally {
    confirmLoading.value = false
  }
}

function loginSuccess() {
  router.push({ path: '/' })
  setTimeout(() => {
    notification.success({
      message: '欢迎',
      description: '欢迎回来',
    })
  }, 1000)
}

onMounted(async () => {
  const code = window.location.search.split('=')[1]

  if (!code)
    return
  if (code === 'access_denied&error_description') {
    message.success('拒绝授权！')
    router.push('/user/login')
  }
  else {
    const { authorizeLogin } = useAccountStore()
    const account = await authorizeLogin(code)

    if (!account?.username) {
      router.push('/user/login')
      return
    }
    else if (account.username && !account.token && !account.refreshToken) {
      auth_account.value = account.username
      isbindvisible.value = true
      return
    }
    loginloading.value = false
    timer = setInterval(() => {
      countDown.value -= 1
      if (countDown.value === 0) {
        loginSuccess()
        clearInterval(timer)
      }
    }, 1000)
  }
})

onBeforeUnmount(() => {
  timer && clearInterval(timer)
})
</script>

<template>
  <div class="user-account">
    <div class="container">
      <div class="spin_top">
        <div v-if="loginloading" class="info">
          gitee授权登录中...
        </div>
        <div v-else>
          <span>授权成功!{{ countDown }}秒后跳转到首页 |</span>
          <span class="spin_top_jump" @click="$router.push('/')">点击立即跳转</span>
        </div>
      </div>
      <div class="spin_footer">
        <a-spin v-if="loginloading" style="margin: auto">
          <template #indicator>
            <LoadingOutlined style="font-size: 40px" spin />
          </template>
        </a-spin>
        <CheckCircleOutlined v-else style="color: #52c41a; margin: auto; font-size: 40px" />
      </div>
    </div>

    <a-modal
      title="绑定本地账户"
      :open="isbindvisible"
      :confirm-loading="confirmLoading"
      @ok="handleOk"
      @cancel="handleCancel"
    >
      <div style="display: flex; align-items: center; margin-bottom: 15px">
        <UserAddOutlined style="margin-right: 18px; font-size: 19px" />
        <span style="font-size: 15px">当前gitee账号尚未绑定本地账号! 绑定一个本地账号以继续登录</span>
      </div>
      <div style="margin-bottom: 23px; margin-left: 37px">
        <span style="font-size: 14px">没有账号? </span>
        <span style="font-size: 14px; color: #005980; cursor: pointer" @click="goRegistar">点此注册</span>
      </div>
      <a-form ref="formRef" :model="form" :label-col="{ span: 5 }" :wrapper-col="{ span: 16 }">
        <a-form-item name="username" label="本地账号" :rules="[{ required: true, message: '请输入本地账号用户名!' }]">
          <a-input
            v-model:value="form.username"
            type="text"
            placeholder="用户名"
          />
        </a-form-item>
        <a-form-item name="password" label="密码" :rules="[{ required: true, message: '请输入密码!' }]">
          <a-input-password
            v-model:value="form.password"
            placeholder="密码"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<style lang="less" scoped>
.user-account {
  height: 280px;
  display: flex;
  .container {
    margin: 0 auto;
    .spin_top {
      .info {
        font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
        font-size: 17px;
        text-align: center;
      }
      .spin_top_jump {
        color: #1890ff;
        margin-left: 5px;
        cursor: pointer;
      }
    }
    .spin_footer {
      display: flex;
      margin-top: 105px;
    }
  }
}
</style>
