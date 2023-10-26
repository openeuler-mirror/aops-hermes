<template>
  <div class="editable-cell" ref="childitem">
    <a-form-model
      ref="ruleForm"
      :model="form"
      :rules="rules"
    >
      <div v-if="editable" class="editable-cell-input-wrapper">
        <a-form-model-item :prop="formkey">
          <!-- 当formkey为密码时，使用密码框组件 -->
          <a-input-password v-if="formkey === 'password' || formkey === 'ssh_pkey'" @change="handleChange" @pressEnter="check" v-model="form[formkey]" />
          <a-input v-else @change="handleChange" @pressEnter="check" v-model="form[formkey]" />
          <a-icon
            style="top: -7px;"
            type="check"
            class="editable-cell-icon-check"
            @click="check"
          />
        </a-form-model-item>
      </div>
      <div v-else class="editable-cell-text-wrapper">
        <div class="editable-content">
          <!-- <a-input :type="formkey === 'password' ? 'password' : 'text'" v-model="value" /> -->
          <span v-if="formkey === 'password' || formkey === 'ssh_pkey'">{{ countStar() }}</span>
          <span v-else>{{ value || ' ' }}</span>
        </div>
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
    },
    record: {
      default: null,
      type: Object
    }
  },
  data() {
    const validatePassword = (rule, value, callback) => {
      if (!this.record.ssh_pkey && (value.length === 0 || value.split(' ').join('').length === 0)) {
        callback(new Error('password和ssh_pkey不能都为空!'));
      } else {
        callback();
      }
    };
    const validateSshpkey = (rule, value, callback) => {
      if (!this.record.password && (value.length === 0 || value.split(' ').join('').length === 0)) {
        callback(new Error('password和ssh_pkey不能都为空!'));
      } else {
        callback();
      }
    };
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
      if (!/^\S.*\S$/.test(value)) {
        /* eslint-disable */
        callback(new Error('首尾不允许空格'));
        /* eslint-enable */
        return;
      }
      if (!/^(?!\s*$).+/.test(value)) {
        /* eslint-disable */
        callback(new Error('不允许全空格'));
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
      value: this.text === 'undefined' ? '' : this.text,
      editable: false,
      rules: {
        host_ip: [{ required: true, pattern: /^((2[0-4]\d|25[0-5]|[01]?\d\d?)\.){3}(2[0-4]\d|25[0-5]|[01]?\d\d?)$/, message: '请输入IP地址在 0.0.0.0~255.255.255.255 区间内', trigger: 'change' }],
        ssh_port: [{required: true, message: '请输入端口'}, {validator: checkSSHPort}],
        ssh_user: [{ validator: validateUser, trigger: 'change' }],
        password: [{ validator: validatePassword, trigger: 'change' }],
        ssh_pkey: [{ validator: validateSshpkey, trigger: 'change' }],
        host_name: [{ validator: checkNameInput, trigger: 'change' }],
        host_group_name: [{ required: true, message: 'host_group_name不能为空', trigger: 'change' }],
        management: [{ validator: checkmanagement, trigger: 'change' }]
      }
    };
  },
  methods: {
    countStar(num) {
      return '**********'
    },
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
          if (this.editable) {
            // 判断当前状态，只对处于修改状态的组件执行此操作，节省性能
            this.editable = false;
            this.$emit('allowSub')
            this.$emit('change', this.value);
          }
        } else {
          return false;
        }
      });
    },
    edit() {
      this.$emit('unSubmit')
      this.editable = true;
    },
    handleClickOutside(event) {
    // 鼠标监听事件
      const target = event.target
      const wrapper = this.$refs.childitem
      // 判断点击的区域是否是当前组件的区域
      if (!wrapper.contains(target)) {
        // 当点击组件之外时 执行校验操作
        this.check()
      }
    }
  },
  created() {
  },
  beforeDestroy() {
    document.removeEventListener('mouseup', this.handleClickOutside);
  },
  mounted() {
    document.addEventListener('mouseup', this.handleClickOutside)
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

.editable-cell-icon {
  position: absolute;
  right: 0;
  width: 20px;
  cursor: pointer;
}

.editable-cell-icon-check {
  position: absolute;
  right: -26px;
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
