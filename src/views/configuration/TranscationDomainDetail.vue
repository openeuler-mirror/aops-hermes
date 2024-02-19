<template>
  <my-page-header-wrapper>
    <a-card :bordered="false" class="aops-theme">
      <div>
        <h2 class="card-title">业务域{{ domainName }}</h2>
      </div>
      <div>
        <div>共获取到{{ tableData.length }}条主机信息</div>
        <a-row class="aops-table-control-row" type="flex" justify="space-between">
          <a-col>
            <a-alert type="info" show-icon>
              <div slot="message">
                <span>{{ `已选择` + selectedRowKeys.length + `项` }}</span>
                <a v-if="selectedRowKeys.length > 0" @click="deleteHostBash(selectedRowKeys, selectedRows)">批量删除</a>
              </div>
            </a-alert>
          </a-col>
          <a-col>
            <a-row type="flex" :gutter="16">
              <a-col>
                <a-button type="primary" @click="showAddHostDrawer"> <a-icon type="plus" />添加主机 </a-button>
              </a-col>
              <a-col>
                <a-button @click="syncConf(selectedRowKeys, selectedRows)" :disabled="!selectedRowKeys.length > 0">
                  <a-icon type="sync" />批量同步
                </a-button>
              </a-col>
              <a-col>
                <a-button @click="handleRefresh"> <a-icon type="redo" />刷新 </a-button>
              </a-col>
            </a-row>
          </a-col>
        </a-row>
        <a-table
          :rowKey="rowKey"
          :columns="columns"
          :data-source="tableData"
          :row-selection="rowSelection"
          :loading="tableIsLoading"
          :pagination="false">
          <span slot="action" slot-scope="record">
            <a @click="showQueryRealConfsDrawer(record)">当前配置</a>
            <a-divider type="vertical" />
            <a @click="showDomainStatusDrawer(record)">状态详情</a>
            <a-divider type="vertical" />
            <a-popconfirm
              title="您确定要从当前业务域中删除这台主机吗?"
              ok-text="确认"
              cancel-text="取消"
              @confirm="deleteDomainHost(record)">
                <a>删除</a>
            </a-popconfirm>
          </span>
        </a-table>
      </div>
    </a-card>
    <!--添加主机抽屉-->
    <drawer-view title="添加主机" ref="addHostDrawer" :bodyStyle="{paddingBottom: '80px'}">
      <template slot="drawerView">
        <add-host-drawer @addHostSuccess="addHostSuccess"></add-host-drawer>
      </template>
    </drawer-view>
    <!--主机当前配置抽屉-->
    <drawer-view ref="queryRealConfsDrawer" :bodyStyle="{paddingBottom: '80px'}">
      <template slot="drawerView">
        <query-real-confs-drawer :confsOfDomain="confsOfDomain" :confsOfDomainLoading="confsOfDomainLoading" />
      </template>
    </drawer-view>
    <!--状态详情抽屉-->
    <drawer-view
      title="状态详情"
      ref="domainStatusDrawer"
      :hasButtonOnBottom="false"
      :bodyStyle="{paddingBottom: '80px'}">
      <template slot="drawerView">
        <get-domain-status-drawer
          :domainStatusIsLoading="domainStatusIsLoading"
          :domainName="domainName"/>
      </template>
    </drawer-view>
  </my-page-header-wrapper>
</template>

<script>
import MyPageHeaderWrapper from '@/views/utils/MyPageHeaderWrapper';

import {deleteHost, queryHostAndStatus, batchSyncConf} from '@/api/configuration';
import {getManagementConf} from '@/api/management';

import DrawerView from '@/views/utils/DrawerView';
import QueryRealConfsDrawer from '@/views/configuration/components/QueryRealConfsDrawer';
import QueryExpectConfsDrawer from '@/views/configuration/components/QueryExpectConfsDrawer';
import GetDomainStatusDrawer from '@/views/configuration/components/GetDomainStatusDrawer';
import AddHostDrawer from '@/views/configuration/components/AddHostDrawer';

import defaultSettings from '@/config/defaultSettings';

