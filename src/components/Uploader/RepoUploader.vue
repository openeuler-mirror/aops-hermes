<template>
  <div>
    <a-button size="small" class="divbtn">选择文件
      <input type="file" name="file" @change="getFile" :id="uid" class="uploader" />
    </a-button>
    <span class="innerText">{{ fileName }}</span>
    <div class="error-msg">{{ errorMsg }}</div>
  </div>
</template>

<script>

/**
 * Component for repo file uplod
 */

export default {
  name: 'Uploader',
  props: {
    uid: {
      // if of input element
      type: String,
      default: 'upload'
    },
    sizeLimit: {
      type: Number,
      default: 1024 * 20 // 100MB
    }
  },
  data() {
    return {
      errorMsg: '',
      fileName: ''
    };
  },
  methods: {
    // call this.$refs.<refName>.getFile() to get file content in parent component
    getFile() {
      const _this = this;
      this.errorMsg = '';
      return new Promise((resolve, reject) => {
        try {
          const file = document.getElementById(_this.uid).files[0];
          this.fileName = file.name;
          if (file && _this.sizeLimit && _this.sizeLimit < file.size) {
            this.errorMsg = `文件大小超过${_this.sizeLimit / 1024}KB`;
            return false;
            // throw new Error(`文件大小超过${_this.sizeLimit / 1024}KB`);
          }
          const reader = new FileReader();
          file && reader.readAsText(file);
          reader.onload = function(e) {
            try {
              const content = e.target.result;
              _this.$emit('load', content);
              _this.$emit('change', content);
              document.getElementById(_this.uid).value = '';
              resolve(content);
            } catch (errAsync) {
              _this.$emit('error', errAsync);
              _this.$emit('change');
              document.getElementById(_this.uid).value = '';
              reject(errAsync);
            }
          };
        } catch (err) {
          _this.$emit('error', err);
          _this.$emit('change');
          document.getElementById(_this.uid).value = '';
          reject(err);
        }
      });
    }
  }
};
</script>

<style lang="less" scoped>
.divbtn{
  position: relative;
  margin-right: 10px;
}
.uploader{
  position: absolute; top: 0; left: 0; opacity: 0; cursor: pointer;
}
.error-msg {
  position: absolute;
  color: #f5222d;
  width: 300px;
  top: 34px;
}
</style>
