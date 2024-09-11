<script setup lang="ts">
import { api } from '@/api'
import { message } from 'ant-design-vue'
import { Rule } from 'ant-design-vue/es/form'
import { computed, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

interface Form {
  operate_name: string
}

const props = withDefaults(
  defineProps<{
    visible: boolean
    operationId?: string
  }>(),
  {
    visible: false,
  },
)

const emits = defineEmits(['success', 'cancel'])
const { t } = useI18n()
const form = reactive<Form>({
  operate_name: '',
})
const formRef = ref()

const rules = computed<Record<string, Rule[]>>(() => ({
  operate_name: [
    { required: true, message: t('execution.script.validate.requireInputOperate'), trigger: 'blur' },
    {
      max: 128,
      trigger: 'change',
      message: t('execution.script.validate.notOver128Character', { key: t('execution.operate.operateName') }),
    },
  ],
}))

const isSubmiting = ref(false)

/** Create new operation  */
async function createNewOperation() {
  try {
    await formRef.value!.validate()
    isSubmiting.value = true

    const [_] = await api.createNewOperation(form)
    if (!_) {
      isSubmiting.value = false
      message.success(t('common.createSuccess'))
      formRef.value.resetFields()
      emits('success')
    }
  } finally {
    isSubmiting.value = false
  }
}

/**
 * Get specific operation
 */
async function getSpecificOperation(operateId: string) {
  if (!operateId) return
  const [_, res] = await api.querySpecificOperate(operateId)
  if (res) {
    form.operate_name = res.operate_name
  }
}

/**
 * Update operation
 * @param {string}operateId - The ID of the operation to update.
 */
async function updateOperation(operateId: string) {
  isSubmiting.value = true
  try {
    await formRef.value!.validate()
    const [, res] = await api.updateOperate(operateId, form)
    if (res) {
      isSubmiting.value = false
      message.success(t('common.editSuccess'))
      formRef.value.resetFields()
      emits('success')
    }
  } finally {
    isSubmiting.value = false
  }
}

function handleConfirm() {
  if (!props.operationId) createNewOperation()
  else updateOperation(props.operationId)
}

function handleClose() {
  formRef.value.resetFields()
  emits('cancel')
}

watch(
  () => props.visible,
  () => {
    if (!props.visible) return
    if (props.operationId) {
      getSpecificOperation(props.operationId)
    }
  },
)
</script>
<template>
  <a-modal
    :open="visible"
    :title="operationId ? t('execution.script.editOperate') : t('execution.script.newOperate')"
    :confirm-loading="isSubmiting"
    destroy-on-close
    @ok="handleConfirm"
    @cancel="handleClose"
  >
    <a-form
      ref="formRef"
      style="margin-top: 20px"
      :model="form"
      :rules="rules"
      :label-col="{ span: 6 }"
      :wrapper-col="{ span: 16 }"
    >
      <a-form-item name="operate_name" :label="t('execution.script.operateName')">
        <a-input
          v-model:value="form.operate_name"
          type="text"
          :placeholder="t('execution.script.validate.requireInputOperate')"
          autocomplete="off"
        />
      </a-form-item>
    </a-form>
  </a-modal>
</template>
<style scoped></style>

