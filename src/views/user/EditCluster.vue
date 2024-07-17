<script setup lang="ts">
import { QuestionCircleOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import type { FormInstance, Rule } from 'ant-design-vue/es/form'
import { useRoute, useRouter } from 'vue-router'
import { computed, onMounted, reactive, ref } from 'vue'
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
    return Promise.reject(new Error('首尾不允许空格'))
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
function validatePassword(_rule: Rule, value: string) {
  if (/[^\w~`!?.:;\-'"(){}[\]/<>@#$%^&*+|\\=]/.test(value))
    return Promise.reject(new Error('只允许大小写字母、数字和特殊字符，不能有空格和逗号'))
  if (value && (value.length < 1 || value.length > 255))
    return Promise.reject(new Error('长度应为1-255字符'))
  return Promise.resolve()
}

// form validate rules
const rules: Record<string, Rule[]> = {
  cluster_name: [
    { max: 20, message: '集群长度应小于20', trigger: 'change' },
    {
      required: true,
      message: '请输入集群名',
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
      message: '请输入IP地址在 0.0.0.0~255.255.255.255 区间内',
      trigger: 'change',
    },
  ],
  cluster_username: [{ max: 36, message: '用户名长度应小于20', trigger: 'change' }, {
    required: true,
    message: '请输入用户名',
    trigger: 'change',
  }, { validator: validateUsername, trigger: 'blur' }],
  cluster_password: [{
    required: true,
    message: '请输入密码',
    trigger: 'change',
  }, { validator: validatePassword, trigger: 'blur' }],
  description: [{ max: 60, message: '描述长度应小于60', trigger: 'change' }, { required: true, message: '请输入集群描述', trigger: 'change' }],
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
  catch (error) {
  }
  finally {
    isLoading.value = false
  }
}

async function handleregisterCluster() {
  isLoading.value = true
  const _ = await registerCluster(form as Required<Form>)
  if (_) {
    message.success('添加成功')
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
    message.success('修改成功')
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
          <a-form-item name="cluster_name" label="集群名">
            <a-input v-model:value="form.cluster_name" placeholder="请输入集群名称" />
          </a-form-item>

          <a-form-item name="cluster_ip" label="集群IP">
            <a-input v-model:value="form.cluster_ip" placeholder="请输入集群IP" />
          </a-form-item>

          <a-form-item name="description" label="描述">
            <a-input v-model:value="form.description" placeholder="请输入集群描述" />
          </a-form-item>

          <a-form-item v-if="pageType === 'create'" name="cluster_username">
            <template #label>
              <a-space>
                <span>用户名</span>
                <a-tooltip title="子集群管理员用户名">
                  <QuestionCircleOutlined />
                </a-tooltip>
              </a-space>
            </template>
            <a-input
              v-model:value="form.cluster_username"
              placeholder="请输入子集群用户名"
            />
          </a-form-item>

          <a-form-item v-if="pageType === 'create'" name="cluster_password">
            <template #label>
              <a-space>
                <span>登录密码</span>
                <a-tooltip title="子集群管理员登录密码">
                  <QuestionCircleOutlined />
                </a-tooltip>
              </a-space>
            </template>
            <a-input-password
              v-model:value="form.cluster_password"
              placeholder="请输入子集群管理员密码"
            />
          </a-form-item>

          <a-form-item :wrapper-col="{ span: 10, offset: 6 }">
            <a-row :gutter="16">
              <a-col>
                <a-button @click="$router.back()">
                  取消
                </a-button>
              </a-col>
              <a-col>
                <a-button type="primary" :loading="isLoading" html-type="submit" @click="handleSubmit(pageType)">
                  {{
                    pageType === 'create' ? '添加' : '修改'
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
