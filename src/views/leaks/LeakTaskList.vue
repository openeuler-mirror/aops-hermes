<template>
  <page-header-wrapper :breadcrumb="breadcrumb">
    <a-card :bordered="false" class="aops-theme">
      <div class="leakbox">
        <a-row type="flex" class="aops-app-table-control-row" :gutter="6" justify="space-between">
          <a-col>
            <a-input-search placeholder="按任务名称搜索" :maxLength="20" style="width: 200px" @search="onSearch" />
          </a-col>
          <a-col>
            <a-row type="flex" :gutter="6">
              <a-col v-if="selectedRowKeys.length > 0">
                <a-alert type="info" show-icon class="selection-alert">
                  <div slot="message">
                    <span>{{ `已选择` + selectedRowKeys.length + `项` }}</span>
                    <a @click="resetSelection"> 清除选择</a>
                  </div>
                </a-alert>
              </a-col>
            </a-row>
          </a-col>
          <a-row type="flex" :gutter="6">
            <a-col>
              <a-button type="primary" :disabled="selectedRowKeys.length < 1" @click="deleteHostBash">
                批量删除
              </a-button>
            </a-col>
          </a-row>
        </a-row>
        <a-table
          rowKey="task_id"
          :columns="columns"
          :data-source="tableData"
          :pagination="pagination"
          :row-selection="rowSelection"
          @change="handleTableChange"
          :loading="tableIsLoading"
        >
          <a @click="jumptoDetail(record)" slot="taskName" slot-scope="taskName, record">{{ taskName }}</a>
          <span slot="desc" slot-scope="text">
            <cut-text :text="text" :length="20" />
          </span>
          <div slot="statuses" slot-scope="statuses">
            <span><a-icon type="check-circle" class="color-check-circle" />{{ statuses && statuses['succeed'] }} </span>
            <span><a-icon type="close-circle" class="color-close-circle" />{{ statuses && statuses['fail'] }} </span>
            <span>
              <a-icon v-if="statuses && statuses['running']" type="loading" class="color-running-circle" />
              <a-icon v-else type="loading-3-quarters" />
              {{ statuses && statuses['running'] }}
            </span>
            <span
              ><a-icon type="question-circle" class="color-standby-circle" />{{ statuses && statuses['unknown'] }}
            </span>
          </div>
          <span slot="action" slot-scope="action, record">
            <a-divider type="vertical" />
            <a-popconfirm
              title="你确定执行这个任务吗?"
              ok-text="确认"
              cancel-text="取消"
              @confirm="executeTask(record.task_id)"
            >
              <a-icon slot="icon" type="play-circle" style="color: #002fa7" />
              <a>执行</a>
            </a-popconfirm>
            <a-divider type="vertical" />
            <a-popconfirm
              title="你确定删除这个任务吗?"
              ok-text="确定"
              cancel-text="取消"
              @confirm="deleteTask([record.task_id])"
            >
              <a-icon slot="icon" type="close-circle" style="color: red" />
              <a>删除</a>
            </a-popconfirm>
          </span>
        </a-table>
      </div>
    </a-card>
  </page-header-wrapper>
</template>

<script>
/**
 * 任务列表页面
 */

import {i18nRender} from '@/vendor/ant-design-pro/locales';
import {PageHeaderWrapper} from '@ant-design-vue/pro-layout';
import CutText from '@/components/CutText';

import {dateFormat} from '@/views/utils/Utils';
import {getSelectedRow} from './utils/getSelectedRow';
import {executeTask, deleteTask, getTaskList, getTaskProgress} from '@/api/leaks';
import configs from '@/config/defaultSettings';

const cveStatusTextMap = {
  succeed: '修复成功',
  fail: '待修复',
  running: '运行中',
  unknown: '未知'
};

const repoStatusTextMap = {
  succeed: '已设置',
  fail: '未设置',
  running: '运行中',
  unknown: '未知'
};

const defaultPagination = {
  current: 1,
  pageSize: 10,
  showTotal: (total) => `总计 ${total} 项`,
  showSizeChanger: true,
  showQuickJumper: true
};

