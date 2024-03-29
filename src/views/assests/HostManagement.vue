<template>
  <my-page-header-wrapper extraDesc="对已纳管的主机进行管理。">
    <a-card :bordered="false" class="aops-theme">
      <div class="hostbox">
        <div>共获取到{{ tableData.length }}条主机信息</div>
        <a-row class="aops-app-table-control-row" type="flex" justify="space-between">
          <a-col>
            <a-row type="flex" :gutter="16">
              <a-col v-if="selectedRowKeys.length > 0">
                <a-alert type="info" show-icon>
                  <div slot="message">
                    <span>{{ `已选择` + selectedRowKeys.length + `项` }}</span>
                    <a v-if="selectedRowKeys.length > 0" @click="deleteHostBash(selectedRowKeys, selectedRowsAll)">
                      批量删除
                    </a>
                  </div>
                </a-alert>
              </a-col>
              <a-col>
                <!-- <a-button @click="handleReset">重置条件</a-button> -->
                <a-input-search placeholder="按主机名或IP搜索" style="width: 200px" @search="handleSearch" />
              </a-col>
            </a-row>
          </a-col>
          <a-col>
            <a-row type="flex" :gutter="16">
              <!-----后续功能--------
              <a-col>
                <a-input placeholder="请搜索主机名称" @pressEnter="handleInput"/>
              </a-col>
              ---------------------->
              <a-col>
                <router-link :to="{path: `hosts-management/host-create`}">
                  <a-button type="primary"> <a-icon type="plus" />添加主机 </a-button>
                </router-link>
              </a-col>
              <a-col>
                <add-more-host @addSuccess="handleUploadSuccess" />
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
          :locale="{emptyText: getEmpty}"
        >
          <router-link
            :to="{path: `/assests/host/detail/${record.host_id}`}"
            slot="hostName"
            slot-scope="hostName, record"
            >{{ hostName }}</router-link
          >
          <span slot="isManagement" slot-scope="isMana">{{ isMana ? '是' : '否' }}</span>
          <span slot="statusItem" slot-scope="status">
            <a-spin v-if="!status && status !== 0"></a-spin>
            <span v-else>{{ hostStatusMap[status] }}</span>
          </span>
          <span slot="scene" slot-scope="scene">{{ scene ? (scene === 'normal' ? '通用' : scene) : '暂无' }}</span>
          <span slot="action" slot-scope="record">
            <router-link
              :to="{path: `hosts-management/host-edit`, query: {hostId: record.host_id, pageType: 'edit'}}"
              @click="editHost(record)"
              >编辑
            </router-link>
            <a @click="deleteHost(record)" class="delete-button"> 删除</a>
          </span>
        </a-table>
      </div>
    </a-card>
    <host-detail-drawer :visible="detailVisisble" @close="closeDetail" :hostId="detailId" />
  </my-page-header-wrapper>
</template>

<script>
import {beforeDestory} from 'vue';
import store from '@/store';
import router from '@/vendor/ant-design-pro/router';
import AddMoreHost from './components/addMoreHost.vue';
import MyPageHeaderWrapper from '@/views/utils/MyPageHeaderWrapper';
import {getSelectedRow} from '@/views/utils/getSelectedRow';
import HostDetailDrawer from './components/HostDetailDrawer';
// import HostTerminal from '@/views/assests/components/HostTerminal';
import {hostList, deleteHost, hostGroupList, getHostListWithStatus} from '@/api/assest';

