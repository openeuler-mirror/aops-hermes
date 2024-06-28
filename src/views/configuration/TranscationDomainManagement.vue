<!-- eslint-disable vue/max-attributes-per-line -->
<template>
  <page-header-wrapper :breadcrumb="breadcrumb">
    <a-card :bordered="false" class="aops-theme">
      <div>
        <a-row class="aops-app-table-control-row" type="flex" justify="space-between">
          <a-col>
            <h3 class="card-title">业务域列表</h3>
            <span>共有业务域{{ domainData.length }}个</span>
          </a-col>
          <a-col>
            <a-row type="flex" :gutter="70">
              <a-col>
                <add-transcation-domain-modal :onSuccess="handleAddSuccess"/>
              </a-col>
              <a-col>
                <a-button @click="getDomainList"> <a-icon type="redo" />刷新 </a-button>
              </a-col>
            </a-row>
          </a-col>
        </a-row>
      </div>
      <div>
        <a-table
          :rowKey="rowKey"
          :columns="columns"
          :data-source="domainData"
          :loading="domainLoading"
          :pagination="false">
          <span slot="action" slot-scope="domain">
            <router-link :to="`${domain.domainName || ''}`">
              业务域详情
            </router-link>
            <span> | </span>
            <router-link :to="`/configuration/transcation-domain-configurations/${domain.domainName}`">
              查看域内配置
            </router-link>
            <span> | </span>
            <a @click="showAddHostDrawer(domain.domainName)">添加主机</a>
            <span> | </span>
            <a @click="delDomain(domain.domainName)">删除</a>
          </span>
        </a-table>
      </div>
    </a-card>
    <drawer-view title="添加主机" ref="addHostDrawer" :bodyStyle="{paddingBottom: '80px'}">
      <template slot="drawerView">
        <add-host-drawer :domainName="domainName"></add-host-drawer>
      </template>
    </drawer-view>
  </page-header-wrapper>
</template>

<script>
import {PageHeaderWrapper} from '@ant-design-vue/pro-layout';
import {i18nRender} from '@/vendor/ant-design-pro/locales';

import DrawerView from '@/views/utils/DrawerView';
import AddHostDrawer from './components/AddHostDrawer';
import AddTranscationDomainModal from './components/AddTranscationDomainModal';

import {domainList, deleteDomain} from '@/api/configuration';

export default {
  name: 'TranscationDomainManagement',
  components: {
    PageHeaderWrapper,
    DrawerView,
    AddHostDrawer,
    AddTranscationDomainModal
  },
  data() {
    return {
      domainData: [],
      showNumber: 6,
      domainLoading: false,
      domainName: '',
      rowKey: 'domainName'
    };
  },
  computed: {
    columns() {
      return [
        {
          dataIndex: 'domainName',
          width: '50%',
          key: 'domainName',
          title: '业务域名称'
        },
        {
          key: 'operation',
          width: '50%',
          title: '操作',
          scopedSlots: {customRender: 'action'}
        }
      ];
    },
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
    cardListData() {
      if (this.domainData.length > 0) {
        return [{}].concat(this.domainData).slice(0, this.showNumber);
      } else {
        return [{}];
      }
    }
  },
  methods: {
    getDomainList() {
      const _this = this;
      this.domainLoading = true;
      domainList()
        .then(function (res) {
          // 特殊处理
          _this.domainData = res.data || [];
        })
        .catch(function (err) {
          if (err.response.code === '400') return;
          _this.$message.error(err.response.message);
        })
        .finally(function () {
          _this.domainLoading = false;
        });
    },
    showAddHostDrawer(domainName) {
      this.$refs.addHostDrawer.open(domainName);
    },
    handleAddSuccess() {
      // 添加完成后，清空table设置，刷新列表
      this.getDomainList();
    },
    showMore() {
      this.showNumber += 6;
    },
    delDomain(domainName) {
      const _this = this;
      this.$confirm({
        title: (
          <div>
            <p>您确定要删除这个业务域吗？</p>
          </div>
        ),
        content: <span>删除后业务域无法恢复</span>,
        icon: () => <a-icon type="exclamation-circle" />,
        okType: 'danger',
        okText: '删除',
        onOk: function () {
          return _this.handleDelDomain(domainName);
        },
        onCancel() {}
      });
    },
    handleDelDomain(domainName) {
      const _this = this;
      return new Promise((resolve, reject) => {
        deleteDomain({
          domainName: domainName
        })
          .then((res) => {
            _this.$message.success(res.message);
            _this.getDomainList();
            resolve();
          })
          .catch((err) => {
            _this.$message.error(err.response.message || err.message);
            reject(err);
          });
      });
    }
  },
  created: function () {
    this.getDomainList();
  }
};
</script>

<style lang="less" scoped>
.card-title {
  display: inline-block;
  margin-right: 10px;
}
.aops-card {
  &-content {
    padding: 12px;
    height: 100px;
  }
  &-bottom {
    padding: 12px;
    border-top: 1px solid #e8e8e8;
    font-size: 12px;
  }
}
</style>
