<script setup lang='ts'>
import type { FormInstance, Rule } from 'ant-design-vue/es/form'
import { reactive, ref } from 'vue'
import { message } from 'ant-design-vue'
import { api } from '@/api'
import { useAccountStore } from '@/store'

defineProps<{
  visible: boolean
}>()

const emit = defineEmits(['update:visible'])

interface Form {
  oldPassword: string
  password: string
  confirmPassword: string
}

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
      new Error('请输入6-20位字母和数字组成的密码!'),
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
  else {
    if (value && value === form.oldPassword)
      return Promise.reject(new Error('新密码和当前密码不能相同！'))
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
  else {
    if (value && value !== form.password)
      return Promise.reject(new Error('确认密码和新密码必须保持一致!'))
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
      message.success('修改成功')
      fromRef.value?.resetFields()
    }
  }
  catch (error) {

  }
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
      :open="visible" title="修改密码" @ok="handleConfirm"
      @cancel="handleClose"
    >
      <a-form ref="fromRef" :model="form" :rules="rules" :label-col="{ span: 5 }">
        <a-form-item
          label="当前密码"
          name="oldPassword"
        >
          <a-input-password v-model:value="form.oldPassword" placeholder="密码长度6-20位, 包含字母和数字" />
        </a-form-item>

        <a-form-item
          label="新密码"
          name="password"
        >
          <a-input-password v-model:value="form.password" placeholder="新密码和当前密码不能相同" />
        </a-form-item>

        <a-form-item
          label="确认密码"
          name="confirmPassword"
        >
          <a-input-password v-model:value="form.confirmPassword" placeholder="确认密码和新密码保持一致" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<style scoped>
</style>
