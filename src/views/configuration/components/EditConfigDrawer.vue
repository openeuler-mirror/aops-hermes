<script lang="ts" setup>
import { QuestionCircleOutlined } from '@ant-design/icons-vue'
import type { FormInstance } from 'ant-design-vue'
import { message } from 'ant-design-vue'
import { onMounted, reactive, ref } from 'vue'
import { api } from '@/api'
import type { HostInDomain } from '@/api'

const props = withDefaults(
  defineProps<{
    type?: 'edit' | 'add'
    domainName: string
    filePath?: string
  }>(),
  {
    type: 'add',
  },
)

enum TypeEnum {
  edit = '编辑配置',
  add = '新增配置',
}

interface confForm {
  domainName: string
  filePath: string
  importWay: string
  configContent?: string
  configHostId?: number
}

const visible = ref(false)

function open() {
  visible.value = true
}

const sourceOption = [
  {
    value: '手动输入',
    title: '手动输入',
  },
  {
    value: '从主机导入',
    title: '从主机导入',
  },
  {
    value: '从本地导入',
    title: '从本地导入',
  },
]

const isSubmiting = ref(false)

const formRef = ref<FormInstance>()
const form = reactive<{ confs: confForm[] }>({
  confs: [
    {
      domainName: props.domainName,
      filePath: props.filePath || '',
      importWay: sourceOption[0].value,
      configContent: '',
    },
  ],
})

const hostList = ref<HostInDomain[]>([])

async function queryHostsInDomain() {
  const [, res] = await api.getHostsInDomain(props.domainName)
  if (res)
    hostList.value = res
}

async function handleSubmit() {
  isSubmiting.value = true
  try {
    await formRef.value!.validate()
    const [, res] = await api.addDomainConfig(
      props.domainName,
      form.confs.map(({ filePath, configHostId, configContent }) => ({
        filePath,
        contents: configContent,
        hostId: configHostId,
      })),
    )
    if (res)
      message.success(res as string)
    visible.value = false
  }
  catch {
  }
  finally {
    isSubmiting.value = false
  }
}

onMounted(() => {
  queryHostsInDomain()
})
</script>

<template>
  <span @click="open">
    <slot name="trigger" />
  </span>
  <a-drawer
    v-model:open="visible"
    :title="TypeEnum[type]"
    :width="700"
    :closable="false"
    destroy-on-close
  >
    <template #extra>
      <CloseOutlined style="cursor: pointer" @click="visible = false" />
    </template>
    <a-form ref="formRef" :model="form" :label-col="{ span: 5 }" :wrapper-col="{ span: 18 }">
      <div v-for="(conf, index) in form.confs" :key="index">
        <a-form-item :name="['confs', index, 'domainName']" label="所属业务域">
          <a-input v-model:value="conf.domainName" disabled :default-value="domainName" />
        </a-form-item>
        <a-form-item
          label="配置路径"
          :rules="[{ required: true, message: '请输入配置路径', trigger: 'change' }]"
        >
          <a-input v-model:value="conf.filePath" disabled :default-value="filePath" />
        </a-form-item>
        <a-form-item
          :name="['confs', index, 'importWay']"
          :rules="[{ required: true, message: '请选择来源', trigger: 'change' }]"
        >
          <template #label>
            <a-tooltip title="配置来源三选一，推荐使用手动输入">
              <QuestionCircleOutlined />
            </a-tooltip>
            &nbsp;配置来源
          </template>
          <a-select v-model:value="conf.importWay" :options="sourceOption" />
        </a-form-item>
        <a-form-item
          v-if="conf.importWay === '手动输入'"
          :name="['confs', index, 'configContent']"
          label="配置内容"
          :rules="[{ required: true, message: '请输入配置路径', trigger: 'change' }]"
        >
          <a-textarea v-model:value="conf.configContent" :rows="8" placeholder="请输入配置内容" />
        </a-form-item>
        <a-form-item
          v-if="conf.importWay === '从主机导入'"
          :name="['confs', index, 'configHost']"
          label="选择主机"
          :rules="[{ required: true, message: '请选择主机', trigger: 'change' }]"
        >
          <a-select v-model:value="conf.configHostId">
            <a-select-option v-for="item in hostList" :key="item.hostId" :value="item.hostId">
              {{
                item.ip
              }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <!-- <a-form-item label="选择文件" v-if="conf.importWay === '从本地导入'">
        <a-upload :name="['confs', 'index', 'confs']">
          <a-button>
            <upload-outlined></upload-outlined>
            选择文件
          </a-button>
          <div class="upload-tip">
            <p>文件大小不超过1MB</p>
          </div>
        </a-upload>
      </a-form-item> -->
      </div>
    </a-form>
    <div class="operate-button">
      <a-space>
        <a-button>取消</a-button>
        <a-button type="primary" html-type="submit" @click="handleSubmit">
          确定
        </a-button>
      </a-space>
    </div>
  </a-drawer>
</template>

<style lang="less" scoped>
.operate-button {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 100%;
  border-top: 1px solid #e9e9e9;
  padding: 10px 16px;
  background: #fff;
  text-align: right;
  z-index: 1;
}
</style>
