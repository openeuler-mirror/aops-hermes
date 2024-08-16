<script setup lang='ts'>
import { computed, onMounted, ref } from 'vue'
import { CloseOutlined } from '@ant-design/icons-vue'
import { useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
import { useI18n } from 'vue-i18n'
import type { HostInDomain, HostsTableItem } from '@/api'
import { api } from '@/api'

interface Item {
  key: string
  title: string
  description?: string
  disabled?: boolean
}

const props = defineProps<{
  hostList: HostInDomain[]
  domainName: string
}>()

const emit = defineEmits(['success'])
const { t } = useI18n()
const route = useRoute()

const domainName = ref()
const clusterId = ref()

const allHosts = ref<HostsTableItem[]>([])

// 已经加入过的主机id列表
const selectedHostKeys = computed(() => props.hostList.map(item => item.hostId))
// 穿梭框右侧选中的主机id列表
const targetKeys = ref<string[]>(props.hostList.map(item => item.hostId))
// 全部主机列表
const sourceHosts = computed<Item[]>(() =>
  allHosts.value.map((item) => {
    if (selectedHostKeys.value.includes(item.host_id)) {
      targetKeys.value.push(item.host_id)
      return {
        key: item.host_id,
        title: item.host_name,
        disabled: true,
      }
    }
    else {
      return {
        key: item.host_id,
        title: item.host_name,
        disabled: false,
      }
    }
  }),
)

const isLoading = ref(false)
async function getAllHost() {
  isLoading.value = true
  const [, res] = await api.getNotExitedHostList({
    clusterId: clusterId.value,
  })
  if (res)
    allHosts.value = res
  isLoading.value = false
}

const selectedKeys = ref<string[]>([])

const visible = ref(false)
const isSubmiting = ref(false)

async function handleSubmit() {
  const selected = sourceHosts.value.filter(item => targetKeys.value.includes(item.key) && !item.disabled)
  if (selected.length === 0) {
    message.info(t('conftrace.domainDetail.message.leastOne'))
    return
  }
  isSubmiting.value = true
  const hostList = targetKeys.value.filter(item => !selectedHostKeys.value.includes(item))
  const params = {}

  params[clusterId.value] = {
    domainName: props.domainName,
    hostInfos: allHosts.value.filter(h => hostList.includes(h.host_id)).map(item => ({
      ipv6: 'ipv6',
      ip: item.host_ip,
      hostId: item.host_id,
    })),
  }

  const [, res] = await api.addHost(params)
  if (res && res[clusterId.value].label === 'Succeed') {
    message.success(t('common.succeed'))
    visible.value = false
    emit('success')
    getAllHost()
  }
  else { message.error(t('common.fail')) }

  isSubmiting.value = false
}

function afterOpenChange(open: boolean) {
  if (open)
    getAllHost()
}

onMounted(() => {
  domainName.value = (route.params.domainName as string) ?? ''
  clusterId.value = (route.params.clusterId as string) ?? ''
})
</script>

<template>
  <span @click="visible = true">
    <slot name="trigger" />
  </span>
  <a-drawer v-model:open="visible" :title="$t('conftrace.domainDetail.addHost')" :width="700" :closable="false" destroy-on-close @after-open-change="afterOpenChange">
    <template #extra>
      <CloseOutlined style="cursor: pointer" @click="visible = false" />
    </template>
    <a-spin :spinning="isLoading">
      <a-form :label-col="{ span: 5 }" :wrapper-col="{ span: 16 }">
        <a-form-item name="domainName" :label="$t('conftrace.domainDetail.beloneDomain')">
          <a-input :value="domainName" disabled type="text" :rules="[{ required: true, message: '请选择业务域' }]" />
        </a-form-item>
      </a-form>

      <h4 style="margin: 40px 0 20px 0;">
        {{ $t('conftrace.domainDetail.sentence.selectHost') }}
      </h4>
      <a-transfer
        v-model:target-keys="targetKeys"
        v-model:selected-keys="selectedKeys"
        :data-source="sourceHosts"
        :render="item => item.title"
        :show-select-all="false"
        show-search
        :list-style="{
          width: '350px',
          height: '300px',
        }"
      />
    </a-spin>

    <template #footer>
      <a-row type="flex" justify="end">
        <a-space>
          <a-button @click="visible = false">
            {{ $t('common.cancel') }}
          </a-button>
          <a-button type="primary" :loading="isSubmiting" @click="handleSubmit">
            {{ $t('common.confirm') }}
          </a-button>
        </a-space>
      </a-row>
    </template>
  </a-drawer>
</template>

<style scoped>
</style>
