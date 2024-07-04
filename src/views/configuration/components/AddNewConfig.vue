<script setup lang='ts'>
import { type FormInstance, type UploadProps, message } from 'ant-design-vue'

import { onMounted, reactive, ref } from 'vue'
import { MinusCircleOutlined, PlusOutlined, QuestionCircleOutlined, UploadOutlined } from '@ant-design/icons-vue'
import type { HostInDomain } from '@/api'
import { api } from '@/api'

const props = withDefaults(
  defineProps<{
    type?: 'edit' | 'add'
    domainName: string
    clusterId: string
    filePath?: string
    hostList: HostInDomain[]
  }>(),
  {
    type: 'add',
  },
)

const emit = defineEmits(['cancel', 'success'])

interface confForm {
  domainName: string
  filePath?: string
  importWay: string
  configContent?: string
  configHostId?: number
}

const sourceOption = [
  {
    value: 'manuel',
    label: '手动输入',
  },
  {
    value: 'auto',
    label: '从主机导入',
  },
  {
    value: 'file',
    label: '从本地导入',
  },
]

const formRef = ref<FormInstance>()
const form = reactive<{ confs: confForm[] }>({
  confs: [
    {
      domainName: props.domainName,
      filePath: props.filePath || undefined,
      importWay: sourceOption[0].value,
      configHostId: undefined,
    },
  ],
})

const filePathOptions = ref<string[]>([])

async function querySupportPaths() {
  const params = {}
  params[props.clusterId] = {
    domainName: props.domainName,
  }
  const [,res] = await api.getDomainSupportConfs(params)
  if (res)
    filePathOptions.value = res[props.clusterId].data
}

function addNewConf() {
  form.confs.push({
    domainName: props.domainName,
    filePath: props.filePath || undefined,
    importWay: sourceOption[0].value,
  })
}
function deleteConf(idx: number) {
  form.confs.splice(idx, 1)
}

const isSubmiting = ref(false)
const fileList = ref<UploadProps['fileList']>([])

async function handleSubmit() {
  isSubmiting.value = true

  try {
    await formRef.value!.validate()
    const params = {}
    if (form.confs[0].importWay === 'file') {
      const formData = new FormData()
      formData.append('filePath', form.confs[0].filePath!)
      formData.append('domainName', form.confs[0].domainName)
      fileList.value?.forEach((file) => {
        formData.append('file', file as any)
      })
      formData.append('cluster_id', props.clusterId)

      const [, res] = await api.uploadDomainConfig(formData)
      if (res && res[props.clusterId].label === 'Succeed') {
        message.success('添加成功')
        emit('success')
      }
      else if (res && res[props.clusterId].label === 'Partial.Succeed') {
        message.success('部分添加成功')
        emit('success')
      }

      else { message.error(res[props.clusterId].label) }
    }
    else {
      params[props.clusterId] = {
        domainName: props.domainName,
        confFiles: form.confs.map(({ filePath, configHostId, configContent }) => ({
          filePath,
          contents: configContent,
          hostId: configHostId,
        })),
      }
      const [, res] = await api.addDomainConfig(
        params,
      )
      if (res && res[props.clusterId].label === 'Succeed') {
        message.success('添加成功')
        emit('success')
      }
      else if (res && res[props.clusterId].label === 'Partial.Succeed') {
        message.success('部分添加成功')
        emit('success')
      }
      else { message.error(res[props.clusterId].label) }
    }
  }
  catch {
  }
  finally {
    isSubmiting.value = false
  }
}

const removeFile: UploadProps['onRemove'] = (file) => {
  if (!fileList.value)
    return
  const index = fileList.value.indexOf(file)
  const newFileList = fileList.value.slice()
  newFileList.splice(index, 1)
  fileList.value = newFileList
}

/**
 * examine file before upload
 * @param file
 */
const preUpload: UploadProps['beforeUpload'] = async (file) => {
  fileList.value = [file]

  const fileSize = file.size
  if (fileSize > 1024 * 1024 * 1) {
    message.error('文件大于1M')
    setTimeout(() => {
      removeFile(file)
    }, 0)
    return false
  }

  return false
}

