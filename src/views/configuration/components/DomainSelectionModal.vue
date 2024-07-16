<script lang="ts" setup>
import { reactive, ref, watch } from 'vue'
import type { Domain } from '@/api'
import { api } from '@/api'

const props = withDefaults(
  defineProps<{
    visible: boolean
  }>(),
  {
    visible: false,
  },
)

const emits = defineEmits<{
  (e: 'cancel'): void
  (e: 'ok', domain: string): void
}>()

interface Form {
  domain: string
}

const formRef = ref()
const form = reactive<Form>({
  domain: '',
})

const domainNameList = ref<Domain[]>([])

async function queryDomains() {
  const [, res] = await api.getDomains()
  if (res)
    domainNameList.value = res
}

async function handleOk() {
  try {
    await formRef.value.validate()
    emits('ok', form.domain)
  }
  catch (err) {
  }
}
function handleCancel() {
  emits('cancel')
}

watch(
  () => props.visible,
  (cur, _pre) => {
    if (cur)
      queryDomains()
  },
)
</script>

<template>
  <a-modal :mask-closable="false" :open="visible" @ok="handleOk" @cancel="handleCancel">
    <a-form ref="formRef" :model="form" :label-col="{ span: 5 }" :wrapper-col="{ span: 16 }">
      <a-form-item
        name="domain"
        label="业务域"
        extra="若未选择业务域，则将返回管理页面"
        :rules="[{ required: true, message: '请选择业务域!' }]"
      >
        <a-select
          v-model:value="form.domain"
          placeholder="请选择需要进行配置管理的业务域..."
          style="width: 200px"
        >
          <a-select-option
            v-for="(item, index) in domainNameList"
            :key="index"
            :value="item.domainName"
          >
            {{ item.domainName }}
          </a-select-option>
        </a-select>
      </a-form-item>
    </a-form>
  </a-modal>
</template>
