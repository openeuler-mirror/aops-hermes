<!-- eslint-disable vue/max-attributes-per-line -->
<template>
  <div @click="showModal">
    <a-button type="primary">上传安全公告</a-button>
    <a-modal title="上传文件" :visible="visible" :footer="null" @cancel="closeModal">
      <div>
        <a-upload :file-list="fileDataList" :remove="removeFile" :before-upload="preUpload">
          <div style="display: flex">
            <div style="flex">
              <a-button> <a-icon type="upload" /> 选择文件 </a-button>
            </div>
            <div style="margin-left: 35px; margin-top: 3px; font-size: 15px">
              <p>支持类型: xml、zip</p>
              <p>文件需小于20M、压缩包内文件数小于100</p>
            </div>
          </div>
        </a-upload>
      </div>
      <div style="margin-top: 14px; font-size: 15px">
        <a-radio-group name="radioGroup" v-model="value" :default-value="2" @change="onChange">
          <a-radio :value="1"> 不受影响 </a-radio>
          <a-radio :value="2"> 受影响 </a-radio>
        </a-radio-group>
      </div>
      <a-button
        type="primary"
        :disabled="fileDataList.length === 0"
        :loading="uploading"
        style="margin-top: 16px; width: 111px"
        @click="goUpload"
      >
        {{ uploading ? '上传中' : '开始上传' }}
      </a-button>
    </a-modal>
  </div>
</template>

<script>
import {upload, reupload} from '@/api/leaks';

export default {
  name: 'AddRepoModal',
  components: {},
  props: {},
  data() {
    return {
      value: 2,
      fileDataList: [],
      visible: false,
      uploading: false
    };
  },
  methods: {
    showModal() {
      this.visible = true;
    },
    closeModal() {
      this.visible = false;
      this.fileDataList = [];
    },
    onChange(e) {
      this.value = e.target.value;
    },
    removeFile(file) {
      const index = this.fileDataList.indexOf(file);
      const newfileDataList = this.fileDataList.slice();
      newfileDataList.splice(index, 1);
      this.fileDataList = newfileDataList;
    },
    preUpload(file) {
      this.fileDataList = [file];
      // 文件类型
      var suffix = file.name.substring(file.name.lastIndexOf('.') + 1);
      var arr = ['xml', 'zip'];
      if (!arr.includes(suffix)) {
        this.$message.error('文件类型不符合规定!');
        this.removeFile(file);
        return false;
      }

      // 读取文件大小
      var fileSize = file.size;
      if (fileSize / 1024 / 1024 / 20 > 1) {
        this.$message.error('文件大于20M!');
        this.removeFile(file);
        return false;
      }
      return false;
    },
    goUpload() {
      const {fileDataList} = this;
      const formData = new FormData();
      fileDataList.forEach((file) => {
        formData.append('file', file);
      });
      this.uploading = true;
      const _this = this;
      if (this.value === 1) {
        reupload(formData)
          .then(function (res) {
            _this.$message.success(res.message);
            _this.$emit('addSuccess');
            _this.fileDataList = [];
            _this.uploading = false;
            _this.value = 1;
          })
          .catch(function (err) {
            _this.uploading = false;
            _this.$message.error(err.response.message || err.response.data.detail);
            _this.value = 1;
          })
          .finally(function () {
            _this.visible = false;
            _this.fileDataList = [];
            _this.value = 1;
          });
      } else {
        upload(formData)
          .then(function (res) {
            _this.$message.success(res.message);
            _this.$emit('addSuccess');
            _this.fileDataList = [];
            _this.uploading = false;
            _this.value = 1;
          })
          .catch(function (err) {
            _this.uploading = false;
            _this.$message.error(err.response.message || err.response.data.detail);
            _this.value = 1;
          })
          .finally(function () {
            _this.visible = false;
            _this.fileDataList = [];
            _this.value = 1;
          });
      }
    }
  }
};
</script>
<style lang="less" scoped>
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
  bottom: 270px;
  height: 24px;
  left: -80px;
}

.influnceIcon {
  margin-right: 10px;
}
</style>
