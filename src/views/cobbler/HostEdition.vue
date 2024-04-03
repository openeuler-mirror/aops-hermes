<template>
  <page-header-wrapper :breadcrumb="breadcrumb">
    <div>
      <a-card :bordered="false" class="aops-theme">
        <a-form
          @submit="handleAddHost"
          :form="form"
          :label-col="{span: 5}"
          :wrapper-col="{span: 10}">
          <a-form-item label="主机名称">
            <a-input
              :maxLength="50"
              v-decorator="[
                'host_name',
                {rules: [{ required: true, message: '请输入主机名称'}, {validator: checkNameInput, validateTrigger: 'blur'}]},
              ]"
              placeholder="请输入主机名称,50个字符以内">
              <a-tooltip slot="suffix" title="最大长度50个字符，首尾不能为空格，不允许全空格">
                <a-icon type="info-circle" class="icon-class" />
              </a-tooltip>
            </a-input>
          </a-form-item>
          <a-form-item label="Mac地址">
            <a-input
              v-decorator="[
                'host_mac',
                {
                  rules: [
                    {
                      required: true,
                      pattern: /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/,
                      message: '请输入有效Mac地址，e.g. 18:56:44:21:db:ef'
                    }
                  ]
                }
              ]"
              placeholder="请输入有效Mac地址，e.g. 18:56:44:21:db:ef" />
          </a-form-item>
          <a-form-item label="bmc管理IP">
            <a-input
              v-decorator="[
                'bmc_ip',
                {
                  rules: [
                    {
                      required: true,
                      pattern: /^((2[0-4]\d|25[0-5]|[01]?\d\d?)\.){3}(2[0-4]\d|25[0-5]|[01]?\d\d?)$/,
                      message: '请输入IP地址在 0.0.0.0~255.255.255.255 区间内'
                    }
                  ]
                }
              ]"
              placeholder="请输入有效ip地址，e.g. 192.168.0.1" />
          </a-form-item>
          <a-form-item label="bmc登录用户名">
            <a-input
              :maxLength="32"
              v-decorator="[
                'bmc_user_name',
                {rules: [{required: true, message: '请输入bmc用户名'}]}
              ]"
              placeholder="请输入bmc用户名">
              <a-tooltip slot="suffix" title="登录bmc时使用的用户名">
                <a-icon type="info-circle" class="icon-class" />
              </a-tooltip>
            </a-input>
          </a-form-item>
          <a-form-item label="bmc登录密码">
            <a-input-password
              v-decorator="[
                'bmc_user_passwd',
                {rules: [{required: pageType === 'create', message: '请输入bmc登录密码，且长度不超过128位'}]}
              ]"
              placeholder="请输入bmc登录密码，且长度不超过128位">
            </a-input-password>
          </a-form-item>
          <a-form-item :wrapper-col="{span: 10, offset: 13}">
            <a-button @click="handleCancel">取消</a-button>
            <a-button
              v-if="pageType === 'create'"
              htmlType="submit"
              type="primary"
              :loading="submitLoading"
              class="btn-class">添加</a-button>
            <a-button
              v-if="pageType === 'edit'"
              htmlType="submit"
              type="primary"
              :loading="submitLoading"
              class="btn-class">修改</a-button>
          </a-form-item>
        </a-form>
      </a-card>
    </div>
  </page-header-wrapper>
</template>

<script>
// 创建和编辑共用一个组件
import router from '@/vendor/ant-design-pro/router'
import {i18nRender} from '@/vendor/ant-design-pro/locales'
import {PageHeaderWrapper} from '@ant-design-vue/pro-layout'
import {addHost, updateHost} from '@/api/hostManagement'
export default {
  components: {
    PageHeaderWrapper
  },
  data() {
    return {
      basicHostInfo: undefined,
      pageType: 'edit',
      form: this.$form.createForm(this),
      submitLoading: false,
      hostInfo: undefined
    };
  },
  computed: {
    // 自定义面包屑内容
    breadcrumb() {
      const routes = this.$route.meta.diyBreadcrumb.map((route) => {
        return {
          path: route.path,
          breadcrumbName: i18nRender(route.breadcrumbName)
        };
      });
      return {
        props: {
          routes,
          itemRender: ({route, params, routes, paths, h}) => {
            if (routes.indexOf(route) === routes.length - 1) {
              return <span>{route.breadcrumbName}</span>
            } else {
              return <router-link to={route.path}>{route.breadcrumbName}</router-link>
            }
          }
        }
      };
    }
  },
  created() {
    // 判断是新建页面还是编辑页面
    if (this.$route.params.pageType === 'edit') {
      this.pageType = 'edit'
    } else {
      this.pageType = 'create'
    }
  },
  methods: {
    handleAddHost(e) {
      const _this = this;
      e.preventDefault();
      this.form.validateFields((err, values) => {
        if (!err) {
          if (values.bmc_user_passwd != null && values.bmc_user_passwd.length > 128) {
            this.$message.error('bmc登录密码长度不能超过128位')
            return
          }
          this.submitLoading = true;
          if (this.pageType === 'edit') {
            const tableParams = JSON.parse(JSON.stringify(values));
            if (JSON.stringify(tableParams) === '{}') {
              this.$message.info('未存在修改数据!')
              this.submitLoading = false;
            } else {
              tableParams.hostId = this.hostInfo.host_id
              tableParams.status = this.hostInfo.status
              if (!tableParams.bmc_user_passwd) {
                tableParams.bmc_user_passwd = this.hostInfo.bmc_passwd
              }
              updateHost(tableParams)
                .then(function (res) {
                  if (res.code === 200) {
                    _this.$message.success(res.msg)
                    router.push('/cobbler/host-management')
                  } else {
                    _this.$message.error(res.msg)
                  }
                })
                .catch(function (err) {
                  _this.$message.error(err.response.message || err.message)
                })
                .finally(function () {
                  _this.submitLoading = false
                });
            }
          } else {
            addHost(values)
              .then(function (res) {
                if (res.code === 200) {
                  _this.$message.success(res.msg)
                  router.push('/cobbler/host-management')
                } else {
                  _this.$message.error(res.msg)
                }
              })
              .catch(function (err) {
                _this.$message.error(err.response.message || err.message)
              })
              .finally(function () {
                _this.submitLoading = false
              });
          }
        }
      });
    },
    handleCancel() {
      this.form.resetFields()
      router.go(-1)
    },
    checkNameInput(rule, value, cb) {
      if (!/^\S(.*\S)?$/.test(value)) {
        cb(new Error('首尾不允许空格'))
        return
      }
      if (!/^(?!\s*$).+/.test(value)) {
        cb(new Error('不允许全空格'))
        return
      }
      cb()
    },
    getHostInfo() {
      this.form.setFieldsValue({
        host_name: this.hostInfo.host_name,
        host_mac: this.hostInfo.host_mac,
        bmc_ip: this.hostInfo.bmc_ip,
        bmc_user_name: this.hostInfo.bmc_user_name
      });
    }
  },
  mounted: function () {
    if (this.pageType === 'edit') {
      this.hostInfo = this.$route.params.hostInfo
      this.getHostInfo()
    }
  }
};
</script>
<style lang="less" scoped>
.icon-class {
  color: rgba(0, 0, 0, .45);
}

.btn-class {
  margin-left: 8px;
}
</style>
