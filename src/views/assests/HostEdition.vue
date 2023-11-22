<template>
  <page-header-wrapper :breadcrumb="breadcrumb">
    <div>
      <a-card :bordered="false" class="aops-theme">
        <a-form @submit="handleAddHost" :form="form" :label-col="{span: 5}" :wrapper-col="{span: 10}">
          <a-form-item label="主机名称">
            <a-input
              :maxLength="50"
              v-decorator="[
                'host_name',
                {
                  rules: [
                    {required: true, message: '请输入主机名称'},
                    {validator: checkNameInput, validateTrigger: 'blur'}
                  ]
                }
              ]"
              placeholder="请输入主机名称,50个字符以内"
            >
              <a-tooltip slot="suffix" title="最大长度50个字符，首尾不能为空格，不允许全空格">
                <a-icon type="info-circle" style="color: rgba(0, 0, 0, 0.45)" />
              </a-tooltip>
            </a-input>
          </a-form-item>
          <a-form-item layout="inline" label="所属主机组">
            <a-row type="flex" :gutter="16">
              <a-col flex="5">
                <a-select
                  v-decorator="['host_group_name', {rules: [{required: true, message: '请选择所属主机组'}]}]"
                  placeholder="请选择"
                  :not-found-content="hostGroupIsLoading ? undefined : null"
                >
                  <a-spin v-if="hostGroupIsLoading" slot="notFoundContent" size="small" />
                  <a-select-option
                    v-for="hostGroup in hostGroupList"
                    :key="hostGroup.host_group_name"
                    :value="hostGroup.host_group_name"
                  >
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
              :disabled="pageType === 'edit'"
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
              placeholder="请输入有效ip地址，e.g. 192.168.0.1"
            />
          </a-form-item>
          <a-form-item label="SSH登录端口">
            <a-input-number
              :min="0"
              :max="65535"
              @change="handlePortChange"
              v-decorator="[
                'ssh_port',
                {initialValue: 22, rules: [{required: true, message: '请输入 0~65535 内正整数'}]}
              ]"
              placeholder="请输入"
            />
          </a-form-item>
          <a-form-item label="管理/监控节点">
            <a-radio-group name="managementGroup" v-decorator="['management', {initialValue: true}]">
              <a-radio :value="true">管理节点</a-radio>
              <a-radio :value="false">监控节点</a-radio>
            </a-radio-group>
          </a-form-item>
          <a-form-item label="主机用户名">
            <a-input
              @change="handleUserChange"
              :maxLength="32"
              v-decorator="['ssh_user', {rules: [{required: true, message: '请输入主机用户名'}]}]"
              placeholder="请输入主机用户名"
            >
              <a-tooltip slot="suffix" title="登录主机时使用的用户名">
                <a-icon type="info-circle" style="color: rgba(0, 0, 0, 0.45)" />
              </a-tooltip>
            </a-input>
          </a-form-item>
          <a-form-item label="认证方式">
            <a-radio-group name="identificationGroup" v-model="identificaWay" :default-value="1" @change="onChange">
              <a-radio :value="1"> 主机登录密码 </a-radio>
              <a-radio :value="2"> 主机登录密钥 </a-radio>
            </a-radio-group>
          </a-form-item>
          <a-form-item>
            <template v-slot:label>
              <span v-if="identificaWay === 1">主机登录密码</span>
              <span v-else>
                <span>主机登录密钥</span>
                <description-tips style="margin-left: 3px; margin-right: 1px"> id_rsa </description-tips>
              </span>
            </template>
            <a-input-password
              v-if="identificaWay === 1"
              v-decorator="[
                'password',
                {rules: [{required: pageType === 'create' ? true : requiredRules, message: '请输入主机登录密码'}]}
              ]"
              :placeholder="
                pageType === 'create' ? '请设置主机登录密码' : '请输入主机登录密码, 若未修改主机用户名或端口可以为空'
              "
            ></a-input-password>
            <a-textarea
              :rows="4"
              v-else
              :maxLength="4096"
              v-decorator="[
                'ssh_pkey',
                {rules: [{required: pageType === 'create' ? true : requiredRules, message: '请输入主机登录密钥'}]}
              ]"
              :placeholder="
                pageType === 'create' ? '请设置主机登录密钥' : '请输入主机登录密钥, 若未修改主机用户名或端口可以为空'
              "
            ></a-textarea>
          </a-form-item>
          <a-form-item :wrapper-col="{span: 10, offset: 5}">
            <a-button @click="handleCancel">取消</a-button>
            <a-button
              v-if="pageType === 'create'"
              htmlType="submit"
              type="primary"
              :loading="submitLoading"
              style="margin-left: 8px"
              >添加</a-button
            >
            <a-button
              v-if="pageType === 'edit'"
              htmlType="submit"
              type="primary"
              :loading="submitLoading"
              style="margin-left: 8px"
              >修改</a-button
            >
          </a-form-item>
        </a-form>
      </a-card>
    </div>
  </page-header-wrapper>
