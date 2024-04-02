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
              placeholder="请输入主机名称,50个字符以内" disabled>
              <a-tooltip slot="suffix" title="最大长度50个字符，首尾不能为空格，不允许全空格">
                <a-icon type="info-circle" class="icon-class" />
              </a-tooltip>
            </a-input>
          </a-form-item>
          <a-form-item layout="inline" label="所属主机组">
            <a-row type="flex" :gutter="16">
              <a-col flex="5">
                <a-select
                  v-decorator="['host_group_name', {rules: [{required: true, message: '请选择所属主机组'}]}]"
                  placeholder="请选择"
                  :not-found-content="hostGroupIsLoading ? undefined : null">
                  <a-spin v-if="hostGroupIsLoading" slot="notFoundContent" size="small" />
                  <a-select-option
                    v-for="hostGroup in hostGroupList"
                    :key="hostGroup.host_group_name"
                    :value="hostGroup.host_group_name">
                    {{ hostGroup.host_group_name }}
                  </a-select-option>
                </a-select>
              </a-col>
              <a-col flex="1">
                <add-host-group-modal :onSuccess="handleAddHostGroupSuccess">
                  <a-button type="primary" slot="button"> <a-icon type="plus" />添加主机组 </a-button>
                </add-host-group-modal>
              </a-col>
            </a-row>
          </a-form-item>
          <a-form-item label="IP地址">
            <a-input
              v-decorator="[
                'host_ip',
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
          <a-form-item label="SSH登录端口">
            <a-input-number
              :min="0"
              :max="65535"
              v-decorator="[
                'ssh_port',
                {initialValue: 22, rules: [{required: true, message: '请输入 0~65535 内正整数'}]}
              ]"
              placeholder="请输入" />
          </a-form-item>
          <a-form-item label="管理/监控节点">
            <a-radio-group
              name="managementGroup"
              v-decorator="['management', {initialValue: true}]">
              <a-radio :value="true">管理节点</a-radio>
              <a-radio :value="false">监控节点</a-radio>
            </a-radio-group>
          </a-form-item>
          <a-form-item label="主机用户名">
            <a-input
              :maxLength="32"
              v-decorator="[
                'ssh_user',
                {rules: [{required: true, message: '请输入主机用户名'}]}
              ]"
              placeholder="请输入主机用户名">
              <a-tooltip slot="suffix" title="登录主机时使用的用户名">
                <a-icon type="info-circle" class="icon-class" />
              </a-tooltip>
            </a-input>
          </a-form-item>
          <a-form-item label="认证方式">
            <a-radio-group name="identificationGroup" v-model="identificaWay" :default-value="1" @change="onChange">
              <a-radio :value="1">
                主机登录密码
              </a-radio>
              <a-radio :value="2">
                主机登录密钥
              </a-radio>
            </a-radio-group>
          </a-form-item>
          <a-form-item>
            <template v-slot:label>
              <span v-if="identificaWay === 1">主机登录密码</span>
              <span v-else>
                <span>主机登录密钥</span>
                <description-tips style="margin-left: 3px;margin-right: 1px;">
                  id_rsa
                </description-tips>
              </span>
            </template>
            <a-input-password v-if="identificaWay === 1"
                              v-decorator="['password',{rules: [{required: true, message: '请输入主机登录密码'}]}]"
                              placeholder="请设置主机登录密码"></a-input-password>
            <a-textarea :rows="4" v-else
                        :maxLength="4096"
                        v-decorator="['ssh_pkey',{rules: [{required:true, message: '请输入主机登录密钥'}]}]"
                        placeholder="请设置主机登录密钥"></a-textarea>
          </a-form-item>
          <a-form-item :wrapper-col="{span: 10, offset: 13}">
            <a-button @click="handleCancel">取消</a-button>
            <a-button
              htmlType="submit"
              type="primary"
              :loading="submitLoading"
              style="margin-left: 8px">添加</a-button>
          </a-form-item>
        </a-form>
      </a-card>
    </div>
  </page-header-wrapper>
</template>

<script>
import router from '@/vendor/ant-design-pro/router';
import {i18nRender} from '@/vendor/ant-design-pro/locales';

import {PageHeaderWrapper} from '@ant-design-vue/pro-layout';
import AddHostGroupModal from '@/views/assests/components/AddHostGroupModal';
import DescriptionTips from '@/components/DescriptionTips';

import {hostGroupList, addHost} from '@/api/assest';
import {updateHost} from '@/api/hostManagement'
export default {
  components: {
    PageHeaderWrapper,
    AddHostGroupModal,
    DescriptionTips
  },
  data() {
    return {
      hostInfo: this.$route.params.hostInfo,
      hostGroupList: [],
      hostGroupIsLoading: false,
      form: this.$form.createForm(this),
      submitLoading: false,
      identificaWay: 1 // 认证方式,
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
  },
  methods: {
    onChange(e) {
      this.identificaWay = e.target.value
    },
    // 获取主机组列表数据
    getHostGroupList() {
      const _this = this
      this.hostGroupIsLoading = true
      hostGroupList({
        tableInfo: {
          pagination: {},
          filters: {},
          sorter: {}
        }
      })
        .then(function (res) {
          _this.hostGroupList = res.data.host_group_infos
        })
        .catch(function (err) {
          _this.$message.error(err.message);
        })
        .finally(function () {
          _this.hostGroupIsLoading = false
        });
    },
    updateHost(params) {
      const _this = this
      _this.submitLoading = true
      updateHost(params)
        .then(function (res) {
          if (res.code === 200) {
            _this.$message.success('纳管成功')
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
    },
    handleAddHost(e) {
      const _this = this
      e.preventDefault()
      this.form.validateFields((err, values) => {
        if (!err) {
          this.submitLoading = true
          addHost(values)
            .then(function (res) {
              if (res.code === '200') {
                const params = {
                  host_name: values.host_name,
                  hostId: _this.hostInfo.host_id,
                  host_mac: _this.hostInfo.host_mac,
                  bmc_ip: _this.hostInfo.bmc_ip,
                  bmc_user_name: _this.hostInfo.bmc_user_name,
                  bmc_user_passwd: _this.hostInfo.bmc_passwd,
                  status: 2
                }
                _this.updateHost(params)
              } else {
                _this.$message.error(res.message)
              }
            })
            .catch(function (err) {
              _this.$message.error(err.response.message || err.message);
            })
            .finally(function () {
              _this.submitLoading = false
            })
        }
      });
    },
    handleAddHostGroupSuccess() {
      // 添加完成后，刷新主机组列表
      this.getHostGroupList();
    },
    handleCancel() {
      this.form.resetFields();
      router.go(-1);
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
        host_ip: this.hostInfo.host_ip
      });
    }
  },
  mounted: function () {
    this.getHostGroupList();
    this.getHostInfo()
  }
};
</script>
<style lang="less" scoped>
.icon-class {
  color: rgba(0, 0, 0, .45);
}
</style>
