<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { computed, reactive, ref } from 'vue'
import type { FormInstance, Rule } from 'ant-design-vue/es/form'
import { message } from 'ant-design-vue'
import { useClusterStore } from '@/store'
import { api } from '@/api'
import type { DistributionParams } from '@/api/paths/types'

interface Form {
  domainName: string
  clusterId: string | undefined
  priority: number
}

const emit = defineEmits(['success'])

const { permissions } = storeToRefs(useClusterStore())

const clusterOptions = computed(() => permissions.value.map(i => ({ cluster_id: i.cluster_id, cluster_name: i.cluster_name })))

const formRef = ref<FormInstance>()

const form = reactive<Form>({
  domainName: '',
  clusterId: undefined,
  priority: 0,
})

// form validate rules
const rules: Record<string, Rule[]> = {
  clusterId: [
    {
      required: true,
      message: '请选择集群',
      trigger: 'change',
    },
  ],
  domainName: [
    {
      required: true,
      message: '请输入业务域名称',
      trigger: 'change',
    },
    {
      validator: validateDomainName,
      trigger: 'blur',
    },
  ],
}

/**
 * validate domain name
 * @param _rule
 * @param value
 */
function validateDomainName(_rule: Rule, value: string) {
  if (value && value.length > 26)
    return Promise.reject(new Error('名称长度不应超过26个字符'))
  if (/[^\w\-.]/.test(value))
    return Promise.reject(new Error('名称只能输入大小写字母、下划线、中划线和小数点'))
  return Promise.resolve()
}

const isModalVisible = ref(false)
function showModal() {
  isModalVisible.value = true
}

function onClose() {
  form.clusterId = undefined
  form.domainName = ''
}

const confirmLoading = ref(false)
async function addDomain() {
  try {
    confirmLoading.value = true
    await formRef.value?.validate()
    const params: DistributionParams<{ domainName: string, priority?: number, clusterId?: string }> = {}
    params[form.clusterId!] = { domainName: form.domainName, priority: form.priority, clusterId: form.clusterId }
    const [,res] = await api.createDomain(params)
    if (res) {
      if (res[form.clusterId!].label === 'Succeed') {
        emit('success')
        message.success('添加成功')
        onClose()
        isModalVisible.value = false
      }
      else {
        message.error('添加失败')
      }
    }
  }
  catch {

  }
  finally {
    confirmLoading.value = false
  }
}
</script>

<template>
  <div class="add-domain">
    <div @click="showModal">
      <slot name="trigger" />
    </div>
    <a-modal
      v-model:open="isModalVisible"
      title="创建业务域"
      destroy-on-close
      :confirm-loading="confirmLoading"
      @ok="addDomain"
      @cancel="isModalVisible = false; onClose()"
    >
      <a-form ref="formRef" :model="form" :label-col="{ span: 5 }" :wrapper-col="{ span: 16 }" :rules="rules">
        <a-form-item name="clusterId" label="集群">
          <a-select v-model:value="form.clusterId" placeholder="请选择集群">
            <a-select-option
              v-for="cluster in clusterOptions"
              :key="cluster.cluster_id"
              :value="cluster.cluster_id"
            >
              {{ cluster.cluster_name }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item name="domainName" label="业务域名称">
          <a-input v-model:value="form.domainName" placeholder="请输入业务域名称，26个字符以内" />
        </a-form-item>
        <a-form-item label="优先级">
          <a-input :disabled="true" placeholder="未开放设置" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<style lang="less" scoped>

</style>