</template>

<script>
// 创建和编辑共用一个组件
import store from '@/store';
import {mapState} from 'vuex';
import router from '@/vendor/ant-design-pro/router';
import {i18nRender} from '@/vendor/ant-design-pro/locales';

import {PageHeaderWrapper} from '@ant-design-vue/pro-layout';
import AddHostGroupModal from './components/AddHostGroupModal';

import {hostGroupList, addHost, getHostDetail, editHost} from '@/api/assest';
import DescriptionTips from '@/components/DescriptionTips';

export default {
  components: {
    PageHeaderWrapper,
    AddHostGroupModal,
    DescriptionTips
  },
  data() {
    return {
      hostId: '',
      basicHostInfo: undefined,
      pageType: 'edit',
      hostGroupList: [],
      hostGroupIsLoading: false,
      form: this.$form.createForm(this),
      submitLoading: false,
      PortRequired: false,
      UserRequired: false,
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
              return <span>{route.breadcrumbName}</span>;
            } else {
              return <router-link to={route.path}>{route.breadcrumbName}</router-link>;
            }
          }
        }
      };
    },
    requiredRules() {
      // 当前为修改页面，只要端口号或主机用户名有一个改变时，密码为必须项
      return this.UserRequired || this.PortRequired;
    },
    ...mapState({
      hostInfo: (state) => state.host.hostInfo
    })
  },
  created() {
    // 判断是新建页面还是编辑页面
    if (this.$route.query.pageType === 'edit') {
      this.pageType = 'edit';
      if (!this.hostInfo.host_id) {
        // router.go(-1);
      }
      this.hostId = this.$route.query.hostId;
    } else {
      this.pageType = 'create';
    }
  },
  methods: {
    onChange(e) {
      this.identificaWay = e.target.value;
    },
    handleUserChange(value) {
      if (this.pageType === 'edit') {
        value.target.value === this.basicHostInfo.ssh_user ? (this.UserRequired = false) : (this.UserRequired = true);
      }
    },
    handlePortChange(value) {
      if (this.pageType === 'edit') {
        value === this.basicHostInfo.ssh_port ? (this.PortRequired = false) : (this.PortRequired = true);
      }
    },
    // 获取主机组列表数据
    getHostGroupList() {
      const _this = this;
      this.hostGroupIsLoading = true;
      hostGroupList({
        tableInfo: {
          pagination: {},
          filters: {},
          sorter: {}
        }
      })
        .then(function (res) {
          _this.hostGroupList = res.data.host_group_infos;
        })
        .catch(function (err) {
          _this.$message.error(err.response.msg);
        })
        .finally(function () {
          _this.hostGroupIsLoading = false;
        });
    },
    handleAddHost(e) {
      var _this = this;
      e.preventDefault();
      this.form.validateFields((err, values) => {
        if (!err) {
          this.submitLoading = true;
          if (this.pageType === 'edit') {
            delete values.host_ip;
            const tableParams = JSON.parse(JSON.stringify(values));
            for (const key in tableParams) {
              if (tableParams[key] === this.basicHostInfo[key]) {
                delete tableParams[key]; //  删除未修改数据
              }
              if (key === 'password' || key === 'ssh_pkey') {
                if (tableParams[key].length === 0) {
                  delete tableParams[key]; //  password或密钥为空不传
                }
              }
            }
            if (JSON.stringify(tableParams) === '{}') {
              this.$message.info('未存在修改数据!');
              this.submitLoading = false;
            } else {
              editHost(tableParams, this.hostId)
                .then(function (res) {
                  _this.$message.success(res.message);
                  store.dispatch('resetHostInfo');
                  router.push('/assests/hosts-management');
                })
                .catch(function (err) {
                  _this.$message.error(err.response.message);
                })
                .finally(function () {
                  _this.submitLoading = false;
                });
            }
          } else {
            addHost(values)
              .then(function (res) {
                _this.$message.success(res.message);
                store.dispatch('resetHostInfo');
                router.push('/assests/hosts-management');
              })
              .catch(function (err) {
                _this.$message.error(err.response.message);
              })
              .finally(function () {
                _this.submitLoading = false;
              });
          }
        }
      });
    },
    handleAddHostGroupSuccess() {
      // 添加完成后，刷新主机组列表
      this.getHostGroupList();
    },
    handleCancel() {
      store.dispatch('resetHostInfo');
      router.go(-1);
    },
    checkNameInput(rule, value, cb) {
      if (!/^\S(.*\S)?$/.test(value)) {
        /* eslint-disable */
        cb('首尾不允许空格');
        /* eslint-enable */
        return;
      }
      if (!/^(?!\s*$).+/.test(value)) {
        /* eslint-disable */
        cb('不允许全空格');
        /* eslint-enable */
        return;
      }
      cb();
    },
    checkHostUserName(rule, value, cb) {
      if (/[^0-9a-zA-Z_\-~`!?.;(){}[\]@#$^*+|=]/.test(value)) {
        /* eslint-disable */
        cb('用户名为数字、英文字母或特殊字符组成，不能包含空格和以下特殊字符：:<>&,\'"\\/%。');
        /* eslint-enable */
        return;
      }
      if (/[<>\\]/.test(value)) {
        /* eslint-disable */
        cb('用户名为数字、英文字母或特殊字符组成，不能包含空格和以下特殊字符：:<>&,\'"\\/%。');
        /* eslint-enable */
        return;
      }
      if (/^[#+-]/.test(value)) {
        /* eslint-disable */
        cb('首字符不能是“#”、“+”或“-”');
        /* eslint-enable */
        return;
      }
      cb();
    },
    passwordCheck(rule, value, cb) {
      if (/[^0-9a-zA-Z_~`!?.:;\-'"(){}[\]/<>@#$%^&*+|\\=]/.test(value)) {
        /* eslint-disable */
        cb('只允许大小写字母、数字和特殊字符，不能有空格和逗号');
        /* eslint-enable */
        return;
      }
      if (value && (value.length < 8 || value.length > 20)) {
        /* eslint-disable */
        cb('长度应为8-20字符');
        /* eslint-enable */
        return;
      }
      if (!/[_~`!?.:;\-'"(){}[\]/<>@#$%^&*+|\\=]/.test(value)) {
        /* eslint-disable */
        cb('请至少应包含一个特殊字符');
        /* eslint-enable */
        return;
      }
      let count = 0;
      if (/[a-z]/.test(value)) count += 1;
      if (/[A-Z]/.test(value)) count += 1;
      if (/[0-9]/.test(value)) count += 1;
      if (count < 2) {
        /* eslint-disable */
        cb('至少包含大写字母、小写字母、数字中的两种');
        /* eslint-enable */
        return;
      }
      cb();
    },
    getHostInfo() {
      const _this = this;
      getHostDetail(this.hostId, true)
        .then(function (res) {
          _this.basicHostInfo = res.data.host_infos[0];
          _this.form.setFieldsValue({
            host_name: _this.basicHostInfo.host_name,
            host_group_name: _this.basicHostInfo.host_group_name,
            host_ip: _this.basicHostInfo.host_ip,
            ssh_port: _this.basicHostInfo.ssh_port,
            ssh_user: _this.basicHostInfo.ssh_user,
            management: _this.basicHostInfo.management
          });
        })
        .catch(function (err) {
          _this.$message.error(err.response.message);
        })
        .finally(() => {
          _this.basicHostInfoIsLoading = false;
        });
    }
  },
  mounted: function () {
    this.getHostGroupList();
    if (this.pageType === 'edit') {
      this.getHostInfo();
    }
  }
};
</script>
