<template>
  <page-header-wrapper :breadcrumb="breadcrumb">
    <div>
      <a-card :bordered="false" class="aops-theme">
        <a-form
          @submit="handleAddKsFile"
          :form="form"
          :label-col="{span: 5}"
          :wrapper-col="{span: 18}">
          <a-form-item label="kickstart文件名称">
            <div>
            <a-input
              :disabled="pageType === 'edit'"
              :maxLength="50"
              v-decorator="[
                'ksName',
                {rules: [{ required: true, message: '请输入ks文件名称'}, {validator: checkNameInput, validateTrigger: 'blur'}]},
              ]"
              placeholder="请输入ks文件名称">
              <a-tooltip slot="suffix" title="ks文件名称只能由字母、数字、下划线和中划线组成">
                <a-icon type="info-circle" style="color: rgba(0,0,0,.45)" />
              </a-tooltip>
            </a-input>
            </div>
          </a-form-item>
          <a-form-item layout="inline" label="kickstart文件内容">
            <a-row type="flex" :gutter="16">
              <a-col flex="5">
                <a-textarea v-decorator="['ksContent', {rules: [{required: true, message: '请输入ks文件内容'}]}]"
                            placeholder="请输入kickstart文件内容" :rows="16"/>
              </a-col>
            </a-row>
            <div v-if="pageType === 'create'" style="color: #f5222d;margin: 0;padding: 0;">
              以上为kickstart文件内容样例模板，请根据实际情况进行修改！kickstart文件内容的准确性直接影响操作系统是否安装成功，请确保kickstart文件内容无误。
            </div>
            <div v-if="pageType === 'edit'" style="color: #f5222d;margin: 0;padding: 0;">
              kickstart文件内容的准确性直接影响操作系统是否安装成功，请确保kickstart文件内容无误。
            </div>
          </a-form-item>
          <a-form-item :wrapper-col="{span: 5, offset: 21}" style="margin: 0px">
            <a-button @click="handleCancel">取消</a-button>
            <a-button
              v-if="pageType === 'create'"
              htmlType="submit"
              type="primary"
              :loading="submitLoading"
              style="margin-left: 8px">添加</a-button>
            <a-button
              v-if="pageType === 'edit'"
              htmlType="submit"
              type="primary"
              :loading="submitLoading"
              style="margin-left: 8px">修改</a-button>
          </a-form-item>
        </a-form>
      </a-card>
    </div>
  </page-header-wrapper>
</template>

<script>
// 创建和编辑共用一个组件
import router from '@/vendor/ant-design-pro/router';
import {i18nRender} from '@/vendor/ant-design-pro/locales';

import {PageHeaderWrapper} from '@ant-design-vue/pro-layout';
import {addKickstart, updateKickstart} from '@/api/ksManagement';
export default {
  components: {
    PageHeaderWrapper
  },
  data() {
    return {
      pageType: 'edit',
      form: this.$form.createForm(this),
      submitLoading: false
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
    }
  },
  created() {
    // 判断是新建页面还是编辑页面
    if (this.$route.params.pageType === 'edit') {
      this.pageType = 'edit';
    } else {
      this.pageType = 'create';
    }
  },
  methods: {
    handleAddKsFile(e) {
      const _this = this
      e.preventDefault();
      this.form.validateFields((err, values) => {
        if (!err) {
          this.submitLoading = true;
          if (this.pageType === 'edit') {
            const tableParams = JSON.parse(JSON.stringify(values));
            if (JSON.stringify(tableParams) === '{}') {
              this.$message.info('未存在修改数据!')
              this.submitLoading = false;
            } else {
              updateKickstart(tableParams)
                .then(function (res) {
                  if (res.code === 200) {
                    _this.$message.success(res.msg);
                    router.push('/cobbler/kickstart-management');
                  } else {
                    _this.$message.error(res.msg);
                  }
                })
                .catch(function (err) {
                  _this.$message.error(err.response.message || err.message);
                })
                .finally(function () {
                  _this.submitLoading = false;
                });
            }
          } else {
            addKickstart(values)
              .then(function (res) {
                if (res.code === 200) {
                  _this.$message.success(res.msg);
                  router.push('/cobbler/kickstart-management');
                } else {
                  _this.$message.error(res.msg);
                }
              })
              .catch(function (err) {
                _this.$message.error(err.response.message || err.message);
              })
              .finally(function () {
                _this.submitLoading = false;
              });
          }
        }
      });
    },
    handleCancel() {
      this.form.resetFields();
      router.go(-1);
    },
    checkNameInput(rule, value, cb) {
      if (!/^[A-Za-z0-9_-]+$/.test(value)) {
        cb(new Error('ks文件名称只能由字母、数字、下划线和中划线组成'))
        return
      }
      cb();
    },
    getKsInfo() {
      let newKsName = ''
      const ksName = this.$route.params.ksInfo.ks_name
      if (ksName.endsWith('.ks')) {
        newKsName = ksName.substring(0, ksName.indexOf('.ks'))
      }
      this.form.setFieldsValue({
        ksName: newKsName,
        ksContent: this.$route.params.ksInfo.ks_content
      })
    }
  },
  mounted: function () {
    if (this.pageType === 'edit') {
      this.getKsInfo()
    } else if (this.pageType === 'create') {
      const content = '# text installing, do not remove\n' +
        'text\n' +
        '\n' +
        '# specify the installation of system resources from the nfs path\n' +
        '# nfs --server=192.168.100.100 --dir=/install\n' +
        '\n' +
        '# specify the installation of system resources from ftp,http and https, for example:\n' +
        '# url --url=http://192.168.100.100/centos6.6\n' +
        '\n' +
        '# set system language\n' +
        'lang en_US.UTF-8\n' +
        'keyboard us\n' +
        '\n' +
        '# set network connection\n' +
        'network --bootproto=dhcp --netmask=255.255.255.0 --gateway=192.168.100.254 --nameserver=8.8.8.8 --device=eno4 --ipv6=auto --onboot=yes --activate\n' +
        'network --hostname=openEuler2203-sp1\n' +
        '\n' +
        '# set root password\n' +
        'rootpw --iscrypted $y$j9T$dQZPNxR22Nbl5C6gZb8MPIBS$AowKalzXd48e1.eJnSwXRp8kZ9Luy.SoJr9PPuHkuH3\n' +
        '\n' +
        'firewall --disabled # disable the firewall, which is enabled by default\n' +
        'selinux --disabled  # disable selinux, which is enabled by default\n' +
        'timezone Asia/Shanghai # set time zone\n' +
        'reboot # restart the system after installing\n' +
        '\n' +
        '# set disk partitions. The following are automatic partitions, which can be customized according to actual needs\n' +
        'clearpart --all\n' +
        'autopart\n' +
        '\n' +
        '# declare packages that need to be installed\n' +
        '%packages\n' +
        '@^minimal-environment\n' +
        'ipmitool*\n' +
        '%end\n' +
        '\n' +
        '# the pre installation scripts, which can be executed before installing the system \n' +
        '%pre\n' +
        '\n' +
        '%end\n' +
        '\n' +
        '# scripts that can be executed after the system install successfully\n' +
        '%post     \n' +
        'echo "Hello openEuler!" >> /opt/hello.txt\n' +
        '%end';
      this.form.setFieldsValue({
        ksContent: content
      })
    }
  }
};
</script>
