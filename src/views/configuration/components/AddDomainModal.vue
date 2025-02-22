<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { computed, reactive, ref } from 'vue'
import type { FormInstance, Rule } from 'ant-design-vue/es/form'
import { message } from 'ant-design-vue'
import { useI18n } from 'vue-i18n'
import { useClusterStore } from '@/store'
import { api } from '@/api'
import type { DistributionParams } from '@/api/paths/types'

interface Form {
  domainName: string
  clusterId: string | undefined
  priority: number
  report_flag: boolean
  conf_change_flag: boolean
}

const emit = defineEmits(['success'])
const { t } = useI18n()
const { permissions } = storeToRefs(useClusterStore())

const clusterOptions = computed(() =>
  permissions.value.map(i => ({ cluster_id: i.cluster_id, cluster_name: i.cluster_name })),
)

const formRef = ref<FormInstance>()

const form = reactive<Form>({
  domainName: '',
  clusterId: undefined,
  priority: 0,
  // 是否文件追溯
  report_flag: true,
  // 是否文件监控
  conf_change_flag: true,
})

// form validate rules
const rules: Record<string, Rule[]> = {
  clusterId: [
    {
      required: true,
      message: t('conftrace.domain.validateMsg.cluster'),
      trigger: 'change',
    },
  ],
  domainName: [
    {
      required: true,
      message: t('conftrace.domain.validateMsg.domainName'),
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
  if (value && value.length > 26) return Promise.reject(new Error(t('conftrace.domain.validateMsg.domainNameOne')))
  if (/[^\w\-.]/.test(value)) return Promise.reject(new Error(t('conftrace.domain.validateMsg.domainNameTwo')))
  return Promise.resolve()
}

const isModalVisible = ref(false)
function showModal() {
  isModalVisible.value = true
}

function onClose() {
  form.clusterId = undefined
  form.domainName = ''
  form.conf_change_flag = true
  form.report_flag = true
}

const confirmLoading = ref(false)
async function addDomain() {
  try {
    confirmLoading.value = true
    await formRef.value?.validate()
    const params: DistributionParams<{
      domainName: string
      priority?: number
      clusterId?: string
      report_flag: boolean
      conf_change_flag: boolean
    }> = {}
    params[form.clusterId!] = {
      domainName: form.domainName,
      priority: form.priority,
      clusterId: form.clusterId,
      report_flag: form.report_flag,
      conf_change_flag: form.conf_change_flag,
    }
    const [, res] = await api.createDomain(params)
    if (res) {
      if (res[form.clusterId!].label === 'Succeed') {
        emit('success')
        message.success(t('common.succeed'))
        onClose()
        isModalVisible.value = false
      } else {
        message.error(t('common.fail'))
      }
    }
  } finally {
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
      :title="$t('conftrace.domain.addDomain')"
      destroy-on-close
      :confirm-loading="confirmLoading"
      @ok="addDomain"
      @cancel="(isModalVisible = false), onClose()"
    >
      <a-form ref="formRef" :model="form" :label-col="{ span: 5 }" :wrapper-col="{ span: 16 }" :rules="rules">
        <a-form-item name="clusterId" :label="$t('conftrace.domain.cluster')">
          <a-select v-model:value="form.clusterId" :placeholder="$t('conftrace.domain.validateMsg.cluster')">
            <a-select-option v-for="cluster in clusterOptions" :key="cluster.cluster_id" :value="cluster.cluster_id">
              {{ cluster.cluster_name }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item name="domainName" :label="$t('conftrace.domain.domainName')">
          <a-input v-model:value="form.domainName" :placeholder="$t('conftrace.domain.placeHolder.domainName')" />
        </a-form-item>
        <a-form-item :label="$t('conftrace.domain.priority')">
          <a-input :disabled="true" :placeholder="$t('conftrace.domain.placeHolder.priority')" />
        </a-form-item>
        <a-form-item :label="$t('conftrace.domain.isTrace')">
          <a-switch v-model:checked="form.conf_change_flag" />
        </a-form-item>
        <a-form-item :label="$t('conftrace.domain.isMonitor')">
          <a-switch v-model:checked="form.report_flag" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<style lang="less" scoped></style>
