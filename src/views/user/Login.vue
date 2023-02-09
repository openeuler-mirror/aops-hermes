<!-- eslint-disable max-len -->
<template>
  <div class="main">
    <a-form id="formLogin" class="user-layout-login" ref="formLogin" :form="form" @submit="handleSubmit">
      <a-tabs
        :activeKey="customActiveKey"
        :tabBarStyle="{textAlign: 'center', borderBottom: 'unset'}"
        @change="handleTabClick"
      >
        <a-tab-pane key="tab1" :tab="$t('user.login.tab-login-credentials')">
          <a-alert
            v-if="isLoginError"
            type="error"
            showIcon
            style="margin-bottom: 24px;"
            :message="$t('user.login.message-invalid-credentials')"
          />
          <a-form-item>
            <a-input
              size="large"
              type="text"
              :placeholder="$t('user.login.username.placeholder')"
              v-decorator="[
                'username',
                {
                  rules: [{required: true, message: $t('user.userName.required')}, {validator: handleUsernameOrEmail}],
                  validateTrigger: 'change'
                }
              ]"
            >
              <a-icon slot="prefix" type="user" :style="{color: 'rgba(0,0,0,.25)'}" />
            </a-input>
          </a-form-item>

          <a-form-item>
            <a-input-password
              size="large"
              :placeholder="$t('user.login.password.placeholder')"
              v-decorator="[
                'password',
                {rules: [{required: true, message: $t('user.password.required')}], validateTrigger: 'blur'}
              ]"
            >
              <a-icon slot="prefix" type="lock" :style="{color: 'rgba(0,0,0,.25)'}" />
            </a-input-password>
          </a-form-item>
        </a-tab-pane>
        <a-tab-pane key="tab2" :tab="$t('user.login.signup')">
          <a-alert
            v-if="isLoginError"
            type="error"
            showIcon
            style="margin-bottom: 24px;"
            :message="$t('user.register.message-invalid-credentials')"
          />
          <a-form-item>
            <a-input
              size="large"
              type="text"
              :placeholder="$t('user.register.username.placeholder')"
              v-decorator="[
                'username',
                {
                  rules: [{required: true, message: $t('user.userName.required')}, {validator: handleUsernameOrEmail}],
                  validateTrigger: 'change'
                }
              ]"
            >
              <a-icon slot="prefix" type="user" :style="{color: 'rgba(0,0,0,.25)'}" />
            </a-input>
          </a-form-item>

          <a-form-item>
            <a-input-password
              size="large"
              :placeholder="$t('user.register.password.placeholder')"
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
              :placeholder="$t('user.register.repassword.placeholder')"
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
        </a-tab-pane>
      </a-tabs>
      <a-form-item v-if="customActiveKey === 'tab1'">
        <div class="login_gitee" style="text-align:center;">
          <div @click="jumpInGitee" style="cursor:pointer">
            <img src="https://gitee.com/static/images/logo-black.svg?t=158106666" alt="">
            <span class="login_gitee_text">使用gitee账号登陆</span>
          </div>
        </div>
      </a-form-item>
      <a-form-item style="margin-top:24px">
        <a-button
          v-if="customActiveKey === 'tab1'"
          size="large"
          type="primary"
          htmlType="submit"
          class="login-button"
          :loading="state.loginBtn"
          :disabled="state.loginBtn"
          >{{ $t('user.login.login') }}</a-button
        >
        <a-button
          v-if="customActiveKey === 'tab2'"
          size="large"
          htmlType="submit"
          class="register-button"
          :loading="state.loginBtn"
          :disabled="state.loginBtn"
          >{{ $t('user.register.register') }}</a-button
        >
      </a-form-item>
    </a-form>
  </div>
</template>

