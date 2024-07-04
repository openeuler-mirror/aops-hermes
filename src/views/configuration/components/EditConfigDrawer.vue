<script lang="ts" setup>
import { CloseOutlined, QuestionCircleOutlined, UploadOutlined } from '@ant-design/icons-vue'
import { type FormInstance, type UploadProps, message } from 'ant-design-vue'

import { reactive, ref } from 'vue'
import { type HostInDomain, api } from '@/api'

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

const emit = defineEmits(['success'])

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
      filePath: props.filePath || '',
      importWay: sourceOption[0].value,
      configHostId: undefined,
    },
  ],
})

const isSubmiting = ref(false)
const fileList = ref<UploadProps['fileList']>([])

async function handleSubmit() {
  isSubmiting.value = true
  try {
    await formRef.value!.validate()
    const params = {}

    if (form.confs[0].importWay === 'file') {
      const formData = new FormData()
      formData.append('filePath', form.confs[0].filePath)
      formData.append('domainName', form.confs[0].domainName)
      fileList.value?.forEach((file) => {
        formData.append('file', file as any)
      })
      formData.append('cluster_id', props.clusterId)

      const [, res] = await api.uploadDomainConfig(formData)
      if (res && res[props.clusterId].label === 'Succeed') {
        message.success('修改成功')
        emit('success')
        visible.value = false
        onClose()
      }
      else {
        message.error('修改失败')
      }
    }
    else {
      params[props.clusterId] = {
        domainName: props.domainName,
        confFiles: form.confs.map(({ filePath, configHostId: hostId, configContent }) => ({
          filePath,
          contents: configContent,
          hostId,
        })),
      }

      const [, res] = await api.addDomainConfig(
        params,
      )
      if (res && res[props.clusterId].label === 'Succeed') {
        message.success('修改成功')
        emit('success')
        visible.value = false
        onClose()
      }
      else {
        message.error('修改失败')
      }
    }
  }
  catch {
  }
  finally {
    isSubmiting.value = false
  }
}

function onClose() {
  form.confs.forEach((item) => {
    item.configContent = undefined
    item.configHostId = undefined
  })
  fileList.value = []
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

function OnImportWayChanged(_value: string) {
  onClose()
}
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
    @close="onClose"
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
          <a-select v-model:value="conf.importWay" :options="sourceOption" @change="OnImportWayChanged" />
        </a-form-item>
        <a-form-item
          v-if="conf.importWay === 'manuel'"
          :name="['confs', index, 'configContent']"
          label="配置内容"
          :rules="[{ required: true, message: '请输入配置路径', trigger: 'change' }]"
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
        <a-form-item v-if="conf.importWay === 'file'" label="选择文件" :name="['confs', index, 'confs']" :rules="[{ validator: validateFile }]">
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
    <div class="operate-button">
      <a-space>
        <a-button @click="visible = false">
          取消
        </a-button>
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

.upload-tip {
  left: 130px;
  top: 5px;
  position: absolute;
  font-size: 15px;
  width: 170px;

}
</style>
