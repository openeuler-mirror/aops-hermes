<template>
  <page-header-wrapper :breadcrumb="breadcrumb">
    <a-card :bordered="false" class="aops-theme">
      <div class="detail-info-content">
        <a-spin :spinning="infoLoading">
          <h1>{{ detail.task_name }}</h1>
          <a-row type="flex">
            <a-col :span="8">
              <p>任务类型：{{ taskTypeMap[taskType] }}</p>
            </a-col>
          </a-row>
          <a-row type="flex">
            <a-col :span="8">
              <p>主机个数：{{ detail.host_num }}</p>
            </a-col>
            <!-- <a-col :span="8">
              <p>{{ detail.need_reboot }}台主机需要重启</p>
            </a-col> -->
          </a-row>
          <a-row type="flex">
            <!-- <a-col :span="8">
              <p>自动重启：{{ detail.auto_reboot ? '是' : '否' }} <a-tooltip placement="top">
                  <template slot="title">
                    <span>是否开启自动重启，开启后若cve修复后需要重启则会进行重启， 否则不会重启</span>
                  </template>
                  <span><a-icon type="question-circle" /></span>
                </a-tooltip></p>
            </a-col> -->
          </a-row>
          <a-row>
            <a-col :span="8">
              <p>
                最新状态
                <a-tooltip placement="top">
                  <template slot="title">
                    <span>{{ taskType === 'cve fix' ? `修复成功` : taskType === 'cve rollback' ? `已回滚` : `已设置` }}</span>
                  </template>
                  <span><a-icon type="check-circle" class="color-check-circle" />{{
                    detail.statuses && detail.statuses['succeed']
                  }}</span>
                </a-tooltip>
                <a-tooltip placement="top">
                  <template slot="title">
                    <span>{{ taskType === 'cve fix' ? `待修复` : taskType === 'cve rollback' ? `未回滚` : `未设置` }}</span>
                  </template>
                  <span><a-icon type="close-circle" class="color-close-circle" />{{
                    detail.statuses && detail.statuses['fail']
                  }}</span>
                </a-tooltip>
                <a-tooltip placement="top">
                  <template slot="title">
                    <span>运行中</span>
                  </template>
                  <span>
                    <a-icon
                      v-if="detail.statuses && detail.statuses['running']"
                      type="loading"
                      class="color-running-circle" />
                    <a-icon v-else type="loading-3-quarters" />
                    {{ detail.statuses && detail.statuses['running'] }}
                  </span>
                </a-tooltip>
                <a-tooltip placement="top">
                  <template slot="title">
                    <span>未知</span>
                  </template>
                  <span><a-icon type="question-circle" class="color-standby-circle" />{{
                    detail.statuses && detail.statuses['unknown']
                  }}</span>
                </a-tooltip>
              </p>
            </a-col>
            <a-col :span="16">
              <p>
                上次执行时间：{{
                  detail.latest_execute_time ?
                  dateFormat('YYYY-mm-dd HH:MM:SS', detail.latest_execute_time * 1000) :
                  '未执行'
                }}
                <a
                  v-if="reportvisible && detail.latest_execute_time"
                  @click="jumptoResult(detail.latest_execute_time)"
                  target="blank">查看报告</a>
              </p>
            </a-col>
          </a-row>
          <div>
            <p>任务描述：</p>
            <p class="detail-description">{{ detail.description }}</p>
          </div>
          <a-row type="flex" :gutter="8" justify="end">
            <a-col>
              <a-button type="primary" @click="executeTask">执行</a-button>
            </a-col>
          </a-row>
        </a-spin>
      </div>
    </a-card>
    <a-card :bordered="false" class="aops-theme">
      <a-row type="flex" class="aops-app-table-control-row" :gutter="6" justify="space-between">
        <!-- <a-col>
          <a-alert type="info" show-icon class="selection-alert" v-if="selectedRowKeys.length > 0">
            <div slot="message">
              <span>{{ `已选择` + selectedRowKeys.length + `项用于回滚` }}</span>
              <a @click="resetSelection"> 清除选择</a>
            </div>
          </a-alert>
        </a-col> -->
        <a-col>
          <a-row type="flex" :gutter="6">
            <a-col>
              <a-input-search
              :placeholder="taskType === 'cve fix' ? `按CVE ID搜索` : taskType === 'cve rollback' ? `按CVE ID搜索` : `按主机名搜索`"
                style="width: 200px"
                @search="onSearch" />
            </a-col>
            <a-col>
              <!-- <a-button
                v-if="taskType === 'cve fix'"
                type="danger"
                @click="handleRollback"
                :loading="detail.statuses['running'] > 0"
                :disabled="selectedRowKeys.length <= 0 || detail.statuses['running'] > 0"
                >回滚</a-button
              > -->
            </a-col>
          </a-row>
        </a-col>
        <!-- <a-col>
          <a-row type="flex" :gutter="6">
            <a-col v-if="selectedRowKeys.length === 0">
              <create-repair-task-drawer
                text="生成回滚任务"
                taskType="cve rollback"
                :fixed="fixed"
                :cveListProps="standalone ? cveAllList : cveAllListProp"
                :loading="standalone ? cveAllIsLoading : cveAllIsLoadingProp"
                :hostListType="standalone ? 'byLoading' : 'byOneHost'"
                :hostList="hostList"
                @createSuccess="handleTaskCreateSuccess" />
            </a-col>
            <a-col v-if="selectedRowKeys.length !== 0">
                <create-repair-task-drawer
                taskType="cve rollback"
                :fixed="fixed"
                :cveListProps="selectedRowsAll"
                :hostListType="standalone ? 'byLoading' : 'byOneHost'"
                :hostList="hostList"
                @createSuccess="handleTaskCreateSuccess" />
            </a-col>
          </a-row>
        </a-col> -->
      </a-row>
      <a-table
        :rowKey="rowKeyMap[taskType]"
        :columns="taskType === 'cve fix' || taskType === 'cve rollback' ? cveColumns : repoColumns"
        :data-source="tableData"
        :pagination="pagination"
        @change="handleTableChange"
        @expand="expand"
        :expanded-row-keys.sync="expandedRowKeys"
        :loading="tableIsLoading">
        <a
        slot="hosts"
        slot-scope="hosts, record"
          @click="showHostListUnderCve('rpm', record)">{{ hosts }}</a>
        <div slot="progress" slot-scope="progress, record">
          <a-progress :percent="Math.ceil(((progress || 0) / record.host_num) * 100)" />
        </div>
        <span slot="package" slot-scope="packageitem">{{ packageitem || '——' }}</span>
        <div slot="status" slot-scope="status">
          <span class="task-status">
            <a-badge :status="statusValueMap[status]" />
            {{ taskType === 'cve fix' ? cveStatusTextMap[status] : taskType === 'cve rollback' ? rollStatusTextMap[status] : repoStatusTextMap[status] }}
            <a-icon
            v-if="statusValueMap[status] === 'processing'"
            type="loading"
              class="color-running-circle" />
          </span>
        </div>
        <div v-if="taskType === 'cve fix'" slot="expandedRowRender" slot-scope="record" style="margin: 0">
          <a-table
            :row-key="innerrecord => taskType === 'cve fix' ? record.cve_id + innerrecord.installed_rpm : record.cve_id + innerrecord.available_rpm"
            :columns="innerColumns"
            :data-source="record.rpms || []"
            :pagination="false">
            <a slot="host_list" slot-scope="host_list, innerrecord" @click="showHostListUnderCve('host', record, innerrecord)">
              {{ host_list.length }}
            </a>
          </a-table>
        </div>
      </a-table>
    </a-card>
    <host-status-in-task-drawer
      :propType="propType"
      :visible="hostListUnderCveVisible"
      :taskType="taskType"
      @close="closeHostListUnderCve"
      :taskId="taskId"
      :cveId="hostListOfCveId"
      :rpmrecord="rpmrecord" />
  </page-header-wrapper>
