<!-- eslint-disable max-len -->
<template>
  <div class="main">
    <a-form id="formRegister" class="user-layout-login" ref="formRegister" :form="form" @submit="handleSubmit">
      <a-alert
        v-if="isLoginError"
        type="error"
        showIcon
        style="margin-bottom: 24px;"
        message="注册失败"
      />
      <a-form-item>
        <a-input
          size="large"
          type="text"
          placeholder="用户名5-20位,包含字母和数字"
          v-decorator="[
            'username',
            {
              rules: [{required: true, message: $t('user.userName.required')}, {validator: handleUsername}],
              validateTrigger: 'blur'
            }
          ]"
        >
          <a-icon slot="prefix" type="user" :style="{color: 'rgba(0,0,0,.25)'}" />
        </a-input>
      </a-form-item>

      <a-form-item>
        <a-input-password
          size="large"
          placeholder="密码长度6-20位,包含字母和数字"
          v-decorator="[
            'password',
            {
              rules: [{required: true, message: $t('user.password.required')}, {validator: validateToNextPassword}],
              validateTrigger: 'blur'
            }
          ]"
        >
          <a-icon slot="prefix" type="lock" :style="{color: 'rgba(0,0,0,.25)'}" />
        </a-input-password>
      </a-form-item>

      <a-form-item>
        <a-input-password
          size="large"
          placeholder="确认前后两次输入的密码保持一致"
          v-decorator="[
            'confirm',
            {
              rules: [{required: true, message: $t('user.password.required')}, {validator: compareToFirstPassword}],
              validateTrigger: 'blur'
            }
          ]"
          @blur="handleConfirmBlur"
        >
          <a-icon slot="prefix" type="lock" :style="{color: 'rgba(0,0,0,.25)'}" />
        </a-input-password>
      </a-form-item>

      <a-form-item>
        <a-input
          size="large"
          type="text"
          placeholder="输入邮箱地址,由英文字母、数字、下划线、英文句号、以及中划线组成"
          v-decorator="[
            'email',
            {
              rules: [{required: true, message: $t('user.email.required')}, {validator: handleEmail}],
              validateTrigger: 'blur'
            }
          ]"
        >
          <a-icon slot="prefix" type="mail" :style="{color: 'rgba(0,0,0,.25)'}" />
        </a-input>
      </a-form-item>

      <a-form-item style="margin-top:24px">
        <a-button
          size="large"
          htmlType="submit"
          class="login-button"
          :loading="state.loginBtn"
          :disabled="state.loginBtn"
          >{{ $t('user.register.register') }}</a-button
        >
      </a-form-item>
      <a-form-item style="margin-top:24px">
        <div class="jump_login">
          <span>已有账号? </span>
          <span class="spin_top_jump" @click="goLogin">返回登录</span>
        </div>
      </a-form-item>
    </a-form>
  </div>
</template>

<script>
import {mapActions} from 'vuex';
import {register} from '@/api/login';
export default {
  data() {
    return {
      confirmDirty: false,
      loginBtn: false,
      isLoginError: false,
      form: this.$form.createForm(this),
      state: {
        time: 60,
        loginBtn: false,
        smsSendBtn: false
      }
    };
  },
  created() {
  },
  methods: {
    ...mapActions(['Login', 'Logout']),
    goLogin() {
      this.$router.push('/user/login')
    },
    handleConfirmBlur(e) {
      const value = e.target.value;
      this.confirmDirty = this.confirmDirty || !!value;
    },
    validateToNextPassword(rule, value, callback) {
      const regex = /^[a-zA-Z0-9]{6,20}$/;
      if (!regex.test(value)) {
        const text = '请输入6-20位字母和数字组成的密码!';
        callback(text);
      } else {
        const form = this.form;
        if (value && this.confirmDirty) {
          form.validateFields(['confirm'], { force: true });
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
        if (value && value !== form.getFieldValue('password')) {
          const retext = '两次输入的密码不一致';
          callback(retext);
        } else {
          callback();
        }
      }
    },
    handleUsername(rule, value, callback) {
      const regex = /^[a-zA-Z0-9]{5,20}$/;
      if (!regex.test(value)) {
        const text = '请输入5-20位字母或数字的用户名!';
        callback(text);
      } else {
        callback();
      }
    },
    handleEmail(rule, value, callback) {
      const regex = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(.[a-zA-Z0-9_-]+)+$/;
      if (!regex.test(value)) {
        const text = '只允许英文字母、数字、@、下划线、以及中划线组成!';
        callback(text);
      } else {
        callback();
      }
    },
    handleSubmit(e) {
      this.isLoginError = false;
      e.preventDefault();
      const {
        form: {validateFields},
        state
      } = this;

      state.loginBtn = true;
        // 注册
        validateFields({force: true}, (err, values) => {
          if (!err) {
            const loginParams = {...values};
            delete loginParams.username;
            loginParams.username = values.username;
            loginParams.password = values.password;
            loginParams.email = values.email;
            register(loginParams)
              .then(res => {
                this.form.resetFields();
                this.$message.success('注册成功!');
                setTimeout(() => {
                  this.$router.push('/user/login');
                }, 1000)
              })
              .catch(err => {
                if (err.response.code === '1102') {
                  // 绑定重复账号，给予提示
                  this.$message.error('注册账号已存在!')
                } else {
                  this.requestFailed(err);
                }
              })
              .finally(() => {
                state.loginBtn = false;
              });
          } else {
            setTimeout(() => {
              state.loginBtn = false;
            }, 600);
          }
        });
    },
    requestFailed(e) {
      this.isLoginError = true;
      this.$notification['error']({
        message: '错误',
        description: e.response.data.msg || '请求出现错误，请稍后再试',
        duration: 4
      });
    }
  }
};
</script>

<style lang="less" scoped>
.main {
  .user-layout-login {
  label {
    font-size: 14px;
  }

  .jump_login {
    text-align: right;
    margin-top: -20px;
    .spin_top_jump {
      color:#005980;
      cursor:pointer;
    }
  }

  .register-button {
    padding: 0 15px;
    font-size: 16px;
    height: 40px;
    width: 100%;
    background: #0d9e6e;
    border-color: #0d9e6e;
    color: #fff;
  }

  .getCaptcha {
    display: block;
    width: 100%;
    height: 40px;
  }

  .forge-password {
    font-size: 14px;
  }

  button.login-button {
    padding: 0 15px;
    font-size: 16px;
    height: 40px;
    width: 100%;
  }

  .user-login-other {
    text-align: left;
    margin-top: 24px;
    line-height: 22px;

    .item-icon {
      font-size: 24px;
      color: rgba(0, 0, 0, 0.2);
      margin-left: 16px;
      vertical-align: middle;
      cursor: pointer;
      transition: color 0.3s;

      &:hover {
        color: #1890ff;
      }
    }

    .register {
      float: right;
    }
  }

  .login-button {
    background: #002fa7;
    border-color: #002fa7;
    color: #fff;
  }

  /deep/ .ant-input {
    border: 0 !important;
    border-bottom: 1px solid #ccc !important;
  }

  /deep/ .ant-tabs-ink-bar {
    background: #002fa7;
  }

  /deep/ .ant-tabs-nav .ant-tabs-tab-active {
    color: #002fa7;
  }
  }
}
</style>