function validateFile() {
  if (fileList.value?.length === 0)
    return Promise.reject(new Error('请选择文件'))
  return Promise.resolve()
}

function onImportWayChange(idx: number) {
  if (form.confs[idx].importWay === 'file')
    form.confs = [form.confs[idx]]
}

onMounted(() => {
  querySupportPaths()
})
</script>

<template>
  <a-form ref="formRef" :model="form" :label-col="{ span: 5 }" :wrapper-col="{ span: 18 }">
    <div v-for="(conf, index) in form.confs" :key="index">
      <h4 v-if="form.confs.length !== 1" style="cursor: pointer;">
        <MinusCircleOutlined style="padding: 5px;" @click="deleteConf(index)" />新增配置{{ index + 1 }}
      </h4>
      <a-form-item :name="['confs', index, 'domainName']" label="所属业务域" :rules="[{ required: true, message: '请选择业务域!' }]">
        <a-input v-model:value="conf.domainName" disabled :default-value="domainName" />
      </a-form-item>
      <a-form-item
        :name="['confs', index, 'filePath']"
        label="配置路径"
        :rules="[{ required: true, message: '请选择配置路径', trigger: 'change' }]"
      >
        <a-select v-model:value="conf.filePath" placeholder="请选择配置路径">
          <a-select-option
            v-for="path in filePathOptions"
            :key="path"
            :value="path"
          >
            {{ path }}
          </a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item
        :name="['confs', index, 'importWay']"
        :rules="[{ required: true, message: '请选择来源', trigger: 'change' }]"
      >
        <template #label>
          <a-tooltip title="配置来源二选一，推荐使用手动输入">
            <QuestionCircleOutlined />
          </a-tooltip>
          &nbsp;配置来源
        </template>
        <a-select v-model:value="conf.importWay" :options="sourceOption" @change="onImportWayChange(index)" />
      </a-form-item>
      <a-form-item
        v-if="conf.importWay === 'manuel'"
        :name="['confs', index, 'configContent']"
        label="配置内容"
        :rules="[{ required: true, message: '请输入配置内容', trigger: 'change' }]"
      >
        <a-textarea v-model:value="conf.configContent" :rows="8" placeholder="请输入配置内容" />
      </a-form-item>
      <a-form-item
        v-if="conf.importWay === 'auto'"
        :name="['confs', index, 'configHostId']"
        label="选择主机"
        :rules="[{ required: true, message: '请选择主机', trigger: 'change' }]"
      >
        <a-select v-model:value="conf.configHostId" placeholder="请选择主机">
          <a-select-option v-for="item in hostList" :key="item.hostId" :value="item.hostId">
            {{
              item.ip
            }}
          </a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item v-if="conf.importWay === 'file'" label="选择文件" :name="['confs', index, 'files']" :rules="[{ validator: validateFile }]">
        <a-upload
          :file-list="fileList"
          :before-upload="preUpload"
          @remove="removeFile"
        >
          <a-button>
            <UploadOutlined />
            选择文件
          </a-button>
          <span class="upload-tip">
            <p>文件大小不超过1MB</p>
          </span>
        </a-upload>
      </a-form-item>
    </div>
  </a-form>
  <a-button v-if="type !== 'edit' && form.confs[0].importWay !== 'file'" type="dashed" style="width: 100%;margin-bottom: 30px" @click="addNewConf">
    <PlusOutlined /> 新增配置
  </a-button>

  <a-row class="button-group" type="flex" justify="end">
    <a-space>
      <a-button @click="$emit('cancel')">
        取消
      </a-button>
      <a-button
        type="primary"
        :loading="isSubmiting"
        @click="handleSubmit"
      >
        确认
      </a-button>
    </a-space>
  </a-row>
</template>

<style scoped>
.button-group {
  position: absolute;
  bottom: 0;
  width: 94%;
  padding: 10px 0;
  background-color: #fff;
}

.upload-tip {
  left: 130px;
  top: 5px;
  position: absolute;
  font-size: 15px;
  width: 170px;

}
</style>
