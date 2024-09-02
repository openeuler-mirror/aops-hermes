<script setup lang="ts">
import type { Rule } from 'ant-design-vue/es/form'
import { computed, reactive, ref, watch } from 'vue'
import { api } from '@/api'
import { useOperationsStore } from '@/store/operationsStore'
import { storeToRefs } from 'pinia'
import NewOperation from './NewOperation.vue'
import { UploadOutlined } from '@ant-design/icons-vue'
import { message, UploadProps } from 'ant-design-vue'
import { useI18n } from 'vue-i18n'

interface Form {
  script_name: string
  timeout: string
  command: string
  arch: string | undefined
  os_name: string | undefined
  operate_id: string | undefined
  fileList?: UploadProps['fileList']
}

const props = withDefaults(
  defineProps<{
    visible: boolean
    scriptId?: string
  }>(),
  {
    visible: false,
  },
)

const emits = defineEmits(['success', 'cancel'])
const { t } = useI18n()

const { operations } = storeToRefs(useOperationsStore())
const { queryOperations } = useOperationsStore()

const formRef = ref()
const isSubmiting = ref(false)

const form = reactive<Form>({
  operate_id: undefined,
  script_name: '',
  timeout: '',
  command: '',
  arch: undefined,
  os_name: undefined,
  fileList: [],
})

const osOptions = ref<{ label: string; value: string }[]>([])

const archOptions = ref<{ label: string; value: string }[]>([])

async function newScript() {
  try {
    await formRef.value!.validate()
    isSubmiting.value = true
    const [, scriptId] = await api.createNewScript({
      script_name: form.script_name,
      arch: form.arch,
      os_name: form.os_name,
      timeout: form.timeout,
      command: form.command,
      operate_id: form.operate_id,
    })
    if (scriptId) {
      const formData = new FormData()
      form.fileList?.forEach((file) => {
        formData.append('files', file as any)
      })
      const [_] = await api.uploadScriptFile(scriptId, formData)
      if (!_) {
        message.success(t('common.createSuccess'))
        formRef.value!.resetFields()
        isSubmiting.value = false
        emits('success')
      }
    }
  } catch (error) {
  } finally {
    isSubmiting.value = false
  }
}

const removeFile: UploadProps['onRemove'] = (file) => {
  if (!form.fileList) return
  const index = form.fileList.indexOf(file)
  const newFileList = form.fileList.slice()
  newFileList.splice(index, 1)
  form.fileList = newFileList
}

/**
 * examine file before upload
 * @param file
 */
const preUpload: UploadProps['beforeUpload'] = async (file) => {
  if (file.size > 1024 * 1024 * 1024 * 2) {
    message.error(`${t('execution.script.sentence.fileOversize', { fileName: file.name })}`)
    return false
  }
  form.fileList?.push(file)
  return false
}

async function updateScript() {
  if (!props.scriptId) return
  try {
    await formRef.value!.validate()
    isSubmiting.value = true
    const [, res] = await api.updateScript(props.scriptId, {
      script_name: form.script_name,
      arch: form.arch,
      os_name: form.os_name,
      timeout: form.timeout,
      command: form.command,
    })
    if (res) {
      message.success(t('common.editSuccess'))
      formRef.value!.resetFields()
      isSubmiting.value = false
      emits('success')
    }
  } catch (e) {
  } finally {
    isSubmiting.value = false
  }
}

async function handleConfirm() {
  if (props.scriptId) await updateScript()
  else await newScript()
}

function handleClose() {
  formRef.value.resetFields()
  emits('cancel')
}

/**
 * Validates the timeout value.
 *
 * @param {Rule} _rule - The rule object.
 * @param {any} value - The value to be validated.
 * @return {Promise<void>} A promise that resolves if the value is valid,
 * otherwise rejects with an error message.
 */
function validateTimeout(_rule: Rule, value: any): Promise<void> {
  if (!value) {
    return Promise.resolve()
  }
  if (Number(value) < 1 || Number(value) > 86400) {
    return Promise.reject(new Error(t('execution.command.validate.timeoutRange')))
  }
  return Promise.resolve()
}

const rules = computed(() => ({
  operate_id: [{ required: true, message: t('execution.script.validate.requireOperateName'), trigger: 'blur' }],
  script_name: [{ required: true, message: t('execution.script.validate.requireScriptName'), trigger: 'blur' }],
  timeout: [
    {
      required: true,
      message: t('execution.script.validate.requireTimeout'),
      trigger: 'blur',
    },
    {
      validator: validateTimeout,
      trigger: 'change',
    },
  ],
  arch: [{ required: true, message: t('execution.script.validate.requireArch'), trigger: 'blur' }],
  os_name: [{ required: true, message: t('execution.script.validate.requireOs'), trigger: 'blur' }],
  command: [{ required: true, message: t('execution.script.validate.requireCommand'), trigger: 'blur' }],
  fileList: [{ required: true, message: t('execution.script.validate.requireFiles'), trigger: 'blur' }],
}))

