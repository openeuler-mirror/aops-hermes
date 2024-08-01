<script setup lang='ts'>
import type { FormInstance, Rule } from 'ant-design-vue/es/form'
import { reactive, ref } from 'vue'
import { message } from 'ant-design-vue'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { api } from '@/api'
import { useAccountStore, useLangStore } from '@/store'

interface Form {
  oldPassword: string
  password: string
  confirmPassword: string
}

defineProps<{
  visible: boolean
}>()

const emit = defineEmits(['update:visible'])

const { t } = useI18n()
const { lang } = storeToRefs(useLangStore())

const fromRef = ref<FormInstance>()
const form = reactive<Form>({
  oldPassword: '',
  password: '',
  confirmPassword: '',
})

const rules: Record<string, Rule[]> = {
  oldPassword: [{
    validator: validateOldPassword,
    trigger: 'blur',
  }],
  password: [{ validator: validatePassword, trigger: 'blur' }],
  confirmPassword: [{ validator: validateConfirmPassword, trigger: 'blur' }],
}

/**
 * @param _rule
 * @param value
 */
function validateOldPassword(_rule: Rule, value: string) {
  const regex = /^[a-z0-9]{6,20}$/i
  if (!regex.test(value)) {
    return Promise.reject(
      new Error(t('account.validateMsg.passwordOne')),
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
      new Error(t('account.validateMsg.passwordOne')),
    )
  }
  else {
    if (value && value === form.oldPassword)
      return Promise.reject(new Error(t('account.validateMsg.diffPass')))
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
      new Error(t('account.validateMsg.passwordOne')),
    )
  }
  else {
    if (value && value !== form.password)
      return Promise.reject(new Error(t('account.validateMsg.passwordTwo')))
  }
  return Promise.resolve()
}

const isSubmiting = ref(false)

async function handleConfirm() {
  isSubmiting.value = true
  try {
    await fromRef.value!.validate()
    const { username } = useAccountStore().userInfo!
    const { oldPassword, password } = form
    const [_] = await api.changePassword(
      username,
      oldPassword,
      password,
    )
    if (!_) {
      emit('update:visible', false)
      message.success(t('common.succeed'))
      fromRef.value?.resetFields()
    }
  }
  catch {}
  finally {
    isSubmiting.value = false
  }
}
function handleClose() {
  emit('update:visible', false)
}
</script>

<template>
  <div class="change-password">
    <slot name="button" />

    <a-modal
      :open="visible" :title="$t('common.changePass')" @ok="handleConfirm"
      @cancel="handleClose"
    >
      <a-form ref="fromRef" :model="form" :rules="rules" :label-col="{ span: lang === 'zh_cn' ? 5 : 7 }">
        <a-form-item
          :label="$t('account.currentPass')"
          name="oldPassword"
        >
          <a-input-password v-model:value="form.oldPassword" :placeholder="$t('account.palceHolder.password')" />
        </a-form-item>

        <a-form-item
          :label="$t('account.newPass')"
          name="password"
        >
          <a-input-password v-model:value="form.password" :placeholder="$t('account.palceHolder.password')" />
        </a-form-item>

        <a-form-item
          :label="$t('account.reNewPass')"
          name="confirmPassword"
        >
          <a-input-password v-model:value="form.confirmPassword" :placeholder="$t('account.palceHolder.rePassword')" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<style scoped>
</style>
