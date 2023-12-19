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
          </a-row>
          <a-row type="flex"> </a-row>
          <a-row>
            <a-col :span="8">
              <p>
                最新状态
                <a-tooltip placement="top">
                  <template slot="title">
                    <span>{{
                      taskType === 'cve fix' ? `修复成功` : taskType === 'cve rollback' ? `已回滚` : `已设置`
                    }}</span>
                  </template>
                  <span
                    ><a-icon type="check-circle" class="color-check-circle" />{{
                      detail.statuses && detail.statuses['succeed']
                    }}</span
                  >
                </a-tooltip>
                <a-tooltip placement="top">
                  <template slot="title">
                    <span>{{
                      taskType === 'cve fix' ? `待修复` : taskType === 'cve rollback' ? `未回滚` : `未设置`
                    }}</span>
                  </template>
                  <span
                    ><a-icon type="close-circle" class="color-close-circle" />{{
                      detail.statuses && detail.statuses['fail']
                    }}</span
                  >
                </a-tooltip>
                <a-tooltip placement="top">
                  <template slot="title">
                    <span>运行中</span>
                  </template>
                  <span>
                    <a-icon
                      v-if="detail.statuses && detail.statuses['running']"
                      type="loading"
                      class="color-running-circle"
                    />
                    <a-icon v-else type="loading-3-quarters" />
                    {{ detail.statuses && detail.statuses['running'] }}
                  </span>
                </a-tooltip>
                <a-tooltip placement="top">
                  <template slot="title">
                    <span>未知</span>
                  </template>
                  <span
                    ><a-icon type="question-circle" class="color-standby-circle" />{{
                      detail.statuses && detail.statuses['unknown']
                    }}</span
                  >
                </a-tooltip>
              </p>
            </a-col>
            <a-col :span="16">
              <p>
                上次执行时间：{{
                  detail.latest_execute_time
                    ? dateFormat('YYYY-mm-dd HH:MM:SS', detail.latest_execute_time * 1000)
                    : '未执行'
                }}
                <a
                  v-if="reportvisible && detail.latest_execute_time"
                  @click="jumptoResult(detail.latest_execute_time)"
                  target="blank"
                  >查看报告</a
                >
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
        <a-col>
          <a-row type="flex" :gutter="6">
            <a-col>
              <a-input-search
                :placeholder="taskType === 'hotpatch remove' ? `按CVE ID搜索` : `按主机名或IP搜索`"
                style="width: 200px"
                maxLength="20"
                @search="onSearch"
              />
            </a-col>
          </a-row>
        </a-col>
        <a-col v-if="taskType === 'cve fix'">
          <a-button type="primary" @click="generateRollbackTask" :loading="isRollBackButtonLoading"
            >生成回滚任务</a-button
          >
        </a-col>
      </a-row>
      <!-- 热补丁移除任务 -->
      <a-table
        v-if="taskType === 'hotpatch remove'"
        :rowKey="rowKeyMap[taskType]"
        :columns="hotpatchColumns"
        @change="handleTableChange"
        :data-source="tableData"
        :pagination="pagination"
        :loading="tableIsLoading"
      >
        <span slot="package" slot-scope="packageitem">{{ packageitem || '——' }}</span>
        <a slot="host_num" slot-scope="host_num, record" @click="showHostListUnderCve('host', record)">
          {{ host_num }}
        </a>
        <div slot="status" slot-scope="status">
          <span class="task-status">
            <a-badge :status="statusValueMap[status]" />
            {{ patchRemoveStatusTextMap[status] }}
            <a-icon v-if="statusValueMap[status] === 'processing'" type="loading" class="color-running-circle" />
          </span>
        </div>
        <div slot="progress" slot-scope="progress, record">
          <a-progress
            :percent="detail.latest_execute_time ? Math.ceil(((progress || 0) / record.host_num) * 100) : 0"
          />
        </div>
      </a-table>
      <!-- cve修复、回滚任务 -->
      <a-table
        v-else
        :rowKey="rowKeyMap[taskType]"
        :columns="taskType === 'cve fix' || taskType === 'cve rollback' ? cveColumns : repoColumns"
        :data-source="tableData"
        :pagination="pagination"
        @change="handleTableChange"
        @expand="expand"
        :expanded-row-keys.sync="expandedRowKeys"
        :loading="tableIsLoading"
      >
        <div slot="status" slot-scope="status">
          <span class="task-status">
            <a-badge :status="statusValueMap[status]" />
            {{
              taskType === 'cve fix'
                ? cveStatusTextMap[status]
                : taskType === 'cve rollback'
                ? rollStatusTextMap[status]
                : repoStatusTextMap[status]
            }}
            <a-icon v-if="statusValueMap[status] === 'processing'" type="loading" class="color-running-circle" />
          </span>
        </div>
        <div v-if="['cve fix', 'cve rollback'].includes(taskType)" slot="expandedRowRender" slot-scope="record">
          <a-table rowKey="id" :columns="innerColumns" :data-source="record.rpms || []" :pagination="false">
            <div slot="status" slot-scope="status">
              <span>
                <a-badge :status="statusValueMap[status]" />
                {{
                  taskType === 'cve fix'
                    ? cveStatusTextMap[status]
                    : taskType === 'cve rollback'
                    ? rollStatusTextMap[status]
                    : repoStatusTextMap[status]
                }}
                <a-icon v-if="statusValueMap[status] === 'processing'" type="loading" class="color-running-circle" />
              </span>
            </div>
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
      :rpmrecord="rpmrecord"
    />
    <!--  创建回滚任务的弹窗 -->
    <a-modal :closable="false" v-model="isRollbackModelvisible" :footer="null" destroyOnClose title="创建成功">
      <a-row type="flex" :gutter="12">
        <a-col>
          <a-icon type="check-circle" style="font-size: 32px; color: #52c41a" />
        </a-col>
        <a-col>
          <h3>创建回滚任务成功</h3>
          <p><a @click="jumpToDetail">点击跳转到该任务页面</a></p>
          <p>{{ countDown }}秒后回到原页面</p>
        </a-col>
      </a-row>
      <a-row type="flex" justify="end">
        <a-button type="primary" @click="isRollbackModelvisible = false"> 关闭 </a-button>
      </a-row>
    </a-modal>
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
  getCveListInRollbackDetail,
  getCveHotpatchRemoveDetail,
  getHostUnderRepoTask,
  getRpmListInFixDetail,
  getCveListInFixDetail,
  getRpmListInRollbackDetail,
  executeTask,
  scanHost,
  getTaskProgress,
  generateRollbackTask,
  getCveProgressUnderCveTask,
  getAllHostInDetail,
  getHostScanStatus
} from '@/api/leaks';
import configs from '@/config/defaultSettings';

