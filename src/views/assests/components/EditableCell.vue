<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import { CheckOutlined, EditOutlined } from '@ant-design/icons-vue'
import type { FormInstance, Rule } from 'ant-design-vue/es/form'
import type { HostItem } from '@/api'

const props = defineProps<{
  formKey: string
  formData: HostItem
}>()

const emit = defineEmits<{
  (e: 'save', key: string, value: string)
  (e: 'edit', key: string)
}>()

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
  if (/[^\w\-~`!?.;(){}[\]@#$^*+|=]|[<>\\]/.test(value)) {
    return Promise.reject(
      new Error('用户名为数字、英文字母或特殊字符组成，不能包含空格和以下特殊字符：:<>&,\'"\\/%。'),
    )
  }
  if (/^[#+-]/.test(value))
    return Promise.reject(new Error('首字符不能是“#”、“+”或“-”'))
  return Promise.resolve()
}

/**
 * validate host password
 * @param _rule
 * @param value
 */
function validateHostPassword(_rule: Rule, value: string) {
  if (/[^\w~`!?.:;\-'"(){}[\]/<>@#$%^&*+|\\=]/.test(value))
    return Promise.reject(new Error('只允许大小写字母、数字和特殊字符，不能有空格和逗号'))
  if (value && (value.length < 8 || value.length > 20))
    return Promise.reject(new Error('长度应为8-20字符'))
  if (!/[_~`!?.:;\-'"(){}[\]/<>@#$%^&*+|\\=]/.test(value))
    return Promise.reject(new Error('请至少应包含一个特殊字符'))
  let count = 0
  if (/[a-z]/.test(value))
    count += 1
  if (/[A-Z]/.test(value))
    count += 1
  if (/\d/.test(value))
    count += 1
  if (count < 2)
    return Promise.reject(new Error('至少包含大写字母、小写字母、数字中的两种'))
  return Promise.resolve()
}

/**
 * validate host name
 * @param _rule
 * @param value
 */
function validateHostName(_rule: Rule, value: string) {
  if (!/^\S(.*\S)?$/.test(value))
    return Promise.reject(new Error('首尾不允许空格'))
  if (!/^(?!\s*$).+/.test(value))
    return Promise.reject(new Error('不允许全空格'))
  return Promise.resolve()
}

const formRules: Record<string, Rule[]> = {
  host_name: [
    { max: 50, message: '主机名长度应小于50', trigger: 'blur' },
    {
      validator: validateHostName,
      trigger: 'blur',
    },
  ],
  cluster_id: [
    {
      required: true,
      message: '请选择集群',
      trigger: 'change',
    },
  ],
  host_group_id: [
    {
      required: true,
      message: '请选择所属主机组',
      trigger: 'change',
    },
  ],
  host_ip: [
    {
      required: true,
      pattern: /^((2[0-4]\d|25[0-5]|[01]?\d\d?)\.){3}(2[0-4]\d|25[0-5]|[01]?\d\d?)$/,
      message: '请输入IP地址在 0.0.0.0~255.255.255.255 区间内',
      trigger: 'change',
    },
  ],
  management: [{ required: true, message: '请选择管理还是监控节点', trigger: 'change' }],
  ssh_port: [{ required: true, message: '请输入 0~65535 内正整数', trigger: 'change' }],
  ssh_user: [
    { required: true, message: '请输入用户名', trigger: 'change' },
    { validator: validateHostUsername, trigger: 'blur' },
  ],
  password: [{ validator: validateHostPassword, trigger: 'blur' }],
  ssh_pkey: [{ required: true, message: '请设置主机登录密钥', trigger: 'change' }],
}

async function save(key: string) {
  try {
    await formRef.value!.validate()
    isEditing.value = false
    const value = sourceData.value[key]
    emit('save', key, value)
  }
  catch (error) {
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
        {{ formData[formKey] }}
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
