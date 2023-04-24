<!-- eslint-disable max-len -->
<template>
  <div class="main">
    <a-form id="formLogin" class="user-layout-login" ref="formLogin" :form="form" @submit="handleSubmit">
      <a-form-item>
        <a-input
          size="large"
          type="text"
          :placeholder="$t('user.login.username.placeholder')"
          v-decorator="[
            'username',
            {
              rules: [{required: true, message: $t('user.userName.required')}],
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
          :placeholder="$t('user.login.password.placeholder')"
          v-decorator="[
            'password',
            {
              rules: [{required: true, message: $t('user.password.required')}],
              validateTrigger: 'blur'
            }
          ]"
          autocomplete
        >
          <a-icon slot="prefix" type="lock" :style="{color: 'rgba(0,0,0,.25)'}" />
        </a-input-password>
      </a-form-item>

      <a-form-item>
        <div class="login_gitee" style="text-align:center;">
          <div @click="jumpInGitee" style="cursor:pointer">
            <img src="https://gitee.com/static/images/logo-black.svg?t=158106666" alt="">
            <span class="login_gitee_text">使用gitee账号登录</span>
          </div>
        </div>
      </a-form-item>
      <a-form-item style="margin-top:24px">
        <a-button
          size="large"
          type="primary"
          htmlType="submit"
          class="login-button"
          :loading="state.loginBtn"
          :disabled="state.loginBtn"
          >{{ $t('user.login.login') }}</a-button
        >
      </a-form-item>
      <a-form-item style="margin-top:24px">
        <div class="jump_registar">
          <span>没有账号? </span>
          <span class="spin_top_jump" @click="goRegister">立即注册</span>
        </div>
      </a-form-item>
    </a-form>
  </div>
</template>

<script>
import {mapActions} from 'vuex';
import {LoginInGitee} from '@/api/login';
export default {
  data() {
    return {
      loginBtn: false,
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
    goRegister() {
      this.$router.push('/user/register');
    },
    jumpInGitee() {
      const _this = this;
      LoginInGitee()
        .then(function(res) {
          if (res.code === '200') {
            if (res.data.gitee !== '' && res.data.gitee !== null && res.data.gitee !== undefined) {
              window.location.href = res.data.gitee
            }
          } else {
            _this.$message.error('请求错误');
          }
        })
        .catch(function(err) {
          _this.$message.error(err.response.message);
        })
        .finally(function() {
        });
    },
    handleSubmit(e) {
      e.preventDefault();
      const {
        form: {validateFields},
        state
      } = this;
      const login = this.Login;

      state.loginBtn = true;
        // 登录
        validateFields({force: true}, (err, values) => {
          if (!err) {
            const loginParams = {...values};
            loginParams.username = values.username;
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
    loginSuccess(res) {
      this.$router.push({path: '/'});
      // 延迟 1 秒显示欢迎信息
      setTimeout(() => {
        this.$notification.success({
          message: '欢迎',
          description: '欢迎回来'
        });
      }, 1000);
    },
    requestFailed(e) {
      this.$notification['error']({
        message: '错误',
        description: e.response.message || '请求出现错误，请稍后再试',
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

  .jump_registar {
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
