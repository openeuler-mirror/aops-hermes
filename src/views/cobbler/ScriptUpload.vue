<template>
  <div>
    <div @click="showModal">
      <slot name="button">
        <a-button type="primary">添加脚本</a-button>
      </slot>
    </div>
    <a-modal title="添加脚本" :visible="visible" :confirm-loading="isLoading" @ok="handleOk"
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
            <p>支持类型: sh</p>
            <p>文件大小不超过10M</p>
          </div>
        </a-form-item>
        <a-form-item label="脚本文件名">
          <a-input
            placeholder="请输入脚本文件名"
            v-decorator="['script_name',{rules: [{required: true, message: '请输入脚本文件名称'}, {validator: checkScriptName}]}]">
            <a-tooltip slot="suffix" title="脚本文件名称只能由字母、数字、下划线和中划线组成">
              <a-icon type="info-circle" style="color: rgba(0,0,0,.45)" />
            </a-tooltip>
          </a-input>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script>
import {uploadScript} from '@/api/scriptManagement';
// 弹窗添加脚本
export default {
  name: 'ScriptUpload',
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
      form: this.$form.createForm(this, {name: 'uploadScript'}),
      fileDataList: []
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
            formData.append('script_file', file);
          })
          formData.append('script_name', values.script_name)
          uploadScript(formData)
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
       const arr = ['sh'];
       if (!arr.includes(suffix)) {
         this.$message.error('文件类型不符合要求!');
         this.removeFile(file);
         return false;
       }
      // 读取文件大小
      const fileSize = file.size;
      if (fileSize / 1024 / 1024 > 10) {
        this.$message.error('文件大于10M!');
        this.removeFile(file);
        return false;
      }
      return false;
    },
    checkScriptName(rule, value, cb) {
      if (!/^[A-Za-z0-9_-]+$/.test(value)) {
        cb(new Error('脚本文件名称只能由字母、数字、下划线和中划线组成'))
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
