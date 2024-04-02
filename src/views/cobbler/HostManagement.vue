<template>
  <my-page-header-wrapper>
    <a-card :bordered="false" class="aops-theme">
      <div>
        <div>共获取到{{ totalCount }}条主机信息</div>
        <a-row class="aops-app-table-control-row" type="flex" justify="space-between">
          <a-col>
            <a-row type="flex" :gutter="16">
              <a-col v-if="selectedRowKeys.length > 0">
                <a-alert type="info" show-icon>
                  <div slot="message">
                    <span>{{ `已选择` + selectedRowKeys.length + `项` }}</span>
                    <a
                      v-if="selectedRowKeys.length > 0"
                      @click="deleteHostBash(selectedRowKeys, selectedRowsAll)">
                      批量删除
                    </a>
                  </div>
                </a-alert>
              </a-col>
              <a-col>
                <a-button @click="handleReset">重置条件</a-button>
              </a-col>
            </a-row>
          </a-col>
          <a-col>
            <a-row type="flex" :gutter="16">
              <a-col>
                <install-host :onSuccess="handleInstallHostSuccess" :hostList="hostList">
                  <a-button type="primary" slot="button" :disabled="isDisabled">一键装机 </a-button>
                </install-host>
              </a-col>
              <a-col>
                <router-link :to="{path: `host-management/host-create`}">
                  <a-button type="primary"> <a-icon type="plus" />添加主机 </a-button>
                </router-link>
              </a-col>
              <a-col>
                <add-batch-host @addSuccess="handleUploadSuccess" />
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
          :pagination="pagination"
          :row-selection="rowSelection"
          @change="handleTableChange"
          :loading="tableIsLoading"
          :locale="{emptyText: getEmpty}">
          <span slot="statusItem" slot-scope="status">{{ hostStatusMap[status] }}</span>
          <span slot="action" slot-scope="record">
            <router-link :to="{name:'CobblerEditHost', params: { pageType: 'edit',hostInfo: record }}"
                         :disabled="record.status!==0 && record.status!==4">编辑</router-link>
            <span> | </span>
            <router-link :to="{name:'HostInfoManage', params: { hostInfo: record }}"
                         :disabled="record.status!==1">纳管</router-link>
            <span> | </span>
            <a @click="deleteHost(record)">删除</a>
            <span> | </span>
            <span style="color: #cccccc" v-if="record.status===0">日志下载</span>
            <a @click="downloadLogFile(record)" v-if="record.status!==0">日志下载</a>
          </span>
        </a-table>
      </div>
    </a-card>
  </my-page-header-wrapper>
</template>

<script>
import addBatchHost from './AddBatchHost.vue';
import MyPageHeaderWrapper from '@/views/utils/MyPageHeaderWrapper';
import {getSelectedRow} from '@/views/utils/getSelectedRow';
import InstallHost from './InstallHost'
import {queryHosts, deleteHost, downLoadLogFile} from '@/api/hostManagement'
import {downloadBlobFile} from '@/views/utils/downloadBlobFile';

const hostStatusMap = {
  '0': '裸机',
  '1': '已安装',
  '2': '已纳管',
  '3': '装机中',
  '4': '安装失败'
};

const defaultPagination = {
  current: 1,
  pageSize: 10,
  showTotal: (total) => `总计 ${total} 项`,
  showSizeChanger: true,
  showQuickJumper: true
};

