<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import { CheckOutlined, EditOutlined } from '@ant-design/icons-vue'
import type { FormInstance, Rule } from 'ant-design-vue/es/form'
import { useI18n } from 'vue-i18n'
import type { HostItem } from '@/api'

const props = defineProps<{
  formKey: string
  formData: HostItem
}>()

const emit = defineEmits<{
  (e: 'save', key: string, value: string)
  (e: 'edit', key: string)
}>()

const { t } = useI18n()

const sourceData = ref(props.formData)

const isEditing = ref(false)

const inputRef = ref<HTMLInputElement | null>(null)
const formRef = ref<FormInstance>()

/**
 * validate host username
 * @param _rule
 * @param value
 */
function validateHostUsername(_rule: Rule, value: string) {
  if (/[^\w\-~`!?.;(){}[\]@#$^*+|=<>\\]/.test(value)) {
    return Promise.reject(
      new Error(t('assests.validateMsg.username_three')),
    )
  }
  if (/^[#+-]/.test(value))
    return Promise.reject(new Error(t('assests.validateMsg.username_two')))
  return Promise.resolve()
}

/**
 * validate host name
 * @param _rule
 * @param value
 */
function validateHostName(_rule: Rule, value: string) {
  if (!/^\S(?:.*\S)?$/.test(value))
    return Promise.reject(new Error(t('assests.validateMsg.hostName_one')))
  if (!/^(?!\s*$).+/.test(value))
    return Promise.reject(new Error(t('assests.validateMsg.hostName_two')))
  return Promise.resolve()
}

const formRules: Record<string, Rule[]> = {
  host_name: [
    { max: 50, message: t('assests.validateMsg.hostName'), trigger: 'blur' },
    {
      validator: validateHostName,
      trigger: 'blur',
    },
  ],
  cluster_id: [
    {
      required: true,
      message: t('assests.validateMsg.cluster'),
      trigger: 'change',
    },
  ],
  host_group_id: [
    {
      required: true,
      message: t('assests.validateMsg.hostGroup'),
      trigger: 'change',
    },
  ],
  host_ip: [
    {
      required: true,
      pattern: /^((2[0-4]\d|25[0-5]|[01]?\d\d?)\.){3}(2[0-4]\d|25[0-5]|[01]?\d\d?)$/,
      message: t('assests.validateMsg.ip'),
      trigger: 'change',
    },
  ],
  management: [{ required: true, message: t('assests.validateMsg.management'), trigger: 'change' }],
  ssh_port: [{ required: true, message: t('assests.validateMsg.sshPort'), trigger: 'change' }],
  ssh_user: [
    { required: true, message: t('assests.validateMsg.username'), trigger: 'change' },
    { validator: validateHostUsername, trigger: 'blur' },
  ],
}

async function save(key: string) {
  try {
    await formRef.value!.validate()
    isEditing.value = false
    const value = sourceData.value[key]
    emit('save', key, value)
  }
  catch {
  }
}

function edit(key: string) {
  isEditing.value = true
  emit('edit', key)
}

watch(isEditing, (newVal) => {
  if (newVal) {
    nextTick(() => {
      inputRef.value!.focus()
    })
  }
})
</script>

<template>
  <div class="editable-cell">
    <div v-if="isEditing" class="editable-cell-input-wrapper">
      <a-form ref="formRef" :model="sourceData" :rules="formRules">
        <a-form-item :name="formKey" class="form-item">
          <a-input-password
            v-if="formKey === 'password' || formKey === 'ssh_pkey'"
            ref="inputRef"
            v-model:value="sourceData[formKey]"
            style="width: 85px"
            @press-enter="save(formKey)"
            @blur="save(formKey)"
          />

          <a-input
            v-else
            ref="inputRef"
            v-model:value="sourceData[formKey]"
            style="width: 85px"
            @press-enter="save(formKey)"
            @blur="save(formKey)"
          />
        </a-form-item>
      </a-form>

      <CheckOutlined class="editable-cell-icon-check" @click="save(formKey)" />
    </div>

    <div v-else class="editable-cell-text-wrapper">
      <span v-if="formKey === 'management'">
        <a-switch v-model:checked="sourceData[formKey]" @change="save(formKey)" />
      </span>
      <span v-else>
        <span v-if="formKey === 'password' || formKey === 'ssh_pkey'">********
        </span>
        <span v-else>
          {{ formData[formKey] }}
        </span>
        <EditOutlined class="editable-cell-icon" @click="edit(formKey)" />
      </span>
    </div>
  </div>
</template>

<style lang="less" scoped>
.form-item {
  margin: 0;
}
.editable-cell {
  position: relative;
  .editable-cell-input-wrapper,
  .editable-cell-text-wrapper {
    padding-right: 15px;
  }

  .editable-cell-text-wrapper {
    padding: 5px 24px 5px 5px;
    height: 35px;
  }

  .editable-cell-icon,
  .editable-cell-icon-check {
    position: absolute;
    top: 8px;
    right: 0;
    width: 20px;
    cursor: pointer;
  }

  .editable-cell-icon {
    margin-top: 4px;
    display: none;
  }

  .editable-cell-icon-check {
    line-height: 28px;
  }

  .editable-cell-icon:hover,
  .editable-cell-icon-check:hover {
    color: #108ee9;
  }

  .editable-add-btn {
    margin-bottom: 8px;
  }
}
.editable-cell:hover .editable-cell-icon {
  display: inline-block;
}
</style>
