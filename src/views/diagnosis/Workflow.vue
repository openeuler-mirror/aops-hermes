<template>
  <my-page-header-wrapper>
    <div class="diagnosis-workflow">
      <a-card :bordered="false" class="aops-workFlowList aops-theme">
        <a-row type="flex" justify="space-between">
          <a-col>
            <h3 class="workFlow-title">
              工作流
              <description-tips> 基于应用创建而来，执行后再启动定时诊断，异常结果显示在告警界面。 </description-tips>
            </h3>
          </a-col>
        </a-row>
        <a-row type="flex" justify="space-between">
          <a-col>
            <span>共获取到&nbsp;{{ pagination.total }}&nbsp;条工作流信息</span>
          </a-col>
          <a-col>
            <a-button type="primary" @click="refreshWorkFlow" :loading="tableIsLoading" ref="tableRefresh">
              <a-icon type="reload"></a-icon>
              刷新
            </a-button>
          </a-col>
        </a-row>
        <div>
          <a-row class="aops-table-control-row">
            <a-col>
              <a-table
                class="workflow-table"
                :columns="columns"
                :pagination="pagination"
                :data-source="workFlowList"
                @change="handleWorkFlowTableChange"
                :loading="tableIsLoading"
                :locale="{emptyText: getEmpty}"
              >
                <span slot="workflow_name" slot-scope="workflow_name, record">
                  <router-link
                    :title="workflow_name"
                    :to="{
                      path: `/diagnosis/workflow/${record.workflow_id}`
                    }"
                    >{{ workflow_name }}</router-link
                  >
                </span>
                <span slot="description" slot-scope="description">
                  <CutText class="bgcTooltip" placement="topLeft" :text="description" :length="30"> </CutText>
                </span>
                <span slot="status" slot-scope="status" class="status">
                  <a-badge :status="statusColorMap[status]"></a-badge>
                  <span>{{ statusMap[status] }}</span>
                </span>
                <span slot="operation" slot-scope="operation, record">
                  <a
                    class="operation"
                    @click="executeWorkFlow(operation, record)"
                    :disabled="record.status === 'running'"
                    >执行
                  </a>
                  <a-divider type="vertical" />
                  <a class="operation" @click="suspendWorkFlow(operation, record)" :disabled="record.status === 'hold'">
                    暂停
                  </a>
                  <a-divider type="vertical" />
                  <a-popconfirm
                    title="你确定删除这个工作流吗?"
                    ok-text="确认"
                    cancel-text="取消"
                    @confirm="deleteWorkFlow(operation, record)"
                    :disabled="record.status === 'running'"
                  >
                    <a class="operation" :disabled="record.status === 'running'">删除</a>
                  </a-popconfirm>
                  <a-divider type="vertical" />
                  <span style="color: #999999">推荐</span>
                </span>
              </a-table>
            </a-col>
          </a-row>
        </div>
      </a-card>
      <a-card :bordered="false" class="aops-appList aops-theme">
        <h3 class="application-title">
          应用
          <description-tips> 将诊断逻辑进行封装，是工作流的“模板”。 </description-tips>
        </h3>
        <a-row type="flex" justify="space-between" style="margin-bottom: 10px">
          <a-col>
            <span>共获取到&nbsp;{{ appListPagination.total }}&nbsp;个应用信息</span>
          </a-col>
          <a-col>
            <a-button type="primary" @click="refreshAppList" :loading="appIsLoading" ref="appRefresh">
              <a-icon type="reload"></a-icon>
              刷新
            </a-button>
          </a-col>
        </a-row>
        <a-spin :spinning="appIsLoading">
          <a-row wrap="true" type="flex" :gutter="[16, 16]">
            <a-col :lg="8" :md="12" :sm="24">
              <a-card class="application-item disabled">
                <div class="createApp" @click="addApp">
                  <a-icon class="addAppIcon" type="plus" />
                  <a class="addApp"> 新增应用 </a>
                </div>
              </a-card>
            </a-col>
            <a-col :lg="8" :md="12" :sm="24" v-for="(app, index) of appInfo.app_list" :key="index">
              <!-- <a> {{ app.app_name }} </a>  -->
              <a-card class="application-item">
                <router-link class="appInfo" :to="{path: `/diagnosis/app/${app.app_id}`}">
                  <div class="appTop">
                    <a-row type="flex" justify="start" align="middle">
                      <a-col :span="8">
                        <!-- 图片区域 -->
                        <div class="imgBox">
                          <img src="@/assets/default.png" width="40" height="40" />
                        </div>
                      </a-col>
                      <a-col :span="16">
                        <div class="appMsg">
                          <div class="appDetail">
                            应用名：<a>{{ app.app_name }}</a>
                          </div>
                          <div class="version">版本号：{{ app.version }}</div>
                        </div>
                      </a-col>
                    </a-row>
                  </div>
                  <div class="appBottom">
                    <!-- 描述 -->
                    <div class="description">
                      <div class="description-name">描述：</div>
                      <div class="description-detail">
                        <span :title="app.description">{{ app.description }}</span>
                      </div>
                    </div>
                  </div>
                </router-link>
              </a-card>
            </a-col>
          </a-row>
        </a-spin>
        <a-pagination
          :current="appListPagination.page"
          :pageSize="appListPagination.perPage"
          :total="appListPagination.total"
          :pageSizeOptions="['8', '15', '20']"
          size="small"
          show-size-changer
          show-quick-jumper
          class="pagination"
          @change="onAppPageChange"
          @showSizeChange="onAppSizeChange"
        />
      </a-card>
    </div>
  </my-page-header-wrapper>
