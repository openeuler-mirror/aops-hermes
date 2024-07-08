<script lang="ts" setup>
import { InfoCircleOutlined, PlusOutlined, QuestionCircleOutlined } from '@ant-design/icons-vue'
import { useRoute, useRouter } from 'vue-router'
import type { Rule } from 'ant-design-vue/es/form'
import { computed, onMounted, reactive, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { message, notification } from 'ant-design-vue'
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
      new Error('用户名为数字、英文字母或特殊字符组成，不能包含空格和以下特殊字符：:<>&,\'"\\/%。'),
    )
  }
  if (/^[#+-]/.test(value))
    return Promise.reject(new Error('首字符不能是“#”、“+”或“-”'))
  return Promise.resolve()
}

/**
 * validate host name
 * @param _rule
 * @param value
 */
function validateHostName(_rule: Rule, value: string) {
  if (/^\S?$/.test(value))
    return Promise.reject(new Error('首尾不允许空格'))
  if (!/^(?!\s*$).+/.test(value))
    return Promise.reject(new Error('不允许全空格'))
  return Promise.resolve()
}

// form validate rules
const rules: Record<string, Rule[]> = {
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
  identificaWay: [{ required: true, message: '请选择认证方式', trigger: 'change' }],
  ssh_port: [{ required: true, message: '请输入 0~65535 内正整数', trigger: 'change' }],
  ssh_user: [
    { required: true, message: '请输入用户名', trigger: 'change' },
    { validator: validateHostUsername, trigger: 'blur' },
  ],
}

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
      message.info('当前没有修改，请修改后重试')
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
            message: '添加失败',
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
            message: '编辑失败',
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
  catch (error) {
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
          <a-form-item label="主机名称" name="host_name">
            <a-input
              v-model:value="form.host_name"
              :max-length="50"
              placeholder="请输入主机名称，50个字符以内"
            >
              <template #suffix>
                <a-tooltip title="最大长度50个字符，首尾不能为空格，不允许全空格">
                  <InfoCircleOutlined style="color: rgba(0, 0, 0, 0.45)" />
                </a-tooltip>
              </template>
            </a-input>
          </a-form-item>

          <a-form-item label="集群" name="cluster_id">
            <a-select v-model:value="form.cluster_id" placeholder="请选择集群" :disabled="pageType === 'edit'">
              <a-select-option
                v-for="cluster in clusterOptions"
                :key="cluster.cluster_id"
                :value="cluster.cluster_id"
              >
                {{ cluster.cluster_name }}
              </a-select-option>
            </a-select>
          </a-form-item>

          <a-form-item v-if="form.cluster_id" label="所属主机组" name="host_group_id">
            <a-row type="flex" :gutter="16">
              <a-col flex="5">
                <a-select v-model:value="form.host_group_id" placeholder="请选择">
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
                      <PlusOutlined />添加主机组
                    </a-button>
                  </template>
                </AddHostGroupModal>
              </a-col>
            </a-row>
          </a-form-item>
          <a-form-item label="IP地址" name="host_ip">
            <a-input
              v-model:value="form.host_ip"
              :disabled="pageType === 'edit'"
              placeholder="请输入有效ip地址，e.g. 192.168.0.1"
            />
          </a-form-item>
          <a-form-item label="SSH登录端口" name="ssh_port">
            <a-input-number
              v-model:value="form.ssh_port"
              :min="0"
              :max="65535"
              placeholder="请输入"
              :controls="false"
              style="border-radius: 0"
            />
          </a-form-item>
          <a-form-item label="管理/监控节点" name="management">
            <a-radio-group v-model:value="form.management" name="managementGroup">
              <a-radio :value="true">
                管理节点
              </a-radio>
              <a-radio :value="false">
                监控节点
              </a-radio>
            </a-radio-group>
          </a-form-item>
          <a-form-item label="主机用户名" name="ssh_user">
            <a-input v-model:value="form.ssh_user" :max-length="32" placeholder="请输入主机用户名">
              <template #suffix>
                <a-tooltip title="登录主机时使用的用户名">
                  <InfoCircleOutlined style="color: rgba(0, 0, 0, 0.45)" />
                </a-tooltip>
              </template>
            </a-input>
          </a-form-item>
          <a-form-item label="认证方式" name="identificaWay">
            <a-radio-group v-model:value="form.identificaWay" name="identificaWay">
              <a-radio :value="1">
                主机登录密码
              </a-radio>
              <a-radio :value="2">
                主机登录密钥
              </a-radio>
            </a-radio-group>
          </a-form-item>
          <a-form-item
            :name="form.identificaWay === 1 ? `password` : `ssh_pkey`" :rules="isPassRequired ? [
              { required: true, message: `请输入登录${form.identificaWay === 1 ? '密码' : '密钥'}` },
            ] : []"
          >
            <template #label>
              <span v-if="form.identificaWay === 1">主机登录密码</span>
              <span v-else>
                <span style="margin-right: 3px">主机登录密钥</span>
                <a-tooltip title="id_rsa"><QuestionCircleOutlined /> </a-tooltip>
              </span>
            </template>
            <a-input-password
              v-if="form.identificaWay === 1"
              v-model:value="form.password"
              :placeholder="pageType === 'create' ? '请设置主机登录密码' : '请输入主机登录密码, 若未修改主机用户名或端口可以为空'"
            />
            <a-textarea
              v-else
              v-model:value="form.ssh_pkey"
              :max-length="4096"
              :rows="3"
              :placeholder="pageType === 'create' ? '请设置主机登录密钥' : '请输入主机登录密钥, 若未修改主机用户名或端口可以为空'"
            />
          </a-form-item>
          <a-form-item :wrapper-col="{ span: 10, offset: 5 }">
            <a-row :gutter="16">
              <a-col>
                <a-button @click="$router.back()">
                  取消
                </a-button>
              </a-col>
              <a-col>
                <a-button type="primary" :loading="isLoading" html-type="submit" @click="handleSubmit(pageType)">
                  {{
                    pageType === 'edit' ? '修改' : '添加'
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