</template>

<script>
/**
 * 任务详情页面
 */

import {PageHeaderWrapper} from '@ant-design-vue/pro-layout';
import CreateRepairTaskDrawer from './components/CreateRepairTaskDrawer.vue';
import HostStatusInTaskDrawer from './components/HostStatusInTaskDrawer';
import {i18nRender} from '@/vendor/ant-design-pro/locales';
import {dateFormat} from '@/views/utils/Utils';
import {
  getTaskInfo,
  getCveUnderCveTask,
  getCveProgressUnderCveTask,
  getHostUnderRepoTask,
  executeTask,
  getTaskProgress,
  rollbackCveTask,
  getCvefixLeakRpm
} from '@/api/leaks';
import configs from '@/config/defaultSettings';

const taskTypeMap = {
  'cve fix': '漏洞修复',
  'repo set': 'REPO设置',
  'cve rollback': 'cve回滚'
};
const rowKeyMap = {
  'cve fix': 'cve_id',
  'cve rollback': 'cve_id',
  'repo set': 'host_id'
};

const cveStatusTextMap = {
  succeed: '修复成功',
  fail: '待修复',
  running: '运行中',
  unknown: '未知'
};

const rollStatusTextMap = {
  succeed: '回滚成功',
  fail: '待回滚',
  running: '运行中',
  unknown: '未知'
};