const STATUS_TITLE_ENUM = {};
STATUS_TITLE_ENUM[0] = '未同步';
STATUS_TITLE_ENUM[1] = '已同步';
STATUS_TITLE_ENUM[2] = '未知状态';

export default {
  name: 'TranscationDomainDetail',
  components: {
    MyPageHeaderWrapper,
    DrawerView,
    QueryRealConfsDrawer,
    QueryExpectConfsDrawer,
    GetDomainStatusDrawer,
    AddHostDrawer
  },
  data() {
    return {
      rowKey: 'host_id',
      hostList: [],
      selectedRowKeys: [],
      selectedRows: [],
      tableIsLoading: false,
      domainName: this.$route.params.domainName,
      domainStatusIsLoading: false,
      confsOfDomain: [],
      confsOfDomainLoading: false,
      setTimeoutKey_statusInterval: undefined
    };
  },
  computed: {
    columns() {
      return [
        {
          dataIndex: 'host_ip',
          key: 'host_ip',
          title: 'IP地址'
        },
        {
          dataIndex: 'ipv4',
          key: 'ipv4',
          title: 'IP协议'
        },
        {
          dataIndex: 'sync_status',
          key: 'sync_status',
          title: '同步状态'
        },
        {
          key: 'operation',
          title: '操作',
          scopedSlots: {customRender: 'action'}
        }
      ];
    },
    rowSelection() {
      return {
        selectedRowKeys: this.selectedRowKeys,
        onChange: this.onSelectChange
      };
    },
    tableData() {
      return this.hostList.map((host) => {
        host.ipv4 = 'ipv4'
        host.sync_status = STATUS_TITLE_ENUM[host.sync_status]
        return host;
      });
    }
  },
  methods: {
    onSelectChange(selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys;
      this.selectedRows = selectedRows;
    },
    queryHostAndStatus(domainName) {
      const _this = this;
      _this.tableIsLoading = true;
      queryHostAndStatus(domainName)
        .then(function (res) {
          _this.hostList = res.data || [];
        })
        .catch(function (err) {
          if (err.response.data.code !== 400) {
            _this.$message.error(err.response.message || err.response.data.detail);
          } else {
            _this.hostList = [];
          }
        })
        .finally(function () {
          _this.tableIsLoading = false;
        });
    },
    handleRefresh() {
      this.selectedRowKeys = [];
      this.getHostAndStatus();
    },
    deleteDomainHost(record) {
      this.handleDelete([record]);
    },
    deleteHostBash(selectedRowKeys, selectedRows) {
      const _this = this;
      this.$confirm({
        title: (
          <div>
            <p>删除后无法恢复</p>
            <p>请确认删除以下主机:</p>
          </div>
        ),
        content: () =>
          selectedRows.map((row) => (
            <p>
              <span>{row.host_ip}</span>
            </p>
          )),
        icon: () => <a-icon type="exclamation-circle" />,
        okType: 'danger',
        okText: '删除',
        onOk: function () {
          return _this.handleDelete(selectedRows);
        },
        onCancel() {}
      });
    },
    handleDelete(hostInfos) {
      const _this = this;
      return new Promise((resolve, reject) => {
        hostInfos.map((hostInfo) => {
          hostInfo.hostId = hostInfo.host_id;
          return hostInfo;
        });
        deleteHost({
          domainName: _this.domainName,
          hostInfos: hostInfos
        })
          .then((res) => {
            _this.$message.success(res.msg);
            _this.getHostAndStatus();
            _this.selectedRowKeys = [];
            _this.selectedRows = [];
            resolve();
          })
          .catch((err) => {
            _this.$message.error(err.response.message || err.response.data.detail || err.message);
            reject(err);
          });
      });
    },
    syncConf(selectedRowKeys, selectedRows) {
      const _this = this;
      this.$confirm({
        title: (
          <div>
            <p>您确定要将当前业务域的配置同步到已选主机吗？</p>
          </div>
        ),
        content: <span>同步后将配置无法恢复，但可从配置日志中查看记录,您还要继续吗?</span>,
        icon: () => <a-icon type="exclamation-circle" />,
        okType: 'danger',
        okText: '继续同步',
        onOk: function () {
          return _this.handleSyncConf(selectedRows);
        },
        onCancel() {}
      });
    },
    handleSyncConf(selectedRows) {
      const hostIds = [];
      selectedRows.forEach(function (item) {
        hostIds.push(item.host_id);
      });
      const _this = this;
      return new Promise((resolve, reject) => {
        batchSyncConf(_this.domainName, hostIds)
          .then((res) => {
            let msg = '';
            for (const item of res) {
              const hostId = item.host_id;
              let success = '';
              let fail = '';
              const syncResult = item.syncResult;
              for (const val of syncResult) {
                if (val.result === 'SUCCESS') {
                  success += val.filePath + ';' + '\xa0\xa0';
                } else {
                  fail += val.filePath + ';' + '\xa0\xa0';
                }
              }
              if (success.length === 0 && fail.length !== 0) {
                msg += '主机' + hostId + '\xa0\xa0\xa0' + '同步失败：' + fail;
              } else if (success.length !== 0 && fail.length === 0) {
                msg += '主机' + hostId + '\xa0\xa0\xa0' + '同步成功：' + success;
              } else if (success.length !== 0 && fail.length !== 0) {
                msg += '主机' + hostId + '\xa0\xa0\xa0' + '同步成功：' + success + '\xa0\xa0\xa0' + '同步失败：' + fail;
              }
            }
            if (msg.includes('同步失败') && msg.includes('同步成功')) {
              _this.$message.info(msg);
            } else if (msg.includes('同步失败') && !msg.includes('同步成功')) {
              _this.$message.error(msg);
            } else {
              _this.$message.success(msg);
            }
            _this.getHostAndStatus();
            _this.selectedRowKeys = [];
            _this.selectedRows = [];
            resolve();
          })
          .catch((err) => {
            _this.$message.error(err.response.message || err.response.data.detail || err.response.data.msg);
            reject(err);
          });
      });
    },
    showAddHostDrawer() {
      this.$refs.addHostDrawer.open(this.domainName);
    },
    showQueryRealConfsDrawer(host) {
      host.hostId = host.host_id
      host.ip = host.host_ip
      this.$refs.queryRealConfsDrawer.open({
        host,
        domainName: this.domainName
      });
    },
    showDomainStatusDrawer(record) {
      this.$refs.domainStatusDrawer.open(record);
    },
    getConfsOfDomain(domainName) {
      const _this = this;
      _this.confsOfDomainLoading = true;
      getManagementConf({
        domainName
      })
        .then(function (res) {
          _this.confsOfDomain = res.confFiles || [];
        })
        .catch(function (err) {
          _this.$message.error(err.response.message);
        })
        .finally(function () {
          _this.confsOfDomainLoading = false;
        });
    },
    addHostSuccess() {
      this.handleRefresh();
    },
    getHostAndStatus() {
      const _this = this;
      const domainName = this.domainName;
      _this.tableIsLoading = true;
      queryHostAndStatus(domainName)
        .then(function (res) {
          _this.hostList = res.data || [];
          // 启动循环更新Status
          clearInterval(_this.setTimeoutKey_statusInterval);
          _this.setTimeoutKey_statusInterval = setInterval(function () {
            _this.queryHostAndStatus(domainName);
          }, defaultSettings.domainStatusRefreshInterval);
        })
        .catch(function (err) {
          if (err.response.data.code !== 400) {
            _this.$message.error(err.response.message || err.response.data.detail);
          } else {
            _this.hostList = [];
          }
          // 获取host出错（为空或报错，则清除轮训）
          clearInterval(_this.setTimeoutKey_statusInterval);
        })
        .finally(function () {
          _this.tableIsLoading = false;
        });
    }
  },
  mounted: function () {
    this.getHostAndStatus();
    this.getConfsOfDomain(this.domainName);
  },
  destroyed: function () {
    clearInterval(this.setTimeoutKey_statusInterval);
  }
};
</script>

<style lang="less" scoped>
.card-title {
  display: inline-block;
  margin-right: 10px;
  font-weight: 600;
}
</style>
