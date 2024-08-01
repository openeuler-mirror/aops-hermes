<script setup lang="ts">
import { QuestionCircleOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import type { FormInstance, Rule } from 'ant-design-vue/es/form'
import { useRoute, useRouter } from 'vue-router'
import { computed, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import PageWrapper from '@/components/PageWrapper.vue'
import { api } from '@/api'
import { useClusterStore } from '@/store'

type PageType = 'create' | 'edit'
interface Form {
  cluster_name: string
  cluster_ip: string
  cluster_username?: string
  cluster_password?: string
  description: string
}

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const { registerCluster, updateCluster, queryPermission } = useClusterStore()

const clusterId = ref<string>('')
const formRef = ref<FormInstance>()
const pageType = computed<PageType>(() => (clusterId.value ? 'edit' : 'create'))
const isLoading = ref(false)
const isSpinning = ref(false)

const form = reactive<Form>({
  cluster_name: '',
  cluster_ip: '',
  cluster_username: '',
  cluster_password: '',
  description: '',
})

/**
 * validate host name
 * @param _rule
 * @param value
 */
function validateClustserName(_rule: Rule, value: string) {
  if (/^\s+|\s+$/.test(value))
    return Promise.reject(new Error(t('users.validateMsg.clusterName')))
  return Promise.resolve()
}

/**
 * validate host username
 * @param _rule
 * @param value
 */
function validateUsername(_rule: Rule, value: string) {
  if (/[^\w\-~`!?.;(){}[\]@#$^*+|=]/.test(value)) {
    return Promise.reject(
      new Error(t('users.validateMsg.usernameOne')),
    )
  }
  if (/^[#+-]/.test(value))
    return Promise.reject(new Error(t('users.validateMsg.usernameTwo')))
  return Promise.resolve()
}

/**
 * validate host password
 * @param _rule
 * @param value
 */
function validatePassword(_rule: Rule, value: string) {
  if (/[^\w~`!?.:;\-'"(){}[\]/<>@#$%^&*+|\\=]/.test(value))
    return Promise.reject(new Error(t('users.validateMsg.passwordOne')))
  if (value && (value.length < 1 || value.length > 255))
    return Promise.reject(new Error(t('users.validateMsg.passwordTwo')))
  return Promise.resolve()
}

// form validate rules
const rules: Record<string, Rule[]> = {
  cluster_name: [
    { max: 20, message: t('users.validateMsg.clusterNameOne'), trigger: 'change' },
    {
      required: true,
      message: t('users.validateMsg.clusterNameTwo'),
      trigger: 'change',
    },
    {
      validator: validateClustserName,
      trigger: 'change',
    },
  ],
  cluster_ip: [
    {
      required: true,
      pattern: /^((2[0-4]\d|25[0-5]|[01]?\d\d?)\.){3}(2[0-4]\d|25[0-5]|[01]?\d\d?)$/,
      message: t('users.validateMsg.clusterIp'),
      trigger: 'change',
    },
  ],
  cluster_username: [{ max: 36, message: t('users.validateMsg.usernameThree'), trigger: 'change' }, {
    required: true,
    message: t('assests.validateMsg.username'),
    trigger: 'change',
  }, { validator: validateUsername, trigger: 'blur' }],
  cluster_password: [{
    required: true,
    message: t('users.validateMsg.passwordThree'),
    trigger: 'change',
  }, { validator: validatePassword, trigger: 'blur' }],
  description: [{ max: 60, message: t('users.validateMsg.clusterDesc'), trigger: 'change' }, { required: true, message: t('users.validateMsg.clusterDescTwo'), trigger: 'change' }],
}

async function handleSubmit(type: 'create' | 'edit'): Promise<void> {
  isLoading.value = true
  try {
    await formRef.value!.validate()
    if (type === 'create')
      await handleregisterCluster()
    else if (type === 'edit')
      await handleupdateCluster()
  }
  catch {
  }
  finally {
    isLoading.value = false
  }
}

async function handleregisterCluster() {
  isLoading.value = true
  const _ = await registerCluster(form as Required<Form>)
  if (_) {
    message.success(t('common.succeed'))
    queryPermission()
    router.push('/user/cluster/cluster-management')
  }
}

async function handleupdateCluster() {
  isLoading.value = true
  const { cluster_ip, cluster_name, description } = form
  const _ = await updateCluster({
    cluster_id: clusterId.value,
    cluster_ip,
    cluster_name,
    description,
  })
  if (_) {
    message.success(t('common.succeed'))
    queryPermission()
    router.push('/user/cluster/cluster-management')
  }
}

async function queryClusterById(cluserId: string) {
  isSpinning.value = true
  const [_, res] = await api.getClustersWithId([cluserId])
  if (res) {
    const { cluster_name, cluster_ip, description } = res[0]
    form.cluster_ip = cluster_ip
    form.cluster_name = cluster_name
    form.description = description
  }
  isSpinning.value = false
}

onMounted(() => {
  clusterId.value = (route.params.clusterId as string) || ''
  if (clusterId.value)
    queryClusterById(clusterId.value)
})
</script>

<template>
  <PageWrapper>
    <a-card>
      <a-spin :spinning="isSpinning">
        <a-form
          ref="formRef"
          :model="form"
          :rules="rules"
          :label-col="{ span: 6 }"
          :wrapper-col="{ span: 10 }"
        >
          <a-form-item name="cluster_name" :label="$t('users.clusterName')">
            <a-input v-model:value="form.cluster_name" :placeholder="$t('users.placeHolder.clsuterName')" />
          </a-form-item>

          <a-form-item name="cluster_ip" :label="$t('users.clusterIp')">
            <a-input v-model:value="form.cluster_ip" :placeholder="$t('users.placeHolder.clsuterIp')" />
          </a-form-item>

          <a-form-item name="description" :label="$t('users.clusterDes')">
            <a-input v-model:value="form.description" :placeholder="$t('users.placeHolder.clusterDesc')" />
          </a-form-item>

          <a-form-item v-if="pageType === 'create'" name="cluster_username">
            <template #label>
              <a-space>
                <span>{{ t('users.username') }}</span>
                <a-tooltip :title="$t('users.tips.username')">
                  <QuestionCircleOutlined />
                </a-tooltip>
              </a-space>
            </template>
            <a-input
              v-model:value="form.cluster_username"
              :placeholder="$t('users.placeHolder.username')"
            />
          </a-form-item>

          <a-form-item v-if="pageType === 'create'" name="cluster_password">
            <template #label>
              <a-space>
                <span>{{ $t('users.clusters.password') }}</span>
                <a-tooltip :title="$t('users.tips.password')">
                  <QuestionCircleOutlined />
                </a-tooltip>
              </a-space>
            </template>
            <a-input-password
              v-model:value="form.cluster_password"
              :placeholder="$t('users.placeHolder.password')"
            />
          </a-form-item>

          <a-form-item :wrapper-col="{ span: 10, offset: 6 }">
            <a-row :gutter="16">
              <a-col>
                <a-button @click="$router.back()">
                  {{ t('common.cancel') }}
                </a-button>
              </a-col>
              <a-col>
                <a-button type="primary" :loading="isLoading" html-type="submit" @click="handleSubmit(pageType)">
                  {{
                    pageType === 'create' ? t('common.add') : t('common.modify')
                  }}
                </a-button>
              </a-col>
            </a-row>
          </a-form-item>
        </a-form>
      </a-spin>
    </a-card>
  </PageWrapper>
</template>

<style scoped></style>
