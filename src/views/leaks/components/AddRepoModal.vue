<!-- eslint-disable vue/max-attributes-per-line -->
<template>
  <div class="aops-add-repo" @click="showModal">
    <a-icon type="plus" />
    <a-modal
      centered
      title="新建REPO源"
      :visible="visible"
      :confirm-loading="isLoading"
      @ok="handleOk"
      @cancel="handleCancel"
    >
      <a-form :form="form" :label-col="{span: 5}" :wrapper-col="{span: 19}">
        <a-form-item label="REPO源名称">
          <a-input
            :maxLength="20"
            placeholder="请输入REPO源名称，20个字符以内"
            v-decorator="[
              'repoName',
              {
                rules: [
                  {required: true, message: '请输入REPO名称'},
                  {max: 20, message: '20个字符以内'}
                ]
              }
            ]"
          >
          </a-input>
        </a-form-item>
        <a-form-item label="REPO内容">
          <div>
            <a-textarea
              style="resize: none"
              v-decorator="['repoData', {rules: [{required: true, message: '请输入REPO描述'}]}]"
              :rows="16"
              :maxLength="512"
              placeholder="请输入REPO内容，512个字符以内"
            />
            <a-button class="download-template" @click="handleGetTemplate">下载模板</a-button>
          </div>
        </a-form-item>
        <a-form-item label="上传文件" class="upload-row">
          <uploader ref="upload" toJSON uid="repoUploader" fileType="repo" @change="handleFileUpload" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script>
/**
 * 添加repo弹窗
 */

import {addRepo, getRepoTemplate} from '@/api/leaks';

import {downloadBlobFile} from '@/views/utils/downloadBlobFile';
import Uploader from '@/components/Uploader/RepoUploader';

export default {
  name: 'AddRepoModal',
  components: {
    Uploader
  },
  props: {},
  data() {
    return {
      visible: false,
      isLoading: false,
      form: this.$form.createForm(this, {name: 'addRepo'})
    };
  },
  methods: {
    showModal() {
      this.form.resetFields();
      this.visible = true;
    },
    handleCancel() {
      this.visible = false;
      this.$refs.upload.fileName = '';
      this.$refs.upload.errorMsg = '';
      this.repoData = '';
      this.form.resetFields();
    },
    handleOk() {
      this.form.validateFields((err, values) => {
        if (!err) {
          const _this = this;
          this.isLoading = true;
          addRepo(values)
            .then(function (res) {
              _this.$message.success(res.message);
              _this.$emit('addSuccess');
              _this.visible = false;
              _this.form.resetFields();
            })
            .catch(function (err) {
              _this.$message.error(err.response.message || err.response.data.detail);
            })
            .finally(function () {
              _this.isLoading = false;
              _this.$refs.upload.fileName = '';
              _this.$refs.upload.errorMsg = '';
              _this.repoData = '';
            });
        }
      });
    },
    // 下载模板
    handleGetTemplate() {
      const _this = this;
      getRepoTemplate()
        .then(function (res) {
          // download files
          downloadBlobFile(res.data, res.fileName);
        })
        .catch(function (err) {
          _this.$message.error(err.response.message);
        });
    },
    handleFileUpload(content) {
      content && this.form.setFieldsValue({repoData: content});
    }
  }
};
</script>
<style lang="less" scoped>
.aops-add-repo {
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
.upload-row {
  /deep/ .ant-form-item-label {
    line-height: 22px;
  }
  /deep/ .ant-form-item-control {
    line-height: 16px;
  }
}

.download-template {
  position: absolute;
  width: 70px;
  padding: 0 4px;
  top: 35px;
  height: 24px;
  left: -80px;
}
</style>
