<template>
  <div>
    <div @click="showModal">
      <slot name="button">
        <a-button type="primary">添加镜像</a-button>
      </slot>
    </div>
    <a-modal title="添加镜像" :visible="visible" :confirm-loading="isLoading" @ok="handleOk"
             :maskClosable="false" @cancel="handleCancel">
      <a-form :form="form" :label-col="{span: 5}" :wrapper-col="{span: 16}">
        <a-form-item label="选择文件" html-for={null}>
          <a-upload :file-list="fileDataList" :remove="removeFile" :before-upload="preUpload"
                    v-decorator="['file',{rules: [{required: true, message: '请选择文件'}]}]">
            <div style="display:flex;">
              <div>
                <a-button>
                  <a-icon type="upload"/>
                  选择文件
                </a-button>
              </div>
            </div>
          </a-upload>
          <div class="upload-tip">
            <p>支持类型: iso</p>
            <p>文件大小不超过5GB</p>
          </div>
        </a-form-item>
        <a-form-item label="ISO文件名">
          <a-input
            placeholder="请输入ISO文件名"
            v-decorator="['ISOName',{rules: [{required: true, message: '请输入ISO文件名称'}, {validator: checkISOName}]}
            ]">
            <a-tooltip slot="suffix" title="ISO文件名称只能由字母、数字、下划线和中划线组成，无须包含架构">
              <a-icon type="info-circle" style="color: rgba(0,0,0,.45)" />
            </a-tooltip>
          </a-input>
        </a-form-item>
        <a-form-item label="镜像架构">
          <a-select placeholder="请选择镜像架构"
                    v-decorator="['arch', {rules: [{required: true, message: '请选择镜像架构'}]}]">
            <a-select-option v-for="arch in archList" :value="arch.value" :key="arch.value">
              {{ arch.label }}
            </a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script>
import {uploadImage} from '@/api/imageManagement';
// 弹窗添加镜像
export default {
  name: 'ImageUpload',
  props: {
    onSuccess: {
      type: Function,
      default: null
    }
  },
  data() {
    return {
      visible: false,
      isLoading: false,
      form: this.$form.createForm(this, {name: 'uploadImage'}),
      fileDataList: [],
      archList: [
        {
          label: 'x86_64',
          value: 'x86_64'
        },
        {
          label: 'aarch64',
          value: 'aarch64'
        }
      ]
    };
  },
  methods: {
    showModal() {
      this.form.resetFields();
      this.fileDataList = []
      this.visible = true;
    },
    handleCancel() {
      this.visible = false;
      this.fileDataList = []
    },
    handleOk() {
      this.form.validateFields((err, values) => {
        if (!err) {
          const _this = this;
          this.isLoading = true;
          const formData = new FormData()
          this.fileDataList.forEach((file) => {
            formData.append('file', file);
          })
          formData.append('iso_name', values.ISOName)
          formData.append('arch', values.arch)
          uploadImage(formData)
            .then(function (res) {
              if (res.code === 200) {
                _this.$message.success(res.msg)
                _this.onSuccess && _this.onSuccess()
                _this.visible = false
                _this.fileDataList = []
                _this.form.resetFields()
              } else {
                _this.$message.error(res.msg)
              }
            })
            .catch(function (err) {
             if (err.response.statusText) {
                _this.$message.error(err.response.statusText)
              } else {
                _this.$message.error('上传失败，请稍后再试！')
              }
            })
            .finally(function () {
              _this.isLoading = false;
            });
        }
      });
    },
    removeFile(file) {
      const index = this.fileDataList.indexOf(file);
      const newFileDataList = this.fileDataList.slice();
      newFileDataList.splice(index, 1);
      this.fileDataList = newFileDataList;
    },
    preUpload(file) {
      this.fileDataList = [file];
      // 文件类型
       const suffix = file.name.substring(file.name.lastIndexOf('.') + 1);
       const arr = ['iso'];
       if (!arr.includes(suffix)) {
         this.$message.error('文件类型不符合规定!');
         this.removeFile(file);
         return false;
       }
      // 读取文件大小
      const fileSize = file.size;
      if (fileSize / 1024 / 1024 > 5120) {
        this.$message.error('文件大于5G!');
        this.removeFile(file);
        return false;
      }
      return false;
    },
    checkISOName(rule, value, cb) {
      if (!/^[A-Za-z0-9_-]+$/.test(value)) {
        cb(new Error('ISO文件名称只能由字母、数字、下划线和中划线组成，无须包含架构'))
        return
      }
      if (value.includes('-x86') || value.includes('_x86') || value.includes('-aarch64') || value.includes('_aarch64')) {
        cb(new Error('ISO文件名称只能由字母、数字、下划线和中划线组成，无须包含架构'))
        return
      }
      cb()
    }
  }
};
</script>
<style lang="less" scoped>
.upload-tip {
  left: 150px;
  top: -10px;
  position: absolute;
  font-size: 15px;
  line-height: 18px;
  width: 170px;

  p {
    margin-bottom: 5px;
  }
}
</style>