</template>

<script>
import MyPageHeaderWrapper from '@/views/utils/MyPageHeaderWrapper';
import DescriptionTips from '@/components/DescriptionTips';
import CutText from '@/components/CutText';
import {dateFormat} from '@/views/utils/Utils';

import {hostGroupList} from '@/api/assest';
import {getWorkFlowList, getAppList, executeWorkflow, stopWorkflow, deleteWorkflow} from '@/api/check';
const defaultPagination = {
  current: 1,
  pageSize: 10,
  showTotal: (total) => `总计 ${total} 项`,
  size: 'small',
  showSizeChanger: true,
  showQuickJumper: true
};
const statusMap = {
  running: '运行中',
  recommending: '推荐中',
  hold: '待运行'
};
const statusColorMap = {
  running: 'success',
  hold: 'default',
  recommending: 'processing'
};
const statusFilterList = [
  {text: '运行中', value: 'running'},
  {text: '推荐中', value: 'recommending'},
  {text: '待运行', value: 'hold'}
];
export default {
  name: 'Workflow',
  components: {
    MyPageHeaderWrapper,
    DescriptionTips,
    CutText
  },
  data() {
    return {
      pagination: defaultPagination,
      filters: null,
      sorter: {
        field: 'create_time',
        columnKey: 'create_time',
        order: 'descend'
      },
      tableIsLoading: false,
      appIsLoading: false,
      workFlowList: [],
      appInfo: {},
      appList: [],
      groupData: [],
      domain: {},
      appListPagination: {
        page: 1,
        perPage: 8,
        total: 0
      },
      statusMap,
      statusColorMap,

      excuteLoading: false,
      stopLoading: false,
      deleteLoading: false
    };
  },
  methods: {
    // 处理表格分页器
    handleWorkFlowTableChange(pagination, filters, sorter) {
      this.pagination = pagination;
      this.filters = filters;
      this.sorter = sorter;
      this.getWorkFlowList();
    },
    // 处理执行
    executeWorkFlow(operation, record) {
      this.excuteLoading = true;
      executeWorkflow({
        workflowId: record.workflow_id
      })
        .then((res) => {
          this.$message.success(res.message);
          this.getWorkFlowList();
        })
        .catch((err) => {
          this.$message.error(err.response.message);
        })
        .finally(() => {
          this.excuteLoading = false;
        });
    },
    // 处理暂停
    suspendWorkFlow(operation, record) {
      this.stopLoading = true;
      stopWorkflow({
        workflowId: record.workflow_id
      })
        .then((res) => {
          this.$message.success(res.message);
          this.getWorkFlowList();
        })
        .catch((err) => {
          this.$message.error(err.response.message);
        })
        .finally(() => {
          this.stopLoading = false;
        });
    },
    // 处理删除
    deleteWorkFlow(operation, record) {
      this.deleteLoading = true;
      deleteWorkflow({
        workflowId: record.workflow_id
      })
        .then((res) => {
          this.$message.success(res.message);
          this.getWorkFlowList();
        })
        .catch((err) => {
          this.$message.error(err.response.message);
        })
        .finally(() => {
          this.deleteLoading = false;
        });
    },
    // 获取工作流列表
    getWorkFlowList() {
      this.tableIsLoading = true;
      const pagination = this.pagination || {};
      const filters = this.filters || {};
      const sorter = this.sorter || {};
      getWorkFlowList({
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
      })
        .then((res) => {
          this.workFlowList = res.data.result || [];
          this.workFlowList.forEach((item, index) => {
            this.$set(item, 'key', index);
            this.$set(item, 'domain', item.input.domain);
          });
          this.pagination = {
            ...this.pagination,
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: res.data.total_count || (res.data.total_count === 0 ? 0 : pagination.total)
          };
        })
        .catch((err) => {
          this.$message.error(err.response.message);
        })
        .finally(() => {
          this.tableIsLoading = false;
        });
    },
    // 获取应用列表
    getAppList() {
      this.appIsLoading = true;
      getAppList({
        page: this.appListPagination.page,
        perPage: this.appListPagination.perPage
      })
        .then((res) => {
          this.appInfo = res.data || {};
          this.appList = this.appInfo.app_list || [];
          this.appListPagination.total = this.appInfo.total_count;
        })
        .catch((err) => {
          this.$message.error(err.response.message);
        })
        .finally(() => {
          this.appIsLoading = false;
        });
    },
    // 刷新工作流列表
    refreshWorkFlow() {
      this.getWorkFlowList();
    },
    // 刷新应用列表
    refreshAppList() {
      this.getAppList();
    },
    // 新增应用(待开发)
    addApp() {},
    // 处理应用列表分页器
    onAppPageChange(page, pageSize) {
      this.appListPagination.page = page;
      this.appListPagination.perPage = pageSize;
      this.getAppList();
    },
    onAppSizeChange(current, pageSize) {
      this.appListPagination.page = 1;
      this.appListPagination.perPage = pageSize;
      this.getAppList();
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
          <a-empty description="请点击下方应用，创建工作流" image={require('@/assets/empty.svg')} />
        </div>
      );
    }
  },
  mounted() {
    this.getWorkFlowList();
    this.getAppList();
    this.getGroupList();
  },
  computed: {
    columns() {
      let {filters, sorter} = this;
      filters = filters || {};
      sorter = sorter || {};
      const baseColumns = [
        {
          dataIndex: 'workflow_name',
          key: 'workflow_name',
          title: '名称',
          align: 'left',
          width: 120,
          scopedSlots: {
            customRender: 'workflow_name'
          }
        },
        {
          dataIndex: 'description',
          key: 'description',
          title: '描述',
          width: 120,
          scopedSlots: {
            customRender: 'description'
          }
        },
        {
          dataIndex: 'create_time',
          key: 'create_time',
          title: '创建时间',
          sorter: true,
          sortOrder: sorter.columnKey === 'create_time' && sorter.order,
          customRender: (text, record, index) => dateFormat('YYYY-mm-dd HH:MM:SS', text * 1000)
        },
        {
          dataIndex: 'domain',
          key: 'domain',
          title: '主机组',
          filteredValue: filters.domain || null,
          filters: this.groupData.map((group) => {
            return {
              text: group.host_group_name,
              value: group.host_group_name
            };
          })
        },
        {
          dataIndex: 'app_name',
          key: 'app_name',
          title: '应用',
          filteredValue: filters.app_name || null,
          filters: this.appList.map((app) => {
            return {
              text: app.app_name,
              value: app.app_name
            };
          })
        },
        {
          dataIndex: 'status',
          key: 'status',
          title: '状态',
          filteredValue: filters.status || null,
          filters: statusFilterList,
          scopedSlots: {
            customRender: 'status'
          }
        },
        {
          dataIndex: 'operation',
          key: 'operation',
          title: '操作',
          align: 'left',
          width: 220,
          scopedSlots: {
            customRender: 'operation'
          }
        }
      ];
      return baseColumns;
    }
  }
};
</script>

