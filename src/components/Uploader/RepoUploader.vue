<template>
  <div>
    <input type="file" name="file" @change="getFile" :id="uid" />
    <span class="error-msg">{{ errorMsg }}</span>
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
      default: 1024 * 1024 * 100 // 100MB
    }
  },
  data() {
    return {
      errorMsg: ''
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

          if (file && _this.sizeLimit && _this.sizeLimit < file.size) {
            this.errorMsg = `文件大小超过${_this.sizeLimit / 1024}KB`;
            throw new Error(`文件大小超过${_this.sizeLimit / 1024}KB`);
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
.error-msg {
  position: absolute;
  width: 300px;
  top: 34px;
}
</style>
