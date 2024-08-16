<script lang="ts" setup>
import { read, utils } from 'xlsx'
import {
  CheckCircleTwoTone,
  ExclamationCircleTwoTone,
  InfoCircleTwoTone,
  PlusOutlined,
  UploadOutlined,
} from '@ant-design/icons-vue'
import { type FormInstance, type UploadProps, message } from 'ant-design-vue'

import { computed, h, reactive, ref } from 'vue'
import type { Rule } from 'ant-design-vue/es/form'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import EditableCell from './EditableCell.vue'
import { type HostItem, type HostParams, api } from '@/api'

import type { DistributionParams } from '@/api/paths/types'
import { useClusterStore } from '@/store'

const emit = defineEmits(['success'])

const ALLOW_FILE_TYPE = ['xlsx', 'xls', 'csv']

const { t } = useI18n()
const addStatusEnum: Record<string, string> = {
  succeed: t('common.succeed'),
  failed: t('common.fail'),
}

const form = reactive<{
  selectedCluster: string | undefined
}>({
  selectedCluster: undefined,
})

const formRules: Record<string, Rule[]> = {
  selectedCluster: [{ required: true, message: t('assests.placeHolder.cluster'), trigger: 'change' }],
}

const { permissions } = storeToRefs(useClusterStore())

const clusterOptions = computed(() =>
  permissions.value.map(({ cluster_id, cluster_name }) => ({ cluster_id, cluster_name })),
)

const modalState = reactive({
  visible: false,
  isLoading: false,
  expandedRowKeys: [],
})
// #region ----------------------------------------< table >----------------------------------------
const tableColumn = computed(() => ([
  {
    title: t('assests.ip'),
    dataIndex: 'host_ip',
  },
  {
    title: t('assests.sshPort'),
    dataIndex: 'ssh_port',
  },
  {
    title: t('assests.username'),
    dataIndex: 'ssh_user',
  },
  {
    title: t('assests.password'),
    dataIndex: 'password',
  },
  {
    title: t('assests.sshPkey'),
    dataIndex: 'ssh_pkey',
  },
  {
    title: t('assests.hostName'),
    dataIndex: 'host_name',
  },
  {
    title: t('assests.hostGroup'),
    dataIndex: 'host_group_name',
  },
  {
    title: t('assests.managementCheck'),
    dataIndex: 'management',
    align: 'center',
  },
  {
    title: t('common.operation'),
    dataIndex: 'operation',
  },
  {
    title: t('assests.addResult'),
    dataIndex: 'result',
  },
]))

const tableData = ref<HostItem[]>([])

function addNewRow() {
  tableData.value.push({
    key: tableData.value.length,
    host_ip: '127.0.0.1',
    host_group_name: 'test_host_group',
    host_name: 'test_host',
    management: false,
    ssh_pkey: 'private key',
    ssh_port: 22,
    ssh_user: 'root',
    password: 'password',
  })
}

// #endregion

// #region ----------------------------------------< upload file >----------------------------------------
const fileList = ref<UploadProps['fileList']>([])

function deleteHost(ind: number) {
  tableData.value.splice(ind, 1)
  if (tableData.value.length === 0)
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

const excludeList = ['result', 'operation', 'password', 'ssh_pkey']
const beforeUpload: UploadProps['beforeUpload'] = async (file) => {
  const fileType = file.name.split('.')[1]
  if (!ALLOW_FILE_TYPE.includes(fileType)) {
    message.error(t('assests.sentence.fileError'))
    setTimeout(() => {
      removeFile(file)
    }, 0)
    return false
  }
  const fileData = await readFile(file)
  const workbook = read(fileData, { type: 'buffer' })
  const worksheet = workbook.Sheets[workbook.SheetNames[0]]
  const result = utils.sheet_to_json(worksheet)
  if (!result)
    return

  const defaultkeys = tableColumn.value
    .filter(item => !excludeList.includes(item.dataIndex))
    .map(item => item.dataIndex)
  const isSatisfactory = result.every((obj: object) =>
    defaultkeys.every(key => Object.prototype.hasOwnProperty.call(obj, key)),
  )
  if (!isSatisfactory) {
    message.error(t('assests.sentence.fileParamsError'))
    setTimeout(() => {
      removeFile(file)
    }, 0)
    return false
  }
  tableData.value = [
    ...(result as HostItem[]).map((item, index) => {
      return {
        ...item,
        key: index,
      }
    }),
  ]
  fileList.value = [...(fileList.value || []), file]

  return false
}

/**
 * read file as array buffer
 * @param file
 */
async function readFile(file: File): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = event => resolve(event.target!.result)
    reader.onerror = reject
    reader.readAsArrayBuffer(file)
  })
}

