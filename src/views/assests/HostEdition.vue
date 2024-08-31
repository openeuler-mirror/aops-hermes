<script lang="ts" setup>
import { InfoCircleOutlined, PlusOutlined, QuestionCircleOutlined } from '@ant-design/icons-vue'
import { useRoute, useRouter } from 'vue-router'
import type { Rule } from 'ant-design-vue/es/form'
import { computed, onMounted, reactive, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { message, notification } from 'ant-design-vue'
import { useI18n } from 'vue-i18n'
import AddHostGroupModal from './components/AddHostGroupModal.vue'
import PageWrapper from '@/components/PageWrapper.vue'
import type { HostGroup } from '@/api'
import { api } from '@/api'
import { useClusterStore } from '@/store'

interface Form {
  host_name: string
  host_ip: string
  cluster_id: string | undefined
  host_group_id: string | undefined
  management: boolean
  ssh_user: string
  ssh_port: number
  password?: string
  ssh_pkey?: string
  identificaWay: 1 | 2
}

type PageType = 'create' | 'edit'

const { t } = useI18n()

const { permissions, hostGroups } = storeToRefs(useClusterStore())
const { queryHostGroups } = useClusterStore()

const clusterOptions = computed(() =>
  permissions.value.map(({ cluster_id, cluster_name }) => ({ cluster_id, cluster_name })),
)

const route = useRoute()
const router = useRouter()

const hostId = computed<string>(() => (route.query.hostId as string) || '')
const pageType = computed<PageType>(() => (route.query.pageType as PageType) || 'create')

const formRef = ref()
const form = reactive<Form>({
  host_ip: '',
  host_name: '',
  cluster_id: undefined,
  host_group_id: undefined,
  ssh_port: 22,
  management: true,
  ssh_user: '',
  identificaWay: 1,
})
const defaultInfo = reactive<Form>({
  host_ip: '',
  host_name: '',
  cluster_id: undefined,
  host_group_id: undefined,
  ssh_port: 22,
  management: true,
  ssh_user: '',
  identificaWay: 1,
})
const isLoading = ref(false)

// #region ----------------------------------------< rules >----------------------------------------
/**
 * validate host username
 * @param _rule
 * @param value
 */
function validateHostUsername(_rule: Rule, value: string) {
  if (/[^\w\-~`!?.;(){}[\]@#$^*+|=]/.test(value)) {
    return Promise.reject(
      new Error(t('assests.validateMsg.username_one')),
    )
  }
  if (/^[#+-]/.test(value)) {
    return Promise.reject(
      new Error(t('assests.validateMsg.username_two')),
    )
  }

  return Promise.resolve()
}

/**
 * validate host name
 * @param _rule
 * @param value
 */
function validateHostName(_rule: Rule, value: string) {
  if (/^\S?$/.test(value))
    return Promise.reject(new Error(t('assests.validateMsg.hostName_one')))
  if (!/^(?!\s*$).+/.test(value))
    return Promise.reject(new Error(t('assests.validateMsg.hostName_two')))
  return Promise.resolve()
}

// form validate rules
const rules = computed<Record<string, Rule[]>>(() => ({
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
  identificaWay: [{ required: true, message: t('assests.validateMsg.identificaWay'), trigger: 'change' }],
  ssh_port: [{ required: true, message: t('assests.validateMsg.sshPort'), trigger: 'change' }],
  ssh_user: [
    { required: true, message: t('assests.validateMsg.username'), trigger: 'change' },
    { validator: validateHostUsername, trigger: 'blur' },
  ],
}))

const isPassRequired = computed<boolean>(() => {
  if (pageType.value === 'create')
    return true
  if (form.ssh_user !== defaultInfo.ssh_user || form.ssh_port !== defaultInfo.ssh_port)
    return true
  return false
})
// #endregion

/**
 * request the list of host groups after adding the host group successfully
 */
async function handleAddGroupSuccess() {
  await queryHostGroups()
}

/**
 * query host basic info as form default data
 */
async function queryHostInfoById(hostId: string) {
  const [_, res] = await api.getHostById(hostId)
  if (res) {
    const { host_name, host_ip, host_group_id, ssh_port, ssh_user, cluster_id, management } = res as any
    defaultInfo.host_name = host_name
    defaultInfo.cluster_id = cluster_id
    defaultInfo.host_group_id = host_group_id
    defaultInfo.management = management
    defaultInfo.host_ip = host_ip
    defaultInfo.ssh_user = ssh_user
    defaultInfo.ssh_port = ssh_port
    form.host_name = host_name
    form.cluster_id = cluster_id
    form.host_group_id = host_group_id
    form.management = management
    form.host_ip = host_ip
    form.ssh_user = ssh_user
    form.ssh_port = ssh_port
  }
}

/**
 * handle form submit event for create or update a new host
 * @param type
 */
async function handleSubmit(type: 'create' | 'edit'): Promise<void> {
  isLoading.value = true
  const verifyChanged = async (oldFrom: Form, newForm: Form) => {
    return Object.keys(newForm).some(key =>
      newForm[key] !== oldFrom[key],
    )
  }

  try {
    await formRef.value.validate()
    const diff = await verifyChanged(defaultInfo, form)

    if (!diff) {
      message.info(t('assests.sentence.noChange'))
      isLoading.value = false
      return
    }
    const params: Record<
      string,
      {
        host_name: string
        host_group_id: string
        host_ip: string
        ssh_port: number
        management: boolean
        ssh_user: string
        password?: string
        ssh_pkey?: string
      }
    > = {}
    const {
      cluster_id,
      host_name,
      host_ip,
      host_group_id,
      ssh_pkey,
      ssh_port,
      ssh_user,
      management,
      password,
    } = form
    params[cluster_id!] = {
      host_name,
      host_ip,
      host_group_id: host_group_id!,
      ssh_pkey,
      ssh_port,
      ssh_user,
      management,
      password,
    }
    if (type === 'create') {
      const [_, res] = await api.createNewHost(params)
      if (!_ && res) {
        if (Object.values(res)[0].label !== 'Succeed') {
          notification.error({
            message: t('common.fail'),
            description: Object.values(res)[0].label,
          })
        }

        else {
          setTimeout(() => {
            isLoading.value = false
            router.replace('/assests')
          }, 2000)
        }
      }
    }
    else if (type === 'edit') {
      const [_, res] = await api.updateHost(hostId.value, params)
      if (!_ && res) {
        if (Object.values(res)[0].label !== 'Succeed') {
          notification.error({
            message: t('common.fail'),
            description: Object.values(res)[0].label,
          })
        }

        else {
          setTimeout(() => {
            isLoading.value = false
            router.replace('/assests')
          }, 2000)
        }
      }
    }
  }
  catch {
    isLoading.value = false
  }
}

const hostGroupoOtions = computed<HostGroup[]>(() =>
  form.cluster_id ? hostGroups.value.filter(item => item.cluster_id === form.cluster_id) : [],
)

onMounted(() => {
  queryHostGroups()
  if (pageType.value === 'edit')
    queryHostInfoById(hostId.value)
})
</script>

<template>
  <PageWrapper>
    <div class="host-edition">
      <a-card>
        <a-form
          ref="formRef"
          :model="form"
          :rules="rules"
          :label-col="{ span: 5 }"
          :wrapper-col="{ span: 10 }"
        >
          <a-form-item :label="t('assests.hostName')" name="host_name">
            <a-input
              v-model:value="form.host_name"
              autocomplete="off"
              :max-length="50"
              :placeholder="t('assests.placeHolder.hostName')"
            >
              <template #suffix>
                <a-tooltip :title="t('assests.tips.hostName')">
                  <InfoCircleOutlined style="color: rgba(0, 0, 0, 0.45)" />
                </a-tooltip>
              </template>
            </a-input>
          </a-form-item>
          <a-form-item :label="t('assests.cluster')" name="cluster_id">
            <a-select v-model:value="form.cluster_id" :placeholder="t('assests.placeHolder.cluster')" :disabled="pageType === 'edit'" @change="form.host_group_id = undefined">
              <a-select-option
                v-for="cluster in clusterOptions"
                :key="cluster.cluster_id"
                :value="cluster.cluster_id"
              >
                {{ cluster.cluster_name }}
              </a-select-option>
            </a-select>
          </a-form-item>

          <a-form-item v-if="form.cluster_id" :label="t('assests.hostGroup')" name="host_group_id">
            <a-row type="flex" :gutter="16">
              <a-col flex="5">
                <a-select v-model:value="form.host_group_id" :placeholder="t('assests.placeHolder.hostGroup')">
                  <a-select-option
                    v-for="group in hostGroupoOtions"
                    :key="group.host_group_id"
                    :value="group.host_group_id"
                  >
                    {{ group.host_group_name }}
                  </a-select-option>
                </a-select>
              </a-col>
              <a-col>
                <AddHostGroupModal :clusters="clusterOptions" @success="handleAddGroupSuccess">
                  <template #button>
                    <a-button type="primary">
                      <PlusOutlined />{{ t('assests.addHostGroup') }}
                    </a-button>
                  </template>
                </AddHostGroupModal>
              </a-col>
            </a-row>
          </a-form-item>
          <a-form-item :label="t('assests.ip')" name="host_ip">
            <a-input
              v-model:value="form.host_ip"
              autocomplete="off"
              :disabled="pageType === 'edit'"
              :placeholder="t('assests.placeHolder.ip')"
            />
          </a-form-item>
          <a-form-item :label="t('assests.sshPort')" name="ssh_port">
            <a-input-number
              v-model:value="form.ssh_port"
              autocomplete="off"
              :min="0"
              :max="65535"
              :placeholder="t('assests.placeHolder.sshPort')"
              :controls="false"
              style="border-radius: 0"
            />
          </a-form-item>
          <a-form-item :label="t('assests.managementCheck')" name="management">
            <a-radio-group v-model:value="form.management" name="managementGroup">
              <a-radio :value="true">
                {{ t('assests.management') }}
              </a-radio>
              <a-radio :value="false">
                {{ t('assests.monitor') }}
              </a-radio>
            </a-radio-group>
          </a-form-item>
          <a-form-item :label="t('assests.username')" name="ssh_user">
            <a-input v-model:value="form.ssh_user" :max-length="32" :placeholder="t('assests.placeHolder.username')" autocomplete="off">
              <template #suffix>
                <a-tooltip :title="t('assests.tips.username')">
                  <InfoCircleOutlined style="color: rgba(0, 0, 0, 0.45)" />
                </a-tooltip>
              </template>
            </a-input>
          </a-form-item>
          <a-form-item :label="t('assests.certification')" name="identificaWay">
            <a-radio-group v-model:value="form.identificaWay" name="identificaWay">
              <a-radio :value="1">
                {{ t('assests.password') }}
              </a-radio>
              <a-radio :value="2">
                {{ t('assests.sshPkey') }}
              </a-radio>
            </a-radio-group>
          </a-form-item>
          <a-form-item
            :name="form.identificaWay === 1 ? `password` : `ssh_pkey`" :rules="isPassRequired ? [
              { required: true, message: `${form.identificaWay === 1 ? t('assests.validateMsg.password') : t('assests.validateMsg.ssh_pkey')}` },
            ] : []"
          >
            <template #label>
              <span v-if="form.identificaWay === 1">  {{ t('assests.password') }}</span>
              <span v-else>
                <span style="margin-right: 3px"> {{ t('assests.sshPkey') }}</span>
                <a-tooltip title="id_rsa"><QuestionCircleOutlined /> </a-tooltip>
              </span>
            </template>
            <a-input-password
              v-if="form.identificaWay === 1"
              v-model:value="form.password"
              autocomplete="off"
              :placeholder="pageType === 'create' ? t('assests.placeHolder.password') : t('assests.placeHolder.password_require')"
            />
            <a-textarea
              v-else
              v-model:value="form.ssh_pkey"
              :max-length="4096"
              :rows="3"
              :placeholder="pageType === 'create' ? t('assests.placeHolder.ssh_pkey') : t('assests.placeHolder.ssh_pkey_require')"
            />
          </a-form-item>
          <a-form-item :wrapper-col="{ span: 10, offset: 5 }">
            <a-row :gutter="16">
              <a-col>
                <a-button @click="$router.back()">
                  {{ t('common.cancel') }}
                </a-button>
              </a-col>
              <a-col>
                <a-button type="primary" :loading="isLoading" html-type="submit" @click="handleSubmit(pageType)">
                  {{
                    pageType === 'edit' ? t('common.modify') : t('common.add')
                  }}
                </a-button>
              </a-col>
            </a-row>
          </a-form-item>
        </a-form>
      </a-card>
    </div>
  </PageWrapper>
</template>