export default {
  name: 'HostManagement',
  components: {
    MyPageHeaderWrapper,
    addBatchHost,
    InstallHost
  },
  data() {
    return {
      hostStatusMap,
      rowKey: 'host_id',
      pagination: defaultPagination,
      filters: null,
      sorter: null,
      tableData: [],
      selectedRowKeys: [],
      selectedRowsAll: [],
      tableIsLoading: false,
      hostList: [],
      totalCount: 0,
      isDisabled: true
    };
  },
  computed: {
    columns() {
      return [
        {
          dataIndex: 'host_name',
          width: '15%',
          key: 'host_name',
          title: '主机名称',
          scopedSlots: {customRender: 'hostName'}
        },
        {
          dataIndex: 'host_mac',
          width: '15%',
          key: 'host_mac',
          title: 'Mac地址',
          scopedSlots: {customRender: 'host_mac'}
        },
        {
          dataIndex: 'bmc_ip',
          width: '15%',
          key: 'bmc_ip',
          title: 'bmc管理IP'
        },
        {
          dataIndex: 'bmc_user_name',
          width: '15%',
          key: 'bmc_user_name',
          title: 'bmc用户名',
          scopedSlots: {customRender: 'bmc_user_name'}
        },
        {
          dataIndex: 'host_ip',
          width: '15%',
          key: 'host_ip',
          title: 'IP地址'
        },
        {
          dataIndex: 'status',
          width: '10%',
          key: 'status',
          title: '状态',
          scopedSlots: {customRender: 'statusItem'}
        },
        {
          key: 'operation',
          width: '15%',
          title: '操作',
          scopedSlots: {customRender: 'action'},
          align: 'center'
        }
      ];
    },
    rowSelection() {
      return {
        selectedRowKeys: this.selectedRowKeys,
        onChange: this.onSelectChange
      };
    }
  },
  methods: {
    handleTableChange(pagination, filters, sorter) {
      // 存储翻页状态
      this.pagination = pagination;
      this.filters = filters;
      this.sorter = sorter;
      // 出发排序、筛选、分页时，重新请求主机列表
      this.getHostList();
    },
    handleUploadSuccess() {
      this.getHostList();
    },
    onSelectChange(selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys;
      this.selectedRowsAll = getSelectedRow(selectedRowKeys, this.selectedRowsAll, this.tableData, 'host_id');
      const statusList = []
      const hostArr = []
      for (const val of this.selectedRowsAll) {
        if (val.status === 0 || val.status === 4) {
          statusList.push(val.status)
        }
        const bmcObj = {
          'bmc_ip': val.bmc_ip
        }
        hostArr.push(bmcObj)
      }
      this.hostList = hostArr
      this.isDisabled = !(statusList.length > 0 && statusList.length === hostArr.length);
    },
    // 获取列表数据
    getHostList() {
      const _this = this;
      this.tableIsLoading = true;
      const pagination = this.pagination || {};
      queryHosts({
        current: pagination.current,
        pageSize: pagination.pageSize
      })
        .then(function (res) {
          _this.tableData = res.data.host_infos || [];
          _this.totalCount = res.data.total_count
          _this.pagination = {
            ..._this.pagination,
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: res.data.total_count || (res.data.total_count === 0 ? 0 : pagination.total)
          };
        })
        .catch(function (err) {
          _this.$message.error(err.response.message || err.message);
        })
        .finally(function () {
          _this.tableIsLoading = false;
        });
    },
    deleteHost(record) {
      const _this = this;
      this.$confirm({
        title: (
          <div>
            <p>删除后无法恢复</p>
            <p>请确认删除以下主机:</p>
          </div>
        ),
        content: <span>{record.host_name}</span>,
        icon: () => <a-icon type="exclamation-circle" />,
        okType: 'danger',
        okText: '删除',
        onOk: function () {
          return _this.handleDelete([record.host_id], true);
        },
        onCancel() {}
      });
    },
    deleteHostBash(selectedRowKeys, selectedRowsAll) {
      const _this = this;
      this.$confirm({
        title: (
          <div>
            <p>删除后无法恢复</p>
            <p>请确认删除以下主机:</p>
          </div>
        ),
        content: () =>
          selectedRowsAll.map((row) => (
            <p>
              <span>{row.host_name}</span>
            </p>
          )),
        icon: () => <a-icon type="exclamation-circle" />,
        okType: 'danger',
        okText: '删除',
        onOk: function () {
          return _this.handleDelete(selectedRowKeys, true);
        },
        onCancel() {}
      });
    },
    handleDelete(hostList, isBash) {
      const _this = this;
      return new Promise((resolve, reject) => {
        deleteHost(hostList)
          .then((res) => {
            if (res.code === 200) {
              _this.$message.success(res.msg);
              _this.pagination.current = 1
              // 删除主机后重置当前分页为第一页
              _this.handleRefresh()
              // 重新请求主机列表
              if (isBash) {
                _this.selectedRowKeys = [];
                _this.selectedRowsAll = [];
              }
            } else {
              _this.$message.error(res.msg)
            }
            resolve();
          })
          .catch((err) => {
            _this.$message.error(err.response.message || err.message);
            // 业务逻辑，报错时依然关闭弹窗。因此触发resolve()
            resolve();
          });
      });
    },
    downloadLogFile(record) {
      const _this = this;
      const param = {
        log_file_name: record.host_name + '-' + record.host_id
      }
      downLoadLogFile(param)
        .then(function (res) {
            if (res.data === undefined) {
              if (record.status === 3) {
                _this.$message.error('系统安装日志还未生成，请稍等！');
              } else {
                _this.$message.error('系统安装失败，安装日志未生成，可能是以下原因导致，请排查：' +
                  ' 1，Mac地址填写有误；' +
                  ' 2，网卡未启用PXE；' +
                  ' 3，无可使用的IP资源；');
              }
            } else {
              _this.$message.info('安装日志文件下载中，请稍等!');
              downloadBlobFile(res.data, res.fileName);
            }
        })
        .catch(function (err) {
          _this.$message.error(err.message);
        })
        .finally(function () {
        });
    },
    handleReset() {
      this.pagination = defaultPagination;
      this.sorter = null;
      this.filters = null;
      this.selectedRowKeys = [];
      this.selectedRowsAll = []
      this.isDisabled = true
      this.getHostList()
    },
    handleRefresh() {
      this.selectedRowsAll = []
      this.selectedRowKeys = []
      this.isDisabled = true
      this.getHostList()
    },
    getEmpty() {
      return (
        <div class="aops-app-table-empty">
          <a-empty description="暂无主机数据" image={require('@/assets/empty.svg')} />
        </div>
      );
    },
    handleInstallHostSuccess() {
      this.handleReset()
    }
  },
  mounted: function () {
    this.getHostList();
  }
};
</script>

<style lang="less" scoped>
.ant-lert {
  line-height: 14px;
}
</style>
