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

        <!-- <a-tab-pane key="tab2" :tab="$t('user.login.gitee-login-credentials')">
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
              :placeholder="$t('user.giteelogin.username.placeholder')"
              v-decorator="[
                'username',
                {
                  rules: [{required: true, message: $t('user.giteeName.required')}, {validator: handleUsernameOrEmail}],
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
        </a-tab-pane> -->
      </a-tabs>

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
          class="gitee-login-button"
          :loading="state.loginBtn"
          :disabled="state.loginBtn"
          >{{ $t('user.login.gitee-login') }}</a-button
        >
      </a-form-item>
    </a-form>
  </div>
</template>

<script>
import {mapActions} from 'vuex';
export default {
  data() {
    return {
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
  created() {},
  methods: {
    ...mapActions(['Login', 'Logout']),
    // handler
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
      // this.form.resetFields()
    },
    handleSubmit(e) {
      e.preventDefault();
      const {
        form: {validateFields},
        state,
        customActiveKey
      } = this;
      const login = this.Login;

      state.loginBtn = true;

      const validateFieldsKey = customActiveKey === 'tab1' ? ['username', 'password'] : ['mobile', 'captcha'];

      validateFields(validateFieldsKey, {force: true}, (err, values) => {
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
      // ?????? 1 ?????????????????????
      setTimeout(() => {
        this.$notification.success({
          message: '??????',
          description: '????????????'
        });
      }, 1000);
      this.isLoginError = false;
    },
    requestFailed(e) {
      this.isLoginError = true;
      this.$notification['error']({
        message: '??????',
        description: e.response.data.msg || '????????????????????????????????????',
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
