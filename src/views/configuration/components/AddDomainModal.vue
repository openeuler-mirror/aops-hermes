<script lang="ts" setup>
import { PlusOutlined } from '@ant-design/icons-vue'
import { reactive, ref } from 'vue'

interface Form {
  username: string
  password: string
}

const form = reactive<Form>({
  username: '',
  password: '',
})

const isModalVisible = ref(false)
function showModal() {
  isModalVisible.value = true
}

async function addDomain() {}
</script>

<template>
  <div class="add-domain" @click="showModal">
    <PlusOutlined />
    <a-modal
      v-model:open="isModalVisible"
      title="创建业务域"
      @ok="addDomain"
      @cancel="isModalVisible = false"
    >
      <a-form :form="form" :label-col="{ span: 5 }" :wrapper-col="{ span: 16 }">
        <a-form-item label="业务域名称">
          <a-input :max-length="26" placeholder="请输入业务域名称，26个字符以内" />
        </a-form-item>
        <a-form-item label="优先级">
          <a-input :disabled="true" placeholder="未开放设置" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<style lang="less" scoped>
.add-domain {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 36px;
  cursor: pointer;
  border: 1px dashed #d9d9d9;
  &:hover {
    border-color: #3265f2;
  }
}
</style>
