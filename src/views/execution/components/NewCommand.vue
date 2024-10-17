<script setup lang="ts">
import { message } from 'ant-design-vue'
import type { Rule } from 'ant-design-vue/es/form'
import { computed, reactive, ref, watch } from 'vue'
import { api } from '@/api'
import { useI18n } from 'vue-i18n'

interface Form {
  command_name: string
  timeout: string
  content: string
  lang?: string
}

const props = withDefaults(
  defineProps<{
    visible: boolean
    commandId?: string
  }>(),
  {
    visible: false,
  },
)

const emits = defineEmits(['success', 'cancel'])

const { t } = useI18n()

const modalTitle = computed(() =>
  props.commandId ? t('execution.operate.editCommond') : t('execution.operate.newCommand'),
)
const formRef = ref()
const isSubmiting = ref(false)

const form = reactive<Form>({
  command_name: '',
  timeout: '',
  content: '',
  lang: 'shell',
})

/**
 * Creates a new command by sending a POST request to the '/commands' endpoint with the provided parameters.
 *
 * @returns {Promise<void>} A promise that resolves when the request is finished.
 */
async function newCommand(): Promise<void> {
  try {
    await formRef.value!.validate()
    isSubmiting.value = true

    const [_] = await api.createNewCommand(form)
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

async function updateCommand() {
  if (!props.commandId) return
  try {
    await formRef.value!.validate()
    isSubmiting.value = true

    const [, res] = await api.updateCommand(props.commandId, form)
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

async function handleConfirm() {
  if (props.commandId) await updateCommand()
  else await newCommand()
}

function handleClose() {
  formRef.value.resetFields()
  emits('cancel')
}

function validateTimeout(_rule: Rule, value: any) {
  if (!value) {
    return Promise.resolve()
  }
  const val = Number(value)
  if (val < 1 || val > 86400 || isNaN(val)) {
    return Promise.reject(new Error(t('execution.command.validate.timeoutRange')))
  }
  return Promise.resolve()
}

const rules = computed(() => ({
  command_name: [
    { required: true, message: t('execution.command.validate.requireCommandName'), trigger: 'change' },
    {
      max: 128,
      trigger: 'change',
      message: t('execution.command.validate.commandNameOverSize'),
    },
  ],
  timeout: [
    {
      required: true,
      message: t('execution.command.validate.requireTimeout'),
      trigger: 'blur',
    },
    {
      validator: validateTimeout,
      trigger: 'blur',
    },
  ],
  content: [{ required: true, message: t('execution.command.validate.requireCommandContent'), trigger: 'change' }],
}))

/**
 * Get specific command with command id
 */
async function getSpecificCommand() {
  if (!props.commandId) return
  const [, res] = await api.querySpecificCommand(props.commandId)
  if (res) {
    form.content = res.content
    form.command_name = res.command_name
    form.timeout = res.timeout
  }
}

watch(
  () => props.visible,
  () => {
    if (!props.visible) return
    if (props.commandId) {
      getSpecificCommand()
    }
  },
)
</script>

<template>
  <div class="new-command">
    <a-modal
      :open="visible"
      :title="modalTitle"
      :confirm-loading="isSubmiting"
      destroy-on-close
      @ok="handleConfirm"
      @cancel="handleClose"
    >
      <a-form
        ref="formRef"
        style="margin-top: 20px"
        :rules="rules"
        :model="form"
        :label-col="{ span: 5 }"
        :wrapper-col="{ span: 16 }"
      >
        <a-form-item name="command_name" :label="t('execution.command.commandName')">
          <a-input
            v-model:value="form.command_name"
            type="text"
            :placeholder="t('execution.command.placeHolder.requireCommandName')"
            autocomplete="off"
          />
        </a-form-item>

        <a-form-item name="timeout" :label="t('common.timeout')">
          <a-input
            v-model:value="form.timeout"
            type="text"
            :placeholder="t('execution.command.placeHolder.timeoutRange')"
            autocomplete="off"
          />
        </a-form-item>

        <a-form-item name="content" :label="t('execution.command.commandContent')">
          <a-textarea
            v-model:value="form.content"
            type="text"
            :placeholder="t('execution.command.placeHolder.requireCommandContent')"
            autocomplete="off"
            :rows="4"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<style scoped></style>