async function downLoadTemplate() {
  const [_] = await api.downLoadHostTemplate()
  if (_)
    message.error(t('common.fail'))
}
// #endregion

/**
 * close modal
 */
function closeModal() {
  modalState.visible = false
  fileList.value = []
  tableData.value = []
  form.selectedCluster = undefined
}

const excludeCell = ['operation', 'result']
const formRef = ref<FormInstance>()

async function handleSubmit() {
  modalState.isLoading = true
  try {
    await formRef.value?.validate()
    const params: DistributionParams<{
      host_list: HostParams[]
    }> = {}
    const hosts: HostParams[] = []
    tableData.value.forEach(
      ({
        host_name,
        host_group_name,
        host_ip,
        management,
        password,
        ssh_pkey,
        ssh_port,
        ssh_user,
      }) => {
        hosts.push({
          host_ip,
          host_group_name,
          host_name,
          ssh_pkey,
          ssh_port,
          ssh_user,
          password,
          management,
        })
      },
    )
    params[form.selectedCluster!] = { host_list: hosts }

    const [_, res] = await api.addHostsBatch(params)
    if (res && res[form.selectedCluster!].data) {
      let success: number = 0
      tableData.value.forEach((item) => {
        const row = res[form.selectedCluster!].data.find(
          t => `${t.host_ip}${t.ssh_port}` === `${item.host_ip}${item.ssh_port}`,
        )
        if (row) {
          item.reason = row.reason
          item.result = row.result
        }
        else {
          item.result = 'succeed'
        }
        if (item.result === 'succeed')
          success += 1
      })
      if (success === tableData.value.length)
        message.success(t('common.succeed'))
      else if (success > 0 && success < tableData.value.length)
        message.warning(t('assests.sentence.partialSuccess'))
      else message.error(t('common.fail'))
    }
    else {
      message.success(t('common.succeed'))
      closeModal()
      emit('success')
    }
  }
  catch {
    modalState.isLoading = false
  }
  finally {
    modalState.isLoading = false
  }
}

const isEditing = ref(false)
const editableKeys = ref<string[]>([])

function handleSave(key: string, value: string, index: number) {
  tableData.value[index][key] = value
  editableKeys.value = editableKeys.value.filter(item => item !== key)
  isEditing.value = false
}

function handleEdit(key: string) {
  editableKeys.value.push(key)
  isEditing.value = true
}
</script>