const taskTypeMap = {
  'cve fix': 'cve修复',
  'repo set': 'REPO设置',
  'cve rollback': 'cve回滚',
  'hotpatch remove': '热补丁移除'
};
const rowKeyMap = {
  'cve fix': 'host_id',
  'cve rollback': 'host_id',
  'repo set': 'host_id',
  'hotpatch remove': 'cve_id'
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

const patchRemoveStatusTextMap = {
  succeed: '移除成功',
  fail: '移除失败',
  running: '移除中',
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
  None: 'default',
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
      // 生成回滚任务按钮是否loading
      isRollBackButtonLoading: false,
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
      selectedRowKeys: [],
      selectedRowsAll: [],
      // 每个cve下host详情数据
      hostListUnderCveVisible: false,
      hostListOfCveId: null,
      cveStatusTextMap,
      repoStatusTextMap,
      rollStatusTextMap,
      patchRemoveStatusTextMap,
      taskTypeMap,
      rowKeyMap,
      statusValueMap,
      // rpm列表是否为展开状态
      isRpmTableExtend: false,
      isRollbackModelvisible: false,
      countDown: 0,
      rollbackTaskId: '',
      jumpModalInterval: null,
      // 详情页面下要执行任务的所有主机
      hostList: []
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
    // cve列表列号
    cveColumns() {
      let {filters} = this;
      filters = filters || {};
      return [
        {
          dataIndex: 'host_name',
          key: 'host_name',
          title: '主机名',
          scopedSlots: {customRender: 'hostName'}
        },
        {
          dataIndex: 'host_ip',
          key: 'host_ip',
          title: '主机IP',
          scopedSlots: {customRender: 'hostIP'}
        },
        {
          dataIndex: 'cve_num',
          key: 'cve_num',
          title: 'CVE数量',
          scopedSlots: {customRender: 'cveNum'}
        },
        {
          dataIndex: 'status',
          key: 'status',
          title: this.taskType === 'cve fix' ? '修复状态' : '回滚状态',
          scopedSlots: {customRender: 'status'},
          filters:
            this.taskType === 'cve fix'
              ? [
                  {text: '修复成功', value: 'succeed'},
                  {text: '待修复', value: 'fail'},
                  {text: '运行中', value: 'running'},
                  {text: '未知', value: 'unknown'}
                ]
              : [
                  {text: '回滚成功', value: 'succeed'},
                  {text: '待回滚', value: 'fail'},
                  {text: '运行中', value: 'running'},
                  {text: '未知', value: 'unknown'}
                ],
          filteredValue: filters.status || null,
          onFilter: (value, record) => record.status.includes(value)
        }
      ];
    },

    repoColumns() {
      let {filters} = this;
      filters = filters || {};
      return [
        {
          dataIndex: 'host_name',
          title: '主机名',
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
    // 展开后的列表列号
    innerColumns() {
      const {taskType} = this;
      return [
        {
          dataIndex: 'installed_rpm',
          key: 'installed_rpm',
          title: taskType === 'cve fix' ? '受影响rpm' : '已安装rpm'
        },
        {
          dataIndex: taskType === 'cve fix' ? 'available_rpm' : 'target_rpm',
          key: taskType === 'cve fix' ? 'available_rpm' : 'target_rpm',
          title: taskType === 'cve fix' ? '待安装rpm' : '目标rpm',
          scopedSlots: {customRender: 'rpm'}
        },
        {
          dataIndex: 'cves',
          key: 'cves',
          title: 'CVE'
        },
        {
          dataIndex: 'status',
          key: 'rpm_status',
          title: this.taskType === 'cve fix' ? '修复状态' : '回滚状态',
          scopedSlots: {customRender: 'status'},
          filter:
            this.taskType === 'cve fix'
              ? [
                  {text: '修复成功', value: 'succeed'},
                  {text: '待修复', value: 'fail'},
                  {text: '运行中', value: 'running'},
                  {text: '未知', value: 'unknown'}
                ]
              : [
                  {text: '回滚成功', value: 'succeed'},
                  {text: '待回滚', value: 'fail'},
                  {text: '运行中', value: 'running'},
                  {text: '未知', value: 'unknown'}
                ]
        }
      ];
    },
    hotpatchColumns() {
      let {filters} = this;
      filters = filters || {};
      return [
        {
          dataIndex: 'cve_id',
          key: 'cve_id',
          title: 'CVE ID',
          scopedSlots: {customRender: 'cveId'}
        },
        {
          dataIndex: 'host_num',
          key: 'host_num',
          title: '主机',
          scopedSlots: {customRender: 'host_num'}
        },
        {
          dataIndex: 'package',
          key: 'package',
          title: '解决方案',
          scopedSlots: {customRender: 'package'}
        },
        {
          dataIndex: 'progress',
          title: '执行进度（已处理/总数）',
          scopedSlots: {customRender: 'progress'}
        },
        {
          dataIndex: 'status',
          title: '移除状态',
          scopedSlots: {customRender: 'status'},
          filteredValue: filters.status || null,
          filters: [
            {text: '移除成功', value: 'succeed'},
            {text: '待移除', value: 'fail'},
            {text: '运行中', value: 'running'},
            {text: '未知', value: 'unknown'}
          ]
        }
      ];
    },
    hotPatchInnerColums() {
      return [
        {
          dataIndex: 'installed_rpm',
          key: 'installed_rpm',
          title: '受影响rpm'
        },
        {
          dataIndex: 'available_rpm',
          key: 'available_rpm',
          title: '待安装rpm'
        },
        {
          dataIndex: 'fix_way',
          key: 'fix_way',
          title: '修复方式'
        },
        {
          dataIndex: 'host_list',
          key: 'host_list',
          title: '主机数量'
        }
      ];
    }
  },
  methods: {
    // 生成跳转到指定回滚任务里
    jumpToDetail() {
      clearInterval(this.jumpModalInterval);
      this.isRollbackModelvisible = false;
      this.$router.push({
        path: `/leaks/task/cve rollback/${this.rollbackTaskId}`,
        query: {
          task_id: this.rollbackTaskId
        }
      });
      this.expandedRowKeys = [];
      this.taskType = 'cve rollback';
      this.taskId = this.rollbackTaskId;
      localStorage.setItem('taskId', this.taskId);
      this.getInitalData();
    },
    async generateRollbackTask() {
      this.isRollBackButtonLoading = true;
      if (this.detail.statuses['running'] > 0) {
        this.$warning({
          title: '有任务正在运行，不能回滚。'
        });
        this.isRollBackButtonLoading = false;
        return;
      }
      const res = await generateRollbackTask(this.taskId);
      if (res) {
        this.rollbackTaskId = res.data.task_id;
        this.countDown = 5;
        this.isRollbackModelvisible = true;
        this.jumpModalInterval = setInterval(() => {
          this.countDown = this.countDown - 1;
          if (this.countDown === 0) {
            clearInterval(this.jumpModalInterval);
            this.isRollbackModelvisible = false;
          }
        }, 1000);
        this.isRollBackButtonLoading = false;
      } else {
      }
    },
    dateFormat,
    jumptoResult(value) {
      this.$router.push({
        path: `/leaks/task-report/${this.taskType}/${this.taskId}`,
        query: {
          taskId: this.taskId,
          taskType: this.taskType,
          latestExecuteTime: value
        }
      });
    },
    // 获取修复任务下rpm列表
    async getRpmListWithFix(info) {
      const res = await getRpmListInFixDetail({
        taskId: this.taskId,
        hostId: info.host_id
      });
      return res || null;
    },
    // 获取回滚任务下rpm列表
    async getRpmListWithRollback(info) {
      const res = await getRpmListInRollbackDetail({
        taskId: this.taskId,
        hostId: info.host_id
      });
      return res || null;
    },
    // 展开详情列表
    async expand(expanded, record) {
      if (!expanded) return;
      this.tableIsLoading = true;
      const res =
        this.taskType === 'cve fix' ? await this.getRpmListWithFix(record) : await this.getRpmListWithRollback(record);
      if (res) {
        record.rpms = res.data;
      }
      this.tableIsLoading = false;
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
      } else if (this.taskType === 'hotpatch remove') {
        this.getCveListWithHotpathRemove();
      } else {
        this.getHostList();
      }
    },
    resetSelection() {
      this.selectedRowKeys = [];
      this.selectedRowsAll = [];
    },
    getInfo() {
      this.infoLoading = true;
      getTaskInfo({
        taskId: this.taskId
      })
        .then((res) => {
          this.detail = res.data.result || {};
          this.detail.statuses = {};
          this.updateProgress([this.taskId]);
        })
        .catch((err) => {
          this.$message.error(err.response.message);
        })
        .finally(() => {
          this.infoLoading = false;
        });
    },
    // 轮训当前任务进度，没用running状态时停止
    updateProgress(taskList) {
      this.progressLoading = true;
      clearTimeout(this.progressUpdateCaller);
      getTaskProgress({taskList})
        .then((res) => {
          this.detail.statuses = res.data.result && res.data.result[this.taskId];
          this.detail = Object.assign({}, this.detail);
          if (!this.prgressFinishedCheck(res.data.result)) {
            this.progressUpdateCaller = setTimeout(() => {
              this.updateProgress(taskList);
            }, configs.taskProgressUpdateInterval);
          }
        })
        .catch((err) => {
          this.$message.error(err.response.message);
        })
        .finally(() => {
          this.progressLoading = false;
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
    // 获取修复任务cve列表
    async getCveListWithFix() {
      const pagination = this.pagination || {};
      const filters = this.filters || {};
      const sorter = this.sorter || {};
      const res = await getCveListInFixDetail({
        taskId: this.taskId,
        tableInfo: {
          pagination: {
            current: pagination.current,
            pageSize: pagination.pageSize
          },
          filters,
          sorter: {
            field: sorter.field,
            order: sorter.order
          }
        }
      });
      return res || null;
    },
    // 获取回滚任务cve列表
    async getCveListWithRollback() {
      const pagination = this.pagination || {};
      const filters = this.filters || {};
      const sorter = this.sorter || {};
      const res = await getCveListInRollbackDetail({
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
      });
      return res || null;
    },
    // 获取热补丁回退列表
    async getCveListWithHotpathRemove(needScan = false) {
      this.tableIsLoading = true;
      const pagination = this.pagination || {};
      const filters = this.filters || {};
      const sorter = this.sorter || {};
      const res = await getCveHotpatchRemoveDetail({
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
      });
      if (res) {
        this.tableData = res.data.result;
        this.reportvisible = this.getReportVisible(res.data.result);
        this.expandedRowKeys = [];
        this.pagination = {
          ...this.pagination,
          total: res.data.total_count || (res.data.total_count === 0 ? 0 : pagination.total)
        };
        this.tableIsLoading = false;
        await this.updateCveProgress(
          this.taskId,
          res.data.result.map((cve) => cve.cve_id),
          needScan
        );
      }
    },
    // 获取cve列表（修复，回滚）
    async getCveList(needScan = false) {
      this.tableIsLoading = true;
      const res = this.taskType === 'cve fix' ? await this.getCveListWithFix() : await this.getCveListWithRollback();
      if (res) {
        this.tableData = res.data.result.map((item) => ({
          ...item,
          rpms: []
        }));
        this.reportvisible = this.getReportVisible(res.data.result);
        // this.expandedRowKeys = [];
        this.pagination = {
          ...this.pagination,
          total: res.data.total_count || (res.data.total_count === 0 ? 0 : this.pagination.total)
        };
        !this.reportvisible && (await this.updateHostProgress(needScan));
        this.tableIsLoading = false;
      }
    },
    // 修复，回滚任务running时刷新列表状态
    async updateHostProgress(needScan = false) {
      clearTimeout(this.CveScanStatueTimeout);
      const res = this.taskType === 'cve fix' ? await this.getCveListWithFix() : await this.getCveListWithRollback();
      const progressRes = res.data.result;
      progressRes.forEach((item) => {
        const i = this.tableData.findIndex((t) => t.host_id === item.host_id);
        if (i > -1 && this.tableData[i].status !== item.status) {
          this.tableData[i].status = item.status;
          if (this.expandedRowKeys.includes(this.tableData[i].host_id)) this.expand(true, this.tableData[i]);
        }
      });

      const list = progressRes.filter((item) => item.status === 'running');
      this.reportvisible = list.length === 0;
      if (list.length > 0) {
        this.CveScanStatueTimeout = setTimeout(() => {
          this.updateHostProgress(needScan);
        }, configs.taskProgressUpdateInterval);
      } else {
        needScan && (await this.sacnHostAfterExcute());
      }
    },

    // 在任务执行完成之后进行主机扫描
    async sacnHostAfterExcute() {
      const hostList = await this.getAllHostId();
      const res = await getHostScanStatus({hostList});
      if (!res) return;
      const hostStatusList = res.data.result;
      const needScanList = Object.keys(hostStatusList).map((h) => {
        if (hostStatusList[h] !== 3 && hostList.includes(Number(h))) return Number(h);
      });
      this.scanLeakAfterExecuteTask(needScanList);
    },
    // 返回扫描状态的主机
    getScanningHost(scanMap, hostList) {
      const arr = [];
      hostList.forEach((host) => {
        if (scanMap[host.host_id] === 3) {
          arr.push(host);
        }
      });
      return arr;
    },
    /**
     * 更新热补丁回退的执行进度
     * @param {*} taskId 任务id
     * @param {*} cveList cve 列表
     * @param {*} needScan 是否需要扫描主机
     */
    async updateCveProgress(taskId, cveList, needScan = false) {
      clearTimeout(this.CveScanStatueTimeout);
      const processRes = await getCveProgressUnderCveTask({
        taskId,
        cveList
      });
      this.addCveProgressToList(processRes.data.result);
      this.reportvisible = this.getReportVisible(processRes.data.result);
      this.runningCveIds = this.getRunningCve(processRes.data.result);
      if (this.runningCveIds.length > 0) {
        this.CveScanStatueTimeout = setTimeout(() => {
          this.updateCveProgress(taskId, cveList, needScan);
        }, configs.taskProgressUpdateInterval);
      } else {
        needScan && (await this.sacnHostAfterExcute());
      }
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
    // 判断当前修复任务是否都已经完成
    getReportVisible(progressMap) {
      if (this.taskType === 'hotpatch remove') {
        for (const cveId in progressMap) {
          if (progressMap[cveId].status === 'running') {
            return false;
          }
        }
      } else {
        for (const item of progressMap) {
          if (item.status === 'running') {
            return false;
          }
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
        .then((res) => {
          this.tableData = res.data.result || [];
          // 获取数据后调取方法查看是否需要展开
          this.$nextTick(() => {
            this.checkCondition();
          });
          this.pagination = {
            ...this.pagination,
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: res.data.total_count || (res.data.total_count === 0 ? 0 : pagination.total)
          };
          this.reportvisible = !_this.hostRepostatusCheck(res.data.result);
          if (this.hostRepostatusCheck(res.data.result)) {
            this.repoInfoTimeout = setTimeout(() => {
              this.getHostList();
            }, configs.taskProgressUpdateInterval);
          }
        })
        .catch((err) => {
          this.$message.error(err.response.message);
        })
        .finally(() => {
          this.tableIsLoading = false;
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
        onOk: async () => {
          const excuteRes = await executeTask(this.taskId);
          if (excuteRes) {
            // 获取详情任务所有处理的hostid列表
            this.$message.success(excuteRes.message);
            // 执行任务成功后刷新
            setTimeout(() => {
              this.getInitalData(true);
              this.expandedRowKeys = [];
            }, 3000);
          }
        }
      });
    },
    async scanLeakAfterExecuteTask(hostList) {
      await scanHost({
        hostList,
        filter: null
      });
    },
    // 获取所有的host_id列表用于执行任务后扫描漏洞
    async getAllHostId() {
      const res = await getAllHostInDetail(this.taskId);
      if (res) {
        return res.data;
      }
    },
    showHostListUnderCve(type, record) {
      this.propType = type;
      this.hostListUnderCveVisible = true;
      this.hostListOfCveId = record.cve_id;
    },
    closeHostListUnderCve() {
      this.hostListUnderCveVisible = false;
    },
    /**
     * isFresh 是第一次初始化还是后续的刷新数据
     */
    getInitalData(isFresh = false) {
      this.getInfo();
      if (this.taskType === 'repo set') {
        this.getHostList();
      } else if (this.taskType === 'hotpatch remove') {
        this.getCveListWithHotpathRemove(isFresh);
      } else {
        this.getCveList(isFresh);
      }
    },

    onSearch(text) {
      // 搜索后重新获取列表，关闭所有展开的列表
      this.expandedRowKeys = [];
      this.pagination = defaultPagination;
      if (!this.filters) {
        this.filters = {};
      }
      if (this.taskType === 'hotpatch remove') {
        if (text !== '') {
          this.filters.cveId = text;
        } else {
          this.filters.cveId = undefined;
        }
        this.getCveListWithHotpathRemove();
        return;
      }
      if (this.taskType === 'cve fix' || this.taskType === 'cve rollback') {
        if (text !== '') {
          this.filters.searchKey = text;
        } else {
          this.filters.searchKey = undefined;
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
        const elements1 = document.querySelectorAll('.ant-table-row-expand-icon-cell');
        const elements2 = document.querySelectorAll('.ant-table-expand-icon-th');
        if (this.taskType !== 'cve fix') {
          elements1.forEach((el) => {
            el.style.width = '0';
            el.style.border = '0 !important';
            el.style.display = 'none';
          });
          elements2.forEach((el) => {
            el.style.width = '0';
            el.style.border = '0 !important';
            el.style.display = 'none';
          });
        }
      });
    }
  },
  created() {
    // 防止页面刷新后query参数丢失，将任务ID存储在内存中
    if (localStorage.getItem('taskId')) {
      this.taskId = localStorage.getItem('taskId');
    }
    this.taskId = this.$route.params.taskId || this.taskId;
    localStorage.setItem('taskId', this.taskId);
  },
  mounted() {
    this.getInitalData(false);
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