async function geySpecificScript(scriptId: string) {
  if (!props.scriptId) return
  const [, res] = await api.querySpecificScript(scriptId)
  if (res) {
    form.script_name = res.script_name
    form.operate_id = res.operate_id
    form.arch = res.arch
    form.os_name = res.os_name
    form.timeout = res.timeout
    form.command = res.command
  }
}

async function getSystemInfo() {
  const [, res] = await api.querySystemInfo()
  if (res) {
    osOptions.value = res.os_name.map((item) => ({ label: item, value: item }))
    archOptions.value = res.os_aarch.map((item) => ({
      label: item,
      value: item,
    }))
  }
}

const isNewOperateVisible = ref(false)

function handleCreateSuccess() {
  isNewOperateVisible.value = false
  queryOperations()
}

watch(
  () => props.visible,
  () => {
    if (!props.visible) return
    getSystemInfo()
    queryOperations()

    if (props.scriptId) {
      geySpecificScript(props.scriptId)
    }
  },
)
</script>

<template>
  <div class="new-command">
    <a-modal
      :open="visible"
      :title="scriptId ? t('execution.script.editScript') : t('execution.script.newScript')"
      width="600px"
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
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 18 }"
      >
        <a-form-item name="operate_id" :label="t('execution.script.operateName')" v-if="!props.scriptId">
          <div class="flex gap-2">
            <a-select v-model:value="form.operate_id" :placeholder="t('execution.script.placeHolder.requireOperate')">
              <template v-for="operate in operations" :key="operate.operate_id">
                <a-select-option :value="operate.operate_id">
                  {{ operate.operate_name }}
                </a-select-option>
              </template>
            </a-select>
            <a-button type="primary" @click="isNewOperateVisible = true">{{
              t('execution.script.newOperate')
            }}</a-button>
          </div>
        </a-form-item>

        <a-form-item name="script_name" :label="t('execution.script.scriptName')">
          <a-input
            v-model:value="form.script_name"
            type="text"
            :placeholder="t('execution.script.placeHolder.requireScriptName')"
            autocomplete="off"
          />
        </a-form-item>

        <a-form-item name="arch" :label="t('common.arch')">
          <a-select v-model:value="form.arch" :placeholder="t('execution.script.placeHolder.requireArch')">
            <template v-for="arch in archOptions" :key="arch.value">
              <a-select-option :value="arch.value">
                {{ arch.label }}
              </a-select-option>
            </template>
          </a-select>
        </a-form-item>

        <a-form-item name="os_name" :label="t('common.os')">
          <a-select v-model:value="form.os_name" :placeholder="t('execution.script.placeHolder.requireOs')">
            <template v-for="os in osOptions" :key="os.value">
              <a-select-option :value="os.value">
                {{ os.label }}
              </a-select-option>
            </template>
          </a-select>
        </a-form-item>

        <a-form-item name="timeout" :label="t('common.timeout')">
          <a-input
            v-model:value="form.timeout"
            type="text"
            :placeholder="t('execution.command.placeHolder.timeoutRange')"
            autocomplete="off"
          />
        </a-form-item>

        <a-form-item name="command" :label="t('execution.script.command')">
          <a-textarea
            v-model:value="form.command"
            type="text"
            :placeholder="t('execution.script.placeHolder.requireCommandContent')"
            autocomplete="off"
          />
        </a-form-item>

        <a-form-item name="fileList" :label="t('execution.script.uploadScript')" v-if="!props.scriptId">
          <a-upload :file-list="form.fileList" :before-upload="preUpload" @remove="removeFile" :multiple="true">
            <a-row type="flex" class="upload">
              <a-button>
                <UploadOutlined />
                {{ t('execution.script.uploadScript') }}
              </a-button>
            </a-row>
          </a-upload>
        </a-form-item>
      </a-form>
    </a-modal>
    <NewOperation
      v-model:visible="isNewOperateVisible"
      @cancel="isNewOperateVisible = false"
      @success="handleCreateSuccess"
    />
  </div>
</template>

<style lang="less" scoped>
:deep(.ant-upload-list) {
  max-height: 100px;
  overflow: auto;
}
</style>