<template>
  <div class="add-more-host">
    <div @click="modalState.visible = true">
      <slot name="trigger" />
    </div>
    <a-modal
      v-model:open="modalState.visible"
      :title="t('assests.addHost')"
      :footer="null"
      destroy-on-close
      width="98%"
      @cancel="closeModal"
    >
      <a-row type="flex" align="top">
        <a-col>
          <a-form ref="formRef" :model="form" :rules="formRules">
            <a-form-item name="selectedCluster" class="form-item">
              <a-select
                v-model:value="form.selectedCluster"
                :placeholder="t('assests.placeHolder.cluster')"
                style="width: 300px"
              >
                <template v-for="cluster in clusterOptions" :key="cluster.cluster_id">
                  <a-select-option :value="cluster.cluster_id">
                    {{
                      cluster.cluster_name
                    }}
                  </a-select-option>
                </template>
              </a-select>
            </a-form-item>
          </a-form>
        </a-col>
        <a-col style="margin-left: 10px">
          <a-upload
            v-model:file-list="fileList"
            style="display: inline-block"
            name="file"
            :before-upload="beforeUpload"
            @remove="removeFile"
          >
            <template #itemRender />
            <a-button>
              <UploadOutlined />
              {{ t('common.selectDoc') }}
            </a-button>
          </a-upload>
          <span class="upload-type">
            {{ t('assests.sentence.supportFile') }}
            <a @click="downLoadTemplate">{{ t('common.downloadTemp') }}</a>
          </span>
        </a-col>
      </a-row>
      <a-row style="margin: 10px 0" type="flex" justify="space-between">
        <a-col>
          <a-button :icon="h(PlusOutlined)" @click="addNewRow">
            {{ t('common.add') }}
          </a-button>
        </a-col>
      </a-row>

      <a-table
        v-if="tableData.length"
        v-model:expandedRowKeys="modalState.expandedRowKeys"
        bordered
        :columns="tableColumn"
        :data-source="tableData"
      >
        <template #expandedRowRender="{ record }">
          <span style="color: red">{{ record.reason }}</span>
        </template>
        <template #bodyCell="{ record, column, index }">
          <template v-if="!excludeCell.includes(column.dataIndex)">
            <EditableCell
              :form-data="record"
              :form-key="column.dataIndex"
              @save="(key: string, value: string) => handleSave(key, value, index)"
              @edit="handleEdit"
            />
          </template>

          <template v-if="column.dataIndex === 'operation'">
            <a @click="deleteHost(index)">{{ t('common.delete') }} </a>
          </template>
          <template v-if="column.dataIndex === 'result'">
            <a-row :gutter="8">
              <a-col>
                <CheckCircleTwoTone v-if="record.result === 'succeed'" two-tone-color="#52c41a" />
                <ExclamationCircleTwoTone
                  v-else-if="record.result === 'failed'"
                  two-tone-color="#ff0000"
                />
                <InfoCircleTwoTone v-else two-tone-color="#CDCD00" />
              </a-col>
              <a-col> {{ addStatusEnum[record.result] || t('common.notExcute') }} </a-col>
            </a-row>
          </template>
        </template>
      </a-table>
      <a-row type="flex" justify="end">
        <a-button
          type="primary"
          :loading="modalState.isLoading"
          :disabled="tableData.length === 0 || editableKeys.length !== 0"
          @click="handleSubmit"
        >
          {{ modalState.isLoading ? t('common.submitting') : t('common.confirm') }}
        </a-button>
      </a-row>
    </a-modal>
  </div>
</template>

<style lang="less" scoped>
.upload-type {
  position: absolute;
  left: 130px;
  top: 5px;
  white-space: nowrap;
}
.form-item {
  margin: 0;
}
.editable-cell {
  position: relative;
  .editable-cell-input-wrapper,
  .editable-cell-text-wrapper {
    padding-right: 10px;
  }

  .editable-cell-text-wrapper {
    padding: 5px 24px 5px 5px;
  }

  .editable-cell-icon,
  .editable-cell-icon-check {
    position: absolute;
    top: 8px;
    right: 0;
    width: 20px;
    cursor: pointer;
  }

  .editable-cell-icon {
    margin-top: 4px;
    display: none;
  }

  .editable-cell-icon-check {
    line-height: 28px;
  }

  .editable-cell-icon:hover,
  .editable-cell-icon-check:hover {
    color: #108ee9;
  }

  .editable-add-btn {
    margin-bottom: 8px;
  }
}
.editable-cell:hover .editable-cell-icon {
  display: inline-block;
}
</style>
