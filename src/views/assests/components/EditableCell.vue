<template>
  <div class="editable-cell">
    <a-form-model
      ref="ruleForm"
      :model="form"
      :rules="rules"
    >
      <div v-if="editable" class="editable-cell-input-wrapper">
        <a-form-model-item :prop="formkey">
          <a-input @change="handleChange" @pressEnter="check" v-model="form[formkey]" />
          <a-icon
            type="check"
            class="editable-cell-icon-check"
            @click="check"
          />
        </a-form-model-item>
      </div>
      <div v-else class="editable-cell-text-wrapper">
         <div class="editable-content">{{ value || ' ' }}</div>
         <a-icon type="edit" class="editable-cell-icon" @click="edit" />
      </div>
    </a-form-model>
  </div>
</template>
<script>
export default {
  name: 'EditableCell',
  props: {
    text: {
      default: ' ',
      type: String
    },
    formkey: {
      default: '',
      type: String
    }
  },
  data() {
    const validateUser = (rule, value, callback) => {
      if (value.length === 0 || value.split(' ').join('').length === 0) {
        callback(new Error('ssh_user不能为空!'));
      } else {
        callback();
      }
    };
    const checkmanagement = (rule, value, callback) => {
      if (value === 'true') {
        callback();
      } else if (value === 'false') {
        callback();
      } else {
        callback(new Error('management必须为布尔值'));
      }
    };
    const checkNameInput = (rule, value, callback) => {
      if (/[^0-9a-z_.]/.test(value)) {
        /* eslint-disable */
        callback(new Error('只能输入数字、小写字母和英文.和_'));
        /* eslint-enable */
        return;
      }
      if (/[_]$/.test(value)) {
        /* eslint-disable */
        callback(new Error('结尾不能是英文下划线'));
        /* eslint-enable */
        return;
      }
      callback();
    };
    const checkSSHPort = (rule, value, cb) => {
      if (value < 0 || value > 65535) {
        /* eslint-disable */
        cb('输入数据范围必须在0~65535之间!');
        /* eslint-enable */
        return;
      }
      if (value % 1 !== 0) {
        /* eslint-disable */
        cb('输入数据必须是整数!');
        /* eslint-enable */
        return;
      }
      cb();
    };
    return {
      value: this.text,
      editable: false,
      rules: {
        host_ip: [{ required: true, pattern: /^((2[0-4]\d|25[0-5]|[01]?\d\d?)\.){3}(2[0-4]\d|25[0-5]|[01]?\d\d?)$/, message: '请输入IP地址在 0.0.0.0~255.255.255.255 区间内', trigger: 'change' }],
        ssh_port: [{required: true, message: '请输入端口'}, {validator: checkSSHPort}],
        ssh_user: [{ validator: validateUser, trigger: 'change' }],
        password: [{ required: true, message: 'password不能为空', trigger: 'change' }],
        host_name: [{ validator: checkNameInput, trigger: 'change' }],
        host_group_name: [{ required: true, message: 'host_group_name不能为空', trigger: 'change' }],
        management: [{ validator: checkmanagement, trigger: 'change' }]
      }
    };
  },
  methods: {
    handleChange(e) {
      const value = e.target.value;
      this.value = value;
    },
    preToUpload() {
      this.edit();
      this.check();
    },
    check() {
      this.$refs.ruleForm.validate(valid => {
        if (valid) {
          this.editable = false;
          this.$emit('change', this.value);
        } else {
          return false;
        }
      });
    },
    edit() {
      this.editable = true;
    }
  },
  created() {
  },
  mounted() {
    // this.edit()
    // this.check()
  },
  computed: {
    form () {
      const params = {}
      params[this.formkey] = this.value
      return params
    }
  }
}
</script>
<style>
.editable-content {
  display: inline-block;
}

.editable-cell {
  position: relative;
}

.editable-cell-input-wrapper,
.editable-cell-text-wrapper {
  padding-right: 24px;
}

.editable-cell-text-wrapper {
  padding: 5px 24px 5px 5px;
}

.editable-cell-icon,
.editable-cell-icon-check {
  position: absolute;
  right: 0;
  width: 20px;
  cursor: pointer;
}

.editable-cell-icon {
  line-height: 24px;
  display: none;
}

.editable-cell-icon-check {
  line-height: 35px;
}

.editable-cell:hover .editable-cell-icon {
  display: inline-block;
}

.editable-cell-icon:hover,
.editable-cell-icon-check:hover {
  color: #108ee9;
}

.editable-add-btn {
  margin-bottom: 8px;
}
</style>
