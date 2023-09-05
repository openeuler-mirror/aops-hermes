<template>
  <span>
    <slot name="button">
      <a-button type="primary">修改密码</a-button>
    </slot>
    <a-modal
    title="修改用户密码"
    :visible="visible"
    :confirm-loading="isLoading"
     @ok="handleOk"
      @cancel="handleCancel">
      <a-form :form="form" :label-col="{span: 5}" :wrapper-col="{span: 16}">
        <a-form-item label="当前密码">
          <a-input-password
          placeholder="密码长度6-20位, 包含字母和数字"
          v-decorator="[
              'old_password',
              {
                rules: [{required: true, message: '请输入当前密码!'}, {validator: validateToNextPassword}],
                validateTrigger: 'blur'
              }
            ]">
          </a-input-password>
        </a-form-item>
        <a-form-item label="新密码">
          <a-input-password
          placeholder="新密码和当前密码不能相同"
          v-decorator="[
              'password',
              {
                rules: [{required: true, message: '请输入新密码!'}, {validator: compareToFirstPassword}],
                validateTrigger: 'blur'
              }
            ]"
            @blur="handleConfirmBlur">
          </a-input-password>
        </a-form-item>
        <a-form-item label="确认密码">
          <a-input-password
          placeholder="确认密码和新密码保持一致"
          v-decorator="[
              'repassword',
              {
                rules: [{required: true, message: '请输入新密码!'}, {validator: compareToNewPassword}],
                validateTrigger: 'blur'
              }
            ]">
          </a-input-password>
        </a-form-item>
      </a-form>
    </a-modal>
  </span>
</template>

<script>
import {changePassword} from '@/api/login';
// 修改用户密码
export default {
  name: 'ChangePasswordModal',
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      confirmDirty: false,
      isLoading: false,
      form: this.$form.createForm(this, {name: 'changePW'})
    };
  },
  watch: {
    visible() {
      this.form.resetFields();
    }
  },
  methods: {
    handleConfirmBlur(e) {
      const value = e.target.value;
      this.confirmDirty = this.confirmDirty || !!value;
    },
    handleCancel() {
      this.$emit('close');
    },
    handleOk() {
      this.form.validateFields((err, values) => {
        if (!err) {
          const loginParams = {...values};
          delete loginParams.repassword;
          const _this = this;
          this.isLoading = true;
          changePassword(values)
            .then(function () {
              _this.$message.success('修改成功');
              _this.form.resetFields();
              _this.$emit('close');
            })
            .catch(function (err) {
              _this.$message.error(err.response.message);
            })
            .finally(function () {
              _this.isLoading = false;
            });
        }
      });
    },
    validateToNextPassword(rule, value, callback) {
      const regex = /^[a-zA-Z0-9]{6,20}$/;
      if (!regex.test(value)) {
        const text = '请输入6-20位字母和数字组成的密码!';
        callback(text);
      } else {
        const form = this.form;
        if (value && this.confirmDirty) {
          form.validateFields(['password'], {force: true});
        }
        callback();
      }
    },
    compareToFirstPassword(rule, value, callback) {
      const regex = /^[a-zA-Z0-9]{6,20}$/;
      const form = this.form;
      if (!regex.test(value)) {
        const text = '请输入6-20位字母和数字组成的密码!';
        callback(text);
      } else {
        if (value && value === form.getFieldValue('old_password')) {
          const retext = '新密码和当前密码不能相同!';
          callback(retext);
        } else {
          callback();
        }
      }
    },
    compareToNewPassword(rule, value, callback) {
      const regex = /^[a-zA-Z0-9]{6,20}$/;
      const form = this.form;
      if (!regex.test(value)) {
        const text = '请输入6-20位字母和数字组成的密码!';
        callback(text);
      } else {
        if (value && value !== form.getFieldValue('password')) {
          const retext = '确认密码和新密码必须保持一致!';
          callback(retext);
        } else {
          callback();
        }
      }
    }
  }
};
</script>
