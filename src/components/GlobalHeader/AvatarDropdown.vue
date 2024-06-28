<script lang="ts" setup>
import { useRouter } from 'vue-router'
import { ExclamationCircleOutlined, KeyOutlined, LogoutOutlined, UserOutlined } from '@ant-design/icons-vue'
import { createVNode, ref } from 'vue'
import { Modal } from 'ant-design-vue'
import { storeToRefs } from 'pinia'
import ChangePasswordModal from './ChangePasswordModal.vue'
import { useAccountStore } from '@/store'

const router = useRouter()

const { userInfo } = storeToRefs(useAccountStore())

async function handleLogout() {
  Modal.confirm({
    title: '确定注销账号吗?',
    icon: createVNode(ExclamationCircleOutlined),
    onOk: async () => {
      const { logout } = useAccountStore()
      const res = await logout()
      if (res)
        router.push('/user/login')
    },

  })
}

const isModalVisible = ref(false)
</script>

<template>
  <a-dropdown placement="bottomRight" arrow>
    <span>
      <a-avatar size="small">
        <template #icon><UserOutlined /></template>
      </a-avatar>
      {{ userInfo ? userInfo.username : '' }}
    </span>
    <template #overlay>
      <a-menu>
        <a-menu-item key="center">
          <ChangePasswordModal v-model:visible="isModalVisible">
            <template #button>
              <span @click=" isModalVisible = true">
                <KeyOutlined /> 修改密码
              </span>
            </template>
          </ChangePasswordModal>
        </a-menu-item>
        <a-menu-divider />
        <a-menu-item key="logout" @click="handleLogout">
          <LogoutOutlined /> 退出登录
        </a-menu-item>
      </a-menu>
    </template>
  </a-dropdown>
</template>