<script>
import {mapActions} from 'vuex';
import {register, LoginInGitee} from '@/api/login';
export default {
  data() {
    return {
      confirmDirty: false,
      customActiveKey: 'tab1',
      loginBtn: false,
      loginType: 0,
      isLoginError: false,
      stepCaptchaVisible: false,
      form: this.$form.createForm(this),
      state: {
        time: 60,
        loginBtn: false,
        loginType: 0,
        smsSendBtn: false
      }
    };
  },
  created() {
    // 判断是否切换到注册页
    if (this.$route.params.key === 'createAccount') {
      this.customActiveKey = 'tab2'
    }
  },
  methods: {
    ...mapActions(['Login', 'Logout']),
    handleConfirmBlur(e) {
      const value = e.target.value;
      this.confirmDirty = this.confirmDirty || !!value;
    },
    jumpInGitee() {
      const _this = this;
      LoginInGitee()
        .then(function(res) {
          if (res.code === 200) {
            if (res.gitee !== '' && res.gitee !== null && res.gitee !== undefined) {
              window.location.href = res.gitee
            }
          } else {
            _this.$message.error('请求错误');
          }
        })
        .catch(function(err) {
          _this.$message.error(err.response.data.msg);
        })
        .finally(function() {
        });
    },
    validateToNextPassword(rule, value, callback) {
      const regex = /^[a-zA-Z0-9]{6,20}$/;
      if (!regex.test(value)) {
        const text = '6-20位字母或数字组成的密码!';
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
        const text = '6-20位字母或数字组成的密码!';
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
    handleUsernameOrEmail(rule, value, callback) {
      const {state} = this;
      const regex = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((\.[a-zA-Z0-9_-]{2,3}){1,2})$/;
      if (regex.test(value)) {
        state.loginType = 0;
      } else {
        state.loginType = 1;
      }
      callback();
    },
    handleTabClick(key) {
      this.customActiveKey = key;
      this.isLoginError = false;
      this.form.resetFields()
    },
    handleSubmit(e) {
      this.isLoginError = false;
      e.preventDefault();
      const {
        form: {validateFields},
        state
      } = this;
      const login = this.Login;

      state.loginBtn = true;
      if (this.customActiveKey === 'tab1') {
        // 登陆
        validateFields({force: true}, (err, values) => {
          if (!err) {
            const loginParams = {...values};
            delete loginParams.username;
            loginParams[!state.loginType ? 'email' : 'username'] = values.username;
            loginParams.password = values.password;
            login(loginParams)
              .then(res => this.loginSuccess(res))
              .catch(err => this.requestFailed(err))
              .finally(() => {
                state.loginBtn = false;
              });
          } else {
            setTimeout(() => {
              state.loginBtn = false;
            }, 600);
          }
        });
      } else {
        // 注册
        validateFields({force: true}, (err, values) => {
          if (!err) {
            const loginParams = {...values};
            delete loginParams.username;
            loginParams.username = values.username;
            loginParams.password = values.password;
            register(loginParams)
              .then(res => {
                this.$message.success('注册成功!')
              })
              .catch(err => {
                if (err.response.data.code === 1102) {
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
      }
    },
    stepCaptchaSuccess() {
      this.loginSuccess();
    },
    stepCaptchaCancel() {
      const logout = this.Logout;
      logout().then(() => {
        this.loginBtn = false;
        this.stepCaptchaVisible = false;
      });
    },
    loginSuccess(res) {
      this.$router.push({path: '/'});
      // 延迟 1 秒显示欢迎信息
      setTimeout(() => {
        this.$notification.success({
          message: '欢迎',
          description: '欢迎回来'
        });
      }, 1000);
      this.isLoginError = false;
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
.user-layout-login {
  label {
    font-size: 14px;
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

  .login_gitee{
    img {
      width: 62px;
    }
    .login_gitee_text {
      color: #323232;
      font-size: 16px;
      padding-left: 10px;
      line-height: 40px;
    }
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

  .gitee-login-button {
    padding: 0 15px;
    font-size: 16px;
    height: 40px;
    width: 100%;
    background: #66ffcc;
    border-color: #66ffcc;
    color: #fff;
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
</style>