const repoStatusTextMap = {
  succeed: '已设置',
  fail: '未设置',
  running: '运行中',
  unknown: '未知'
};

const statusValueMap = {
  succeed: 'success',
  fail: 'error',
  running: 'processing',
  unknown: 'default',
  set: 'success',
  unset: 'warning'
};

const defaultPagination = {
  current: 1,
  pageSize: 10,
  showTotal: (total) => `总计 ${total} 项`,
  showSizeChanger: true,
  showQuickJumper: true
};

export default {
  name: 'LeakTaskDetail',
  components: {
    PageHeaderWrapper,
    HostStatusInTaskDrawer,
    CreateRepairTaskDrawer
  },
  data() {
    return {
      expandedRowKeys: [],
      rpmrecord: {},
      propType: '',
      // 轮询计时器
      repoInfoTimeout: null,
      CveScanStatueTimeout: null,
      progressUpdateCaller: null,
      reportvisible: false,
      runningCveIds: [],
      timer: '',
      taskId: '',
      taskType: this.$route.params.taskType,
      detail: {statuses: {}},
      infoLoading: false,
      // cve/repo任务详情下表格数据
      tableData: [],
      tableIsLoading: false,
      pagination: defaultPagination,
      filters: null,
      sorter: null,
      cveProgressIsLoading: false,
      selectedRowKeys: [],
      selectedRowsAll: [],
      // 每个cve下host详情数据
      hostListUnderCveVisible: false,
      hostListOfCveId: null,
      cveStatusTextMap,
      repoStatusTextMap,
      rollStatusTextMap,
      taskTypeMap,
      rowKeyMap,
      statusValueMap
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
            // 若为路由diyBreadcrumb数组的最后一个元素，替换标题文本为其对应的任务名称
            if (routes.indexOf(route) === routes.length - 1) {
              return <span>{this.detail.task_name}</span>;
            } else {
              return <router-link to={route.path}>{route.breadcrumbName}</router-link>;
            }
          }
        }
      };
    },
    // rowSelection() {
    //   return {
    //     selectedRowKeys: this.selectedRowKeys,
    //     onChange: this.onSelectChange
    //   };
    // },
    cveColumns() {
      let {filters} = this;
      filters = filters || {};

      return [
        {
          dataIndex: 'cve_id',
          title: 'CVE ID',
          scopedSlots: {customRender: 'cveId'}
        },
        {
          dataIndex: 'host_num',
          title: '主机',
          sorter: true,
          scopedSlots: {customRender: 'hosts'}
        },
        {
          dataIndex: 'package',
          title: '解决方案',
          scopedSlots: {customRender: 'package'}
        },
        // {
        //   dataIndex: 'reboot',
        //   title: '重启后生效',
        //   customRender: (reboot) => (reboot ? '是' : '否'),
        //   filteredValue: filters.reboot || null,
        //   filterMultiple: false,
        //   filters: [
        //     {text: '是', value: 'true'},
        //     {text: '否', value: 'false'}
        //   ]
        // },
        {
          dataIndex: 'progress',
          title: '执行进度（已处理/总数）',
          scopedSlots: {customRender: 'progress'}
        },
        {
          dataIndex: 'status',
          title: this.taskType === 'cve fix' ? '修复状态' : '回滚状态',
          // width: 140,
          scopedSlots: {customRender: 'status'},
          filteredValue: filters.status || null,
          filters: this.taskType === 'cve fix' ? [
            {text: '修复成功', value: 'succeed'},
            {text: '待修复', value: 'fail'},
            {text: '运行中', value: 'running'},
            {text: '未知', value: 'unknown'}
          ] : [
            {text: '回滚成功', value: 'succeed'},
            {text: '待回滚', value: 'fail'},
            {text: '运行中', value: 'running'},
            {text: '未知', value: 'unknown'}
          ]
        }
      ];
    },
    repoColumns() {
      let {filters} = this;
      filters = filters || {};
      return [
        {
          dataIndex: 'host_name',
          title: '主机名称',
          scopedSlots: {customRender: 'host_name'}
        },
        {
          dataIndex: 'host_ip',
          title: 'IP地址'
        },
        {
          dataIndex: 'repo_name',
          title: 'CVE REPO'
        },
        {
          dataIndex: 'status',
          title: '最新状态',
          // width: 140,
          scopedSlots: {customRender: 'status'},
          filteredValue: filters.status || null,
          filters: [
            {text: '未设置', value: 'fail'},
            {text: '运行中', value: 'running'},
            {text: '未知', value: 'unknown'},
            {text: '已设置', value: 'succeed'}
          ]
        }
      ];
    },
    innerColumns() {
      return [
        {
          dataIndex: 'installed_rpm',
          key: 'installed_rpm',
          title: '受影响rpm'
        },
        {
          dataIndex: 'available_rpm',
          key: 'available_rpm',
          title: '待安装rpm',
          scopedSlots: {customRender: 'available_rpm'}
        },
        {
          dataIndex: 'fix_way',
          key: 'fix_way',
          title: '修复方式'
        },
        {
          dataIndex: 'host_list',
          key: 'host_list',
          title: '主机数量',
          scopedSlots: {customRender: 'host_list'}
        }
      ];
    }
  },
  methods: {
    dateFormat,
    jumptoResult(value) {
      this.$router.push({
        path: `/leaks/task-report/${this.taskType}/${this.taskId}`,
        query: {
          taskId: this.taskId,
          taskType: this.taskType,
          latestExecuteTime: value
        }
      })
    },
    expand(expanded, record) {
      if (expanded && this.taskType === 'cve fix') {
        const _this = this
        const Params = {
          cve_id: record.cve_id,
          task_id: this.taskId
        }
          getCvefixLeakRpm(Params)
          .then(function (res) {
              const target = _this.tableData.find(item => item.cve_id === record.cve_id)
              target.rpms = res.data
              // 数据更新后给表格重新赋值
              _this.tableData = JSON.parse(JSON.stringify(_this.tableData))
          })
          .catch(function (err) {
            _this.$message.error(err.response.message);
          })
          .finally(function () {
            _this.tableIsLoading = false;
          });
      }
    },
    handleTableChange(pagination, filters, sorter) {
      // 存储翻页状态
      for (var key in filters) {
        if (filters[key] !== null) {
          if (filters[key].length === 0) {
            filters[key] = undefined;
          }
        } else {
          filters[key] = undefined;
        }
      }
      this.pagination = pagination;
      this.filters = Object.assign({}, this.filters, filters);
      this.sorter = sorter;
      // 出发排序、筛选、分页时，重新请求主机列表
      if (this.taskType === 'cve fix' || this.taskType === 'cve rollback') {
        this.getCveList();
      } else {
        this.getHostList();
      }
    },
    // onSelectChange(selectedRowKeys, selectedRows) {
    //   const tableData = this.tableData;
    //   this.selectedRowKeys = selectedRowKeys;
    //   this.selectedRowsAll = getSelectedRow(selectedRowKeys, this.selectedRowsAll, tableData, 'cve_id');
    // },
    resetSelection() {
      this.selectedRowKeys = [];
      this.selectedRowsAll = [];
    },
    getInfo() {
      const _this = this;
      this.infoLoading = true;
      getTaskInfo({
        taskId: this.taskId
      })
        .then(function (res) {
          _this.detail = res.data.result || {};
          _this.detail.statuses = {};
          // update progress
          _this.updateProgress([_this.taskId]);
        })
        .catch(function (err) {
          _this.$message.error(err.response.message);
        })
        .finally(function () {
          _this.infoLoading = false;
        });
    },
    // 轮训当前任务进度，没用running状态时停止
    updateProgress(taskList) {
      const _this = this;
      this.progressLoading = true;
      clearTimeout(this.progressUpdateCaller);
      getTaskProgress({taskList})
        .then(function (res) {
          _this.detail.statuses = res.data.result && res.data.result[_this.taskId];
          _this.detail = Object.assign({}, _this.detail);
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
    getVisible(statusMap) {
      for (const key in statusMap) {
        if (key === 'running') {
          if (statusMap[key] === '1') {
            return true;
          } else {
            return false;
          }
        }
      }
    },
    prgressFinishedCheck(statusMap) {
      for (const taskId in statusMap) {
        if (statusMap[taskId]['running']) {
          return false;
        }
      }
      return true;
    },
    // for cve task
    getCveList() {
      const _this = this;
      this.tableIsLoading = true;
      const pagination = this.pagination || {};
      const filters = this.filters || {};
      const sorter = this.sorter || {};
      getCveUnderCveTask({
        taskId: this.taskId,
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
          // 获取数据后调取方法查看是否需要展开
          _this.$nextTick(() => {
            _this.checkCondition();
          });
          _this.pagination = {
            ..._this.pagination,
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: res.data.total_count || (res.data.total_count === 0 ? 0 : pagination.total)
          };
          _this.updateCveProgress(
            _this.taskId,
            res.data.result.map((cve) => cve.cve_id)
          );
        })
        .catch(function (err) {
          _this.$message.error(err.response.message);
        })
        .finally(function () {
          _this.tableIsLoading = false;
        });
    },
    updateCveProgress(taskId, cveList) {
      const _this = this;
      this.cveProgressIsLoading = true;
      clearTimeout(this.CveScanStatueTimeout);
      getCveProgressUnderCveTask({
        taskId,
        cveList
      })
        .then(function (res) {
          _this.addCveProgressToList(res.data.result);
          _this.runningCveIds = _this.getRunningCve(res.data.result);
          _this.reportvisible = _this.getReportVisible(res.data.result);
          if (_this.runningCveIds.length > 0) {
            _this.CveScanStatueTimeout = setTimeout(function () {
              _this.updateCveProgress(taskId, cveList);
            }, configs.taskProgressUpdateInterval);
          } else {
            _this.taskInfoVisible = true;
          }
        })
        .catch(function (err) {
          _this.$message.error(err.response.message);
        })
        .finally(function () {
          _this.cveProgressIsLoading = false;
        });
    },
    // 将查询到的cve进度更新到表格数据中，用于数据展示
    addCveProgressToList(progressMap) {
      this.tableData.forEach((cveinfo) => {
        if (progressMap[cveinfo.cve_id]) {
          cveinfo.progress = progressMap[cveinfo.cve_id] && progressMap[cveinfo.cve_id].progress;
          cveinfo.status = progressMap[cveinfo.cve_id] && progressMap[cveinfo.cve_id].status;
        }
      });
      this.tableData = Object.assign([], this.tableData);
    },
    getReportVisible(progressMap) {
      for (const cveId in progressMap) {
        if (progressMap[cveId].status === 'running') {
          return false;
        }
      }
      return true;
    },
    getRunningCve(progressMap) {
      const arr = [];
      for (const cveId in progressMap) {
        if (progressMap[cveId].status === 'running') {
          arr.push(cveId);
        }
      }
      return arr;
    },
    // for repo task
    getHostList() {
      const _this = this;
      this.tableIsLoading = true;
      const pagination = this.pagination || {};
      const filters = this.filters || {};
      clearTimeout(this.repoInfoTimeout);
      getHostUnderRepoTask({
        taskId: this.taskId,
        tableInfo: {
          pagination: {
            current: pagination.current,
            pageSize: pagination.pageSize
          },
          filters: filters
        }
      })
        .then(function (res) {
          _this.tableData = res.data.result || [];
          // 获取数据后调取方法查看是否需要展开
          _this.$nextTick(() => {
            _this.checkCondition();
          });
          _this.pagination = {
            ..._this.pagination,
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: res.data.total_count || (res.data.total_count === 0 ? 0 : pagination.total)
          };
          _this.reportvisible = !_this.hostRepostatusCheck(res.data.result);
          if (_this.hostRepostatusCheck(res.data.result)) {
            _this.repoInfoTimeout = setTimeout(function () {
              _this.getHostList();
            }, configs.taskProgressUpdateInterval);
          }
        })
        .catch(function (err) {
          _this.$message.error(err.response.message);
        })
        .finally(function () {
          _this.tableIsLoading = false;
        });
    },
    hostRepostatusCheck(dataList) {
      const runningHost = dataList.filter((host) => host.status === 'running')[0];
      if (runningHost) {
        return true;
      } else {
        return false;
      }
    },
    executeTask() {
      const _this = this;
      if (this.detail.statuses['running'] > 0) {
        this.$warning({
          title: '有任务正在运行，不能执行。'
        });
        return;
      }
      this.$confirm({
        title: `确定执行任务${this.detail.task_name}?`,
        icon: () => <a-icon type="exclamation-circle" />,
        okText: '执行',
        onOk: function () {
          return executeTask(_this.taskId)
            .then(function (res) {
              _this.$message.success(res.message);
              // 执行任务成功后刷新
              setTimeout(function () {
                _this.getInitalData();
                // const expandedRowKeys = _this.$refs.taskTable.getExpandedRowKeys()
                _this.expandedRowKeys = []
              }, 3000);
              // _this.getInitalData()
            })
            .catch(function (err) {
              _this.$message.error(err.response.message);
            });
        }
      });
    },
    showHostListUnderCve(type, record, innerRecord) {
      this.propType = type;
      this.hostListUnderCveVisible = true;
      this.hostListOfCveId = record.cve_id;
      this.rpmrecord = innerRecord;
    },
    closeHostListUnderCve() {
      this.hostListUnderCveVisible = false;
    },
    getInitalData() {
      this.getInfo();
      switch (this.taskType) {
        case 'cve fix':
          this.getCveList();
          break;
        case 'repo set':
          this.getHostList();
          break;
        case 'cve rollback':
          this.getCveList();
          break;
      }
    },
    handleRollback() {
      const _this = this;
      if (this.detail.statuses['running'] > 0) {
        this.$warning({
          title: '有任务正在运行，不能回滚。'
        });
        return;
      }
      this.$confirm({
        title: (
          <p>
            回滚后无法恢复
            <br />
            请确认回滚CVE修复任务：
          </p>
        ),
        content: _this.selectedRowKeys.map((cveId) => <p>{cveId}</p>),
        icon: () => <a-icon type="exclamation-circle" />,
        okText: '回滚',
        okType: 'danger',
        onOk: function () {
          return rollbackCveTask({
            taskId: _this.taskId,
            cveList: _this.selectedRowKeys
          })
            .then(function (res) {
              _this.$message.success(res.message);
              _this.getInitalData();
            })
            .catch(function (err) {
              _this.$message.error(err.response.message);
            })
            .finally(function () {
              _this.selectedRowKeys = [];
              _this.selectedRowsAll = [];
            });
        }
      });
    },
    onSearch(text) {
      this.pagination = defaultPagination;
      if (!this.filters) {
        this.filters = {};
      }
      if (this.taskType === 'cve fix' || this.taskType === 'cve rollback') {
        if (text !== '') {
          this.filters.cveId = text;
        } else {
          this.filters.cveId = undefined;
        }
        this.getCveList();
      } else {
        if (text !== '') {
          this.filters.host_name = text;
        } else {
          this.filters.host_name = undefined;
        }
        this.getHostList();
      }
    },
    checkCondition() {
      this.$nextTick(() => {
        const elements1 = document.querySelectorAll('.ant-table-row-expand-icon-cell')
        const elements2 = document.querySelectorAll('.ant-table-expand-icon-th')
        if (this.taskType !== 'cve fix') {
          elements1.forEach(el => {
            el.style.width = '0'
            el.style.border = '0 !important'
            el.style.display = 'none'
          })
          elements2.forEach(el => {
            el.style.width = '0'
            el.style.border = '0 !important'
            el.style.display = 'none'
          })
        }
      });
    }
  },
  created() {
    // 防止页面刷新后query参数丢失，将任务ID存储在内存中
    if (localStorage.getItem('taskId')) {
      this.taskId = localStorage.getItem('taskId')
    }
    this.taskId = this.$route.params.taskId || this.taskId
    localStorage.setItem('taskId', this.taskId)
  },
  mounted: function () {
    this.getInitalData();
  },
  beforeDestroy() {
    // 离开页面前，若当前存在轮询，清除轮询
    if (this.progressUpdateCaller || this.CveScanStatueTimeout || this.repoInfoTimeout) {
      clearInterval(this.progressUpdateCaller);
      clearInterval(this.CveScanStatueTimeout);
      clearInterval(this.repoInfoTimeout);
      this.progressUpdateCaller = null;
      this.CveScanStatueTimeout = null;
      this.repoInfoTimeout = null;
    }
  }
};
</script>

<style lang="less" scoped>
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

.task-status {
}

.result-label {
  text-align: right;
}
.result-content {
  white-space: pre;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 4px;
}

.detail-info-content {
  h1 {
    font-size: 24px;
    font-weight: bold;
    color: rgba(0, 0, 0, 0.65);
  }
  padding: 0 12px 0 24px;
}
.reuslt-item-title {
  font-weight: 500;
  color: rgba(0, 0, 0, 0.85);
}
/deep/ .ant-descriptions-item {
  .ant-descriptions-item-label {
    font-weight: 500;
  }
}
.result-log {
  border: 1px solid #ddd;
  border-radius: 3px;
  padding: 4px 6px 20px;
}
</style>