<style lang="less" scoped>
.diagnosis-workflow {
  .workflow-table {
    margin-top: 10px;
  }
  .status {
    display: flex;
    align-items: center;
  }
  .application-title,
  .workFlow-title {
    color: #666666;
    font-weight: 600;
    font-size: 17px;
    margin-bottom: 10px;
    .anticon {
      font-size: 14px;
      position: relative;
      left: 4px;
      bottom: 1px;
    }
  }
  .application-item {
    text-align: center;
    cursor: pointer;
    height: 130px;
    /deep/ .ant-card-body {
      padding: 18px 24px;
    }
    .createApp {
      display: flex;
      flex-direction: column;
      align-items: center;
      align-content: center;
      .addAppIcon {
        font-size: 50px;
        color: #1d4cb3;
      }
      .addApp {
        margin-top: 10px;
      }
    }

    .appInfo {
      display: flex;
      flex-direction: column;
      .appTop {
        .imgBox {
          width: 60px;
          height: 60px;
          border-radius: 2px;
          img {
            height: 100%;
            width: 100%;
          }
        }
        .appMsg {
          text-align: left;
          margin-left: 10px;
          font-size: 12px;
          .version {
            margin-top: 6px;
            font-size: 10px;
            color: #606266;
          }
        }
      }
      .appBottom {
        .description {
          display: flex;
          margin-top: 10px;
          font-size: 13px;
          justify-content: flex-start;
          flex-wrap: nowrap;
          color: #606266;
          .description-name {
            white-space: nowrap;
          }
          .description-detail {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }
      }
    }
    &.disabled {
      cursor: not-allowed;
      .addAppIcon,
      a {
        color: #999;
        cursor: not-allowed;
      }
    }
  }
  .operation {
    cursor: pointer;
  }
  .pagination {
    margin-top: 20px;
    float: right;
  }
  .errorMessage {
    width: 20%;
    position: absolute;
    top: -70px;
    left: 40%;
  }
}
</style>
