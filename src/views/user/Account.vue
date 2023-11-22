<!-- eslint-disable max-len -->
<template>
  <div class="main">
    <div class="container">
      <div class="spin_top">
        <div v-if="loginloading" class="info">gitee授权登录中...</div>
        <div v-else>
          <span>授权成功!{{ countDown }}秒后跳转到首页 |</span>
          <span class="spin_top_jump" @click="excuteLoginsuccess">点击立即跳转</span>
        </div>
      </div>
      <div class="spin_footer">
        <a-spin v-if="loginloading" style="margin: auto">
          <a-icon slot="indicator" type="loading" style="font-size: 40px" spin />
        </a-spin>
        <a-icon v-else type="check-circle" style="color: #52c41a; margin: auto; font-size: 40px" />
      </div>
    </div>
    <a-modal
      title="绑定本地账户"
      :visible="bindvisible"
      :confirm-loading="confirmLoading"
      @ok="handleOk"
      @cancel="handleCancel"
    >
      <div style="display: flex; align-items: center; margin-bottom: 15px">
        <a-icon type="user-add" style="margin-right: 18px; font-size: 19px" />
        <span style="font-size: 15px">当前gitee账号尚未绑定本地账号! 绑定一个本地账号以继续登录</span>
      </div>
      <div style="margin-bottom: 23px; margin-left: 37px">
        <span style="font-size: 14px">没有账号? </span>
        <span style="font-size: 14px; color: #005980; cursor: pointer" @click="goRegistar">点此注册</span>
      </div>
      <a-form :form="form" :label-col="{span: 5}" :wrapper-col="{span: 16}">
        <a-form-item label="本地账号">
          <a-input
            type="text"
            :placeholder="$t('user.login.username.placeholder')"
            v-decorator="[
              'username',
              {
                rules: [{required: true, message: $t('user.userName.required')}],
                validateTrigger: 'blur'
              }
            ]"
          />
        </a-form-item>
        <a-form-item label="密码">
          <a-input-password
            :placeholder="$t('user.login.password.placeholder')"
            v-decorator="[
              'password',
              {
                rules: [{required: true, message: $t('user.password.required')}],
                validateTrigger: 'blur'
              }
            ]"
          >
          </a-input-password>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script>
import {mapActions} from 'vuex';
import {bindAccount, codeCheck} from '@/api/login';
export default {
  data() {
    return {
      code: '',
      auth_account: '',
      loginloading: true,
      confirmLoading: false,
      bindvisible: false,
      // 登陆授权状态
      countDown: 3,
      jumpInterval: null,
      form: this.$form.createForm(this, {name: 'bindLocalAccount'})
    };
  },
  created() {
    this.code = window.location.search.split('=')[1];
    if (this.code === 'access_denied&error_description') {
      // 拒绝授权，跳转登陆页
      this.$message.info('拒绝授权!');
      this.$router.push('/user/login');
    } else {
      // 同意授权，跳转首页
      this.getConnection(this.code);
    }
  },
  methods: {
    ...mapActions(['LoginInGitee']),
    goRegistar() {
      this.bindvisible = false;
      this.form.resetFields();
      this.$router.push('/user/register');
    },
    showModal() {
      this.form.resetFields();
      this.bindvisible = true;
    },
    getConnection(code) {
      const _this = this;
      codeCheck(code)
        .then(function (res) {
          if (res.data.username !== '' && res.data.username !== null && res.data.username !== undefined) {
            _this.auth_account = res.data.username;
          }
          _this.auth_account = res.data.username;
          if (res.code === '200') {
            _this.LoginInGitee(res.data);
            // 授权成功存储用户信息
            _this.$message.success('授权成功!');
            _this.loginloading = false;
            _this.jumpInterval = setInterval(function () {
              _this.countDown = _this.countDown - 1;
              if (_this.countDown === 0) {
                _this.loginSuccess();
                clearTimeout(_this.jumpInterval);
              }
            }, 1000);
            // 倒计时延迟3s后登陆首页
          }
        })
        .catch(function (err) {
          if (
            err.response.data.username !== '' &&
            err.response.data.username !== null &&
            err.response.data.username !== undefined
          ) {
            _this.auth_account = err.response.data.username;
          }
          if (err.response.code === '1200') {
            _this.requestFailed(err.response.message);
            _this.$router.push({path: '/user'});
          } else if (err.response.code === '1603') {
            _this.showModal();
            // 未绑定本地账户，转到绑定账户界面
          }
        })
        .finally(function () {});
    },
    handleOk() {
      this.form.validateFields((err, values) => {
        if (!err) {
          const _this = this;
          this.confirmLoading = true;
          const loginParams = {...values};
          loginParams.auth_account = this.auth_account;
          loginParams.username = values.username;
          loginParams.password = values.password;
          bindAccount(loginParams)
            .then(function (res) {
              _this.LoginInGitee(res.data);
              // 绑定成功存储用户登陆信息
              _this.$message.success('绑定成功!');
              // 提示用户绑定成功
              _this.bindvisible = false;
              _this.loginloading = false;
              // 绑定成功关闭对话框
              _this.jumpInterval = setInterval(function () {
                _this.countDown = _this.countDown - 1;
                if (_this.countDown === 0) {
                  _this.loginSuccess();
                  clearTimeout(_this.jumpInterval);
                }
              }, 1000);
              // 延迟3s后登陆首页
              _this.form.resetFields();
              // 重置表单
            })
            .catch(function (err) {
              if (err.response.code === '1108') {
                // 输入绑定的本地账户不存在，跳转到注册页面
                _this.$message.warning('本地账号不存在!请先注册');
                _this.bindvisible = false;
                setTimeout(() => {
                  _this.$router.push('/user/register');
                }, 1000);
              } else if (err.response.code === '1605') {
                // 输入绑定的本地账户已和其他gitee账户绑定
                _this.$message.error('本地账号已与其他gitee账号绑定!');
              } else if (err.response.code === '1200') {
                // 本地账号密码输入错误
                _this.$message.error('本地账号密码输入错误!');
              } else {
                _this.$message.error(err.response.message);
              }
            })
            .finally(function () {
              _this.confirmLoading = false;
            });
        }
      });
    },
    handleCancel() {
      this.$message.info('取消第三方授权!');
      setTimeout(() => {
        this.$router.push({path: '/user/login'});
      }, 1000);
      this.bindvisible = false;
    },
    excuteLoginsuccess() {
      this.$router.push({path: '/'});
    },
    loginSuccess() {
      this.$router.push({path: '/'});
      // 延迟 1 秒显示欢迎信息
      setTimeout(() => {
        this.$notification.success({
          message: '欢迎',
          description: '欢迎回来'
        });
      }, 1000);
    },
    requestFailed(errMsg) {
      this.$notification['error']({
        message: '错误',
        description: errMsg || '请求出现错误，请稍后再试',
        duration: 4
      });
    }
  }
};
</script>

<style lang="less" scoped>
.main {
  height: 280px;
  display: flex;
  .container {
    margin: 0 auto;
    .spin_top {
      .info {
        font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
        font-size: 17px;
        text-align: center;
      }
      .spin_top_jump {
        color: #1890ff;
        margin-left: 5px;
        cursor: pointer;
      }
    }
    .spin_footer {
      display: flex;
      margin-top: 105px;
    }
  }
}
</style>