const hostStatusMap = {
  0: '在线',
  1: '离线',
  2: '未确认',
  3: '在线',
  4: '在线',
  5: '未知'
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
    HostDetailDrawer,
    AddMoreHost
    // HostTerminal
  },
  data() {
    return {
      hostStatusMap,
      rowKey: 'host_id',
      pagination: defaultPagination,
      filters: null,
      sorter: null,
      tableData: [],
      groupData: [],
      selectedRowKeys: [],
      selectedRowsAll: [],
      tableIsLoading: false,
      detailId: undefined,
      detailVisisble: false,
      deleteHostTempInfo: {},
      // 主机运行状态心跳定时器
      statusTimer: null
    };
  },
  computed: {
    columns() {
      let {sorter, filters} = this;
      sorter = sorter || {};
      filters = filters || {};
      return [
        {
          dataIndex: 'host_name',
          key: 'host_name',
          title: '主机名称',
          scopedSlots: {customRender: 'hostName'},
          sorter: true,
          sortOrder: sorter.columnKey === 'host_name' && sorter.order
        },
        {
          dataIndex: 'host_ip',
          key: 'host_ip',
          title: 'IP地址'
        },
        {
          dataIndex: 'host_group_name',
          key: 'host_group_name',
          title: '所属主机组',
          filteredValue: filters.host_group_name || null,
          filters: this.groupData.map((group) => {
            return {
              text: group.host_group_name,
              value: group.host_group_name
            };
          })
        },
        {
          dataIndex: 'management',
          key: 'management',
          title: '管理节点',
          filteredValue: filters.management || null,
          filters: [
            {
              text: '是',
              value: 'true'
            },
            {
              text: '否',
              value: 'false'
            }
          ],
          filterMultiple: false,
          scopedSlots: {customRender: 'isManagement'}
        },
        {
          dataIndex: 'status',
          key: 'status',
          title: '运行状态',
          scopedSlots: {customRender: 'statusItem'}
        },
        {
          dataIndex: 'scene',
          key: 'scene',
          title: '场景',
          scopedSlots: {customRender: 'scene'}
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
    }
  },
  methods: {
    async getAllHostStatus() {
      const res = await getHostListWithStatus();
    },
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
    },
    // 获取列表数据
    async getHostList() {
      this.tableIsLoading = true;
      const pagination = this.pagination || {};
      const filters = this.filters || {};
      const sorter = this.sorter || {};

      const hostListRes = await hostList({
        tableInfo: {
          pagination: {
            current: pagination.current,
            pageSize: pagination.pageSize
          },
          filters: filters,
          sorter: {
            field: sorter.field,
            order: sorter.order
          }
        }
      });
      if (hostListRes) {
        this.tableData = hostListRes.data.host_infos || [];
        this.pagination = {
          ...this.pagination,
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: hostListRes.data.total_count || (hostListRes.data.total_count === 0 ? 0 : pagination.total)
        };
        this.tableIsLoading = false;
        await this.hostStatusHeartBeat();
        this.statusTimer = setInterval(async () => {
          await this.hostStatusHeartBeat();
        }, 30 * 1000);
      }
    },
    /**
     * 主机运行状态心跳检测
     */
    async hostStatusHeartBeat() {
      const hostIdList = this.tableData.map((item) => item.host_id);
      const res = await getHostListWithStatus(hostIdList);
      if (res) {
        this.tableData.forEach((item) => {
          this.tableData.forEach((item) => {
            const s = res.data.find((s) => item.host_id === s.host_id);
            if (s) {
              item.status = s.status;
            }
          });
          this.tableData = JSON.parse(JSON.stringify(this.tableData));
        });
      }
    },
    editHost(record) {
      this.$message.success('连接到主机' + record.host_ip);
    },
    deleteHost(record) {
      const _this = this;
      // 保存单独删除时的主机信息，错误提示时需要展示主机名
      this.deleteHostTempInfo = {
        host_id: record.host_id,
        host_name: record.host_name
      };

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
        deleteHost({
          hostList
        })
          .then((res) => {
            if (res.data.fail_list && Object.keys(res.data.fail_list).length > 0) {
              _this.deleteErrorHandler(res);
            } else {
              this.$message.success('删除成功');
            }
            _this.pagination.current = 1;
            // 删除主机后重置当前分页为第一页
            _this.getHostList();
            // 重新请求主机列表
            if (isBash) {
              _this.selectedRowKeys = [];
              _this.selectedRowsAll = [];
            }
            resolve();
          })
          .catch((err) => {
            if (err.data.code === 1103) {
              _this.deleteErrorHandler(err.data, true);
            } else {
              _this.$message.error(err.response.message);
            }
            // 业务逻辑，报错时依然关闭弹窗。因此触发resolve()
            resolve();
          });
      });
    },
    deleteErrorHandler(data, allFailed = false) {
      const deleteErrorList = Object.keys(data.fail_list || {}).map((hostId) => {
        let matchedHost = this.selectedRowsAll.filter((item) => item.host_id === hostId)[0];
        // 正常情况下，未匹配到说明selectedRowsAll和返回的错误主机id不匹配。则说明用户是直接点击表格的删除按钮提交的
        if (!matchedHost) {
          matchedHost = this.deleteHostTempInfo;
        }
        return {
          hostId,
          hostName: matchedHost && matchedHost.host_name,
          errorInfo: data.fail_list && data.fail_list[hostId]
        };
      });
      this.$notification['error']({
        message: `${allFailed ? '删除失败' : '部分主机删除失败'}`,
        description: (
          <div>
            <p>{`${allFailed ? '全部' : ''}${deleteErrorList.length}个主机删除失败：`}</p>
            {deleteErrorList.slice(0, 3).map((errorInfo, idx) => {
              return (
                <p>
                  {`${idx + 1}、`}
                  <span>{`${errorInfo.hostName}: `}</span>
                  <span>{errorInfo.errorInfo}</span>
                </p>
              );
            })}
            {deleteErrorList.length > 3 && <p>更多错误信息请查看返回信息...</p>}
          </div>
        ),
        duration: 5
      });
    },
    handleSearch(text = '') {
      this.pagination = defaultPagination;
      this.sorter = null;
      if (!this.filters) {
        this.filters = {};
      }
      this.selectedRowKeys = [];
      this.filters.searchKey = text !== '' ? text : undefined;
      this.getHostList();
    },
    handleReset() {
      this.pagination = defaultPagination;
      this.sorter = null;
      this.filters = null;
      this.selectedRowKeys = [];
      this.getHostList();
      this.getGroupList();
    },
    handleRefresh() {
      this.selectedRowKeys = [];
      this.getHostList();
      this.getGroupList();
    },
    closeDetail() {
      this.detailVisisble = false;
    },
    openEdit(hostInfo) {
      store.dispatch('setHostInfo', hostInfo);
      router.push('hosts-management/host-edit');
    },
    getGroupList() {
      const _this = this;
      hostGroupList({
        tableInfo: {
          pagination: {},
          filters: {},
          sorter: {}
        }
      })
        .then(function (res) {
          _this.groupData = res.data.host_group_infos;
        })
        .catch(function (err) {
          _this.$message.error(err.response.message);
        })
        .finally(function () {});
    },
    getEmpty() {
      return (
        <div class="aops-app-table-empty">
          <a-empty description="暂无主机数据" image={require('@/assets/empty.svg')} />
        </div>
      );
    }
  },
  mounted: function () {
    this.getHostList();
    this.getGroupList();
  },
  beforeDestory() {
    clearInterval(this.status.statusTimer);
    this.statusTimer = null;
  }
};
</script>

<style lang="less" scoped>
.ant-lert {
  line-height: 14px;
}
</style>
