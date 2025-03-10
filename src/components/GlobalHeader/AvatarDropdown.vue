<script lang="ts" setup>
import { ExclamationCircleOutlined, KeyOutlined, LogoutOutlined, UserOutlined } from '@ant-design/icons-vue'
import { createVNode, ref } from 'vue'
import { Modal } from 'ant-design-vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import ChangePasswordModal from './ChangePasswordModal.vue'
import { useAccountStore } from '@/store'
import actions from '@/actions'

const { t } = useI18n()

const { userInfo } = storeToRefs(useAccountStore())

async function handleLogout() {
  Modal.confirm({
    title: t('sentence.sureForOut'),
    icon: createVNode(ExclamationCircleOutlined),
    onOk: async () => {
      const { logout } = useAccountStore()
      actions.setGlobalState({ logout: true })
      await logout()
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
        <!-- <a-menu-item key="center">
          <ChangePasswordModal v-model:visible="isModalVisible">
            <template #button>
              <span @click="isModalVisible = true"> <KeyOutlined /> {{ t('common.changePass') }} </span>
            </template>
          </ChangePasswordModal>
        </a-menu-item>
        <a-menu-divider /> -->
        <a-menu-item key="logout" @click="handleLogout"> <LogoutOutlined /> {{ t('common.signOut') }} </a-menu-item>
      </a-menu>
    </template>
  </a-dropdown>
</template>
