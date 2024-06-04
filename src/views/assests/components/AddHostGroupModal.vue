<script lang="ts" setup>
import { InfoCircleOutlined } from '@ant-design/icons-vue'
import type { Rule } from 'ant-design-vue/es/form'
import { reactive, ref } from 'vue'
import { message, notification } from 'ant-design-vue'
import { api } from '@/api'
import type { Cluster } from '@/api'

interface Form {
  hostName: string
  desc: string
  cluster_id: string | undefined
}

withDefaults(
  defineProps<{
    clusters?: Cluster[]
  }>(),
  {
    clusters: () => [],
  },
)

const emits = defineEmits<{
  (e: 'success'): void
}>()

const formRef = ref()
const visible = ref(false)
const isLoading = ref(false)

const form = reactive<Form>({
  hostName: '',
  desc: '',
  cluster_id: undefined,
})

/**
 * validate host group name
 * @param _rule
 * @param value
 */
function validateGroupName(_rule: Rule, value: string) {
  if (/[^0-9a-z_]/.test(value))
    return Promise.reject(new Error('名称应由数字、小写字母、英文下划线组成'))
  if (/^[^a-z]/.test(value))
    return Promise.reject(new Error('以小写字母开头，且结尾不能是英文下划线'))
  if (value.endsWith('_'))
    return Promise.reject(new Error('以小写字母开头，且结尾不能是英文下划线'))
  return Promise.resolve()
}

/**
 * validate host group description
 * @param _rule
 * @param value
 */
function validateDesc(_rule: Rule, value: string) {
  if (value.length > 60)
    return Promise.reject(new Error('长度不超过60个字符'))
  if (/[<>]/.test(value))
    return Promise.reject(new Error('不能有><符号'))
  return Promise.resolve()
}

/**
 * add a new host group
 */
async function addNewHostGroup() {
  isLoading.value = true
  try {
    await formRef.value.validate()

    const params: Record<
      string,
      { host_group_name: string, description: string, cluster_id: string }
    > = {}
    params[form.cluster_id!] = {
      description: form.desc,
      host_group_name: form.hostName,
      cluster_id: form.cluster_id!,
    }

    const [, res] = await api.addNewGroup(params)
    if (res) {
      if (Object.values(res)[0].label !== 'Succeed') {
        notification.error({
          message: '添加失败',
          description: Object.values(res)[0].label,
        })
      }
      else { message.success('添加成功') }
    }
    visible.value = false
    emits('success')
    formRef.value.resetFields()
  }
  catch (error) {
  }
  finally {
    isLoading.value = false
  }
}

/**
 * close modal
 */
function handleClose() {
  formRef.value.resetFields()
  visible.value = false
}
</script>

<template>
  <div class="add-host-group">
    <div @click="visible = true">
      <slot name="button" />
    </div>
    <a-modal
      v-model:open="visible"
      title="添加主机组"
      :confirm-loading="isLoading"
      destroy-on-close
      @ok="addNewHostGroup"
      @cancel="handleClose"
    >
      <a-form ref="formRef" :model="form" :label-col="{ span: 5 }">
        <a-form-item
          label="集群"
          name="cluster_id"
          :rules="[{ required: true, message: '请选择集群' }]"
        >
          <a-select v-model:value="form.cluster_id" placeholder="请选择集群">
            <template v-for="cluster in clusters" :key="cluster.cluster_id">
              <a-select-option :value="cluster.cluster_id">
                {{
                  cluster.cluster_name
                }}
              </a-select-option>
            </template>
          </a-select>
        </a-form-item>
        <a-form-item
          label="主机组名称"
          name="hostName"
          :rules="[
            { required: true, message: '请输入主机组名称' },
            {
              validator: validateGroupName,
              trigger: 'change',
            },
          ]"
        >
          <a-input
            v-model:value="form.hostName"
            :max-length="50"
            placeholder="请输入主机组名称，50个字符以内"
          >
            <template #suffix>
              <a-tooltip
                title="最大长度50个字符，由数字、小写字母、英文下划线_组成。以小写字母开头，且结尾不能是英文下划线_"
              >
                <InfoCircleOutlined style="color: rgba(0, 0, 0, 0.45)" />
              </a-tooltip>
            </template>
          </a-input>
        </a-form-item>
        <a-form-item
          label="主机组描述"
          name="desc"
          :rules="[
            { required: true, message: '请输入主机组描述' },
            {
              validator: validateDesc,
              trigger: 'change',
            },
          ]"
        >
          <a-textarea v-model:value="form.desc" placeholder="请输入描述，60个字符以内" :rows="4" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>
