<script lang="ts" setup>
import { InfoCircleOutlined } from '@ant-design/icons-vue'
import type { Rule } from 'ant-design-vue/es/form'
import { reactive, ref } from 'vue'
import { message, notification } from 'ant-design-vue'
import { useI18n } from 'vue-i18n'
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

const { t } = useI18n()

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
    return Promise.reject(new Error(t('assests.validateMsg.hostGroup_one')))
  if (/^[^a-z]/.test(value))
    return Promise.reject(new Error(t('assests.validateMsg.hostGroup_two')))
  if (value.endsWith('_'))
    return Promise.reject(new Error(t('assests.validateMsg.hostGroup_three')))
  return Promise.resolve()
}

/**
 * validate host group description
 * @param _rule
 * @param value
 */
function validateDesc(_rule: Rule, value: string) {
  if (value.length > 60)
    return Promise.reject(new Error(t('assests.validateMsg.descriptionOne')))
  if (/[<>]/.test(value))
    return Promise.reject(new Error(t('assests.validateMsg.descriptionTwo')))
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
          message: t('common.fail'),
          description: Object.values(res)[0].label,
        })
      }
      else {
        message.success(t('common.succeed'))
      }
      visible.value = false
      emits('success')
      formRef.value.resetFields()
    }
  }
  catch {
    isLoading.value = false
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
      :title="t('assests.addHostGroup')"
      :confirm-loading="isLoading"
      destroy-on-close
      @ok="addNewHostGroup"
      @cancel="handleClose"
    >
      <a-form ref="formRef" :model="form" :label-col="{ span: 6 }">
        <a-form-item
          :label="t('assests.cluster')"
          name="cluster_id"
          :rules="[{ required: true, message: t('assests.placeHolder.cluster') }]"
        >
          <a-select v-model:value="form.cluster_id" :placeholder="t('assests.placeHolder.cluster')">
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
          :label="t('assests.hostGroupName')"
          name="hostName"
          :rules="[
            { required: true, message: t('assests.validateMsg.hostGroup_input') },
            {
              validator: validateGroupName,
              trigger: 'change',
            },
          ]"
        >
          <a-input
            v-model:value="form.hostName"
            autocomplete="off"
            :max-length="50"
            :placeholder="t('assests.placeHolder.hostGroupInput')"
          >
            <template #suffix>
              <a-tooltip
                :title="$t('assests.tips.hostGroupName')"
              >
                <InfoCircleOutlined style="color: rgba(0, 0, 0, 0.45)" />
              </a-tooltip>
            </template>
          </a-input>
        </a-form-item>
        <a-form-item
          :label="t('assests.description')"
          name="desc"
          :rules="[
            { required: true, message: t('assests.validateMsg.description') },
            {
              validator: validateDesc,
              trigger: 'change',
            },
          ]"
        >
          <a-textarea v-model:value="form.desc" :placeholder="t('assests.placeHolder.desc')" :rows="4" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>