export default {
  name: 'LeakTaskList',
  components: {
    PageHeaderWrapper,
    CutText
  },
  data() {
    return {
      tableData: [],
      pagination: defaultPagination,
      filters: null,
      sorter: null,
      tableIsLoading: false,
      selectedRowKeys: [],
      selectedRowsAll: [],
      progressLoading: false,
      progressUpdateCaller: null
    };
  },
  computed: {
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
            return <router-link to={route.path}>{route.breadcrumbName}</router-link>;
          }
        }
      };
    },
    rowSelection() {
      return {
        selectedRowKeys: this.selectedRowKeys,
        onChange: this.onSelectChange
      };
    },
    columns() {
      let {filters} = this;
      filters = filters || {};
      return [
        {
          dataIndex: 'task_name',
          title: '任务名称',
          scopedSlots: {customRender: 'taskName'}
        },
        {
          dataIndex: 'description',
          title: '任务描述',
          scopedSlots: {customRender: 'desc'}
        },
        {
          dataIndex: 'host_num',
          title: '涉及主机个数',
          sorter: true
        },
        {
          dataIndex: 'task_type',
          title: '类型',
          width: 80,
          filteredValue: filters['task_type'] || undefined,
          filters: [
            {
              text: 'cve fix',
              value: 'cve fix'
            },
            {
              text: 'repo set',
              value: 'repo set'
            },
            {
              text: 'cve rollback',
              value: 'cve rollback'
            },
            {
              text: 'hotpatch remove',
              value: 'hotpatch remove'
            }
          ]
        },
        {
          dataIndex: 'statuses',
          title: '状态',
          scopedSlots: {customRender: 'statuses'}
        },
        {
          dataIndex: 'create_time',
          title: '任务生成时间',
          sorter: true,
          width: '8%',
          customRender: (time) => time && dateFormat('YYYY-mm-dd HH:MM:SS', time * 1000)
        },
        {
          dataIndex: 'operation',
          title: '操作',
          width: '15%',
          scopedSlots: {customRender: 'action'}
        }
      ];
    }
  },
  methods: {
    jumptoDetail(value) {
      this.$router.push({
        path: `task/${value.task_type}/${value.task_id}`,
        query: {
          task_id: value.task_id
        }
      });
    },
    checkStatus(data, tasktype) {
      for (const key in data) {
        if (data[key] >= 1) {
          if (tasktype === 'cve fix') {
            return cveStatusTextMap[key];
          } else {
            return repoStatusTextMap[key];
          }
        }
      }
    },
    onSelectChange(selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys;
      this.selectedRowsAll = getSelectedRow(selectedRowKeys, this.selectedRowsAll, this.tableData, 'task_id');
    },
    handleTableChange(pagination, filters, sorter) {
      // 存储翻页状态
      this.pagination = pagination;
      // this.filters = filters;
      this.filters = Object.assign({}, this.filters, filters);
      this.sorter = sorter;
      // 出发排序、筛选、分页时，重新请求主机列表
      this.getTaskList();
    },
    executeTask(taskId) {
      const _this = this;
      executeTask(taskId)
        .then(function (res) {
          _this.$message.success(res.message);
          _this.selectedRowsAll = [];
          _this.selectedRowKeys = [];
          _this.getTaskList();
        })
        .catch(function (err) {
          _this.$message.error(err.response.message);
        });
    },
    // 部分删除错误的提示信息
    deletePartialFailMessage(taskId) {
      var runningTaskName = this.tableData
        .filter((task) => {
          if (taskId.indexOf(task.task_id) !== -1) {
            return task.task_name;
          }
        })
        .map((task) => {
          return task.task_name;
        });
      this.$message.warning('部分任务正在运行中请稍后重试!');
    },
    deleteTask(taskList) {
      const _this = this;
      return deleteTask({
        taskList: taskList
      })
        .then(function (res) {
          if (res.data.running_task && res.data.running_task.length !== 0) {
            _this.deletePartialFailMessage(res.data.running_task);
          } else {
            _this.$message.success(res.message);
          }
          _this.selectedRowsAll = [];
          _this.selectedRowKeys = [];
          _this.getTaskList();
        })
        .catch(function (err) {
          _this.$message.error(err.response.message);
        });
    },
    // 批量删除
    deleteHostBash() {
      const _this = this;
      this.$confirm({
        title: '确定删除以下任务?',
        content: _this.selectedRowsAll.map((task) => task.task_name).join('、'),
        icon: () => <a-icon type="exclamation-circle" />,
        okText: '确定',
        onOk: function () {
          return _this.deleteTask(_this.selectedRowKeys);
        }
      });
    },
    getTaskList() {
      const _this = this;
      this.tableIsLoading = true;
      const pagination = this.pagination || {};
      const filters = this.filters || {};
      const sorter = this.sorter || {};
      sorter.field = sorter.field || 'create_time';
      sorter.order = sorter.order || 'descend';
      clearTimeout(this.progressUpdateCaller);
      getTaskList({
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
        .then(function (res) {
          _this.tableData = res.data.result || [];
          _this.pagination = {
            ..._this.pagination,
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: res.data.total_count || (res.data.total_count === 0 ? 0 : pagination.total)
          };
          _this.updateProgress(_this.tableData.map((task) => task.task_id));
        })
        .catch(function (err) {
          _this.$message.error(err.response.message);
        })
        .finally(function () {
          _this.tableIsLoading = false;
        });
    },
    onSearch(text) {
      this.pagination = defaultPagination;
      if (!this.filters) {
        this.filters = {};
      }
      if (text !== '') {
        this.filters.taskName = text;
      } else {
        this.filters.taskName = undefined;
      }
      this.getTaskList();
    },
    // 轮训请求任务状态，当没有running状态时停止
    updateProgress(taskList) {
      const _this = this;
      this.progressLoading = true;
      getTaskProgress({taskList})
        .then(function (res) {
          _this.addStatusToData(res.data.result);

          if (!_this.prgressFinishedCheck(res.data.result)) {
            _this.progressUpdateCaller = setTimeout(function () {
              _this.updateProgress(taskList);
            }, configs.taskProgressUpdateInterval);
          }
        })
        .catch(function (err) {
          _this.$message.error(err.response.message);
        })
        .finally(function () {
          _this.progressLoading = false;
        });
    },
    // 将返回的任务状态更新到表格数据中，用于数据展示
    addStatusToData(statusMap) {
      this.tableData.forEach((task) => {
        task.statuses = statusMap[task.task_id];
        // task.statuses = task.task_type === 'cve fix' ? cveStatusTextMap[statusMap] : repoStatusTextMap[statusMap];
      });
      this.tableData = Object.assign([], this.tableData);
    },
    prgressFinishedCheck(statusMap) {
      for (const taskId in statusMap) {
        if (statusMap[taskId]['running']) {
          return false;
        }
      }
      return true;
    },
    resetSelection() {
      this.selectedRowKeys = [];
      this.selectedRowsAll = [];
    }
  },
  mounted: function () {
    this.getTaskList();
  },
  beforeDestroy() {
    // 离开页面前，若当前存在轮询，清除轮询
    if (this.progressUpdateCaller) {
      clearInterval(this.progressUpdateCaller);
      this.progressUpdateCaller = null;
    }
  }
};
</script>

<style lang="less" scoped>
.status-icon {
  margin: 0 2px;
}
.ant-table-wrapper {
  zoom: 1;
}
.color {
  &-check-circle {
    color: #52c41a;
  }
  &-close-circle {
    color: #f5222d;
  }
  &-running-circle {
    color: #722ed1;
  }
  &-standby-circle {
    color: #666;
  }
}
/deep/ .ant-table-row td {
  padding: 8px;
}
/deep/ .ant-table-thead th {
  padding: 8px;
}

/deep/ .ant-table-thead th:last-child {
  padding-left: 107px;
}

/deep/ .ant-table-tbody tr td:nth-child(1) {
  width: 100px;
}

/deep/ .ant-table-tbody tr td:nth-child(2) {
  width: 218px;
}

/deep/ .ant-table-tbody tr td:nth-child(3) {
  width: 320px;
}

/deep/ .ant-table-tbody tr td:nth-child(4) {
  width: 200px;
  padding-left: 47px;
}

/deep/ .ant-table-tbody tr td:nth-child(5) {
  width: 150px;
}

/deep/ .ant-table-tbody tr td:nth-child(6) {
  width: 160px;
}

/deep/ .ant-table-tbody tr td:nth-child(7) {
  width: 142px;
}

/deep/ .ant-table-tbody tr td:nth-child(8) {
  padding-left: 63px;
}
</style>
