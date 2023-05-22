<template>
  <div>
    <a-row class="aops-app-table-control-row" type="flex" justify="space-between">
      <a-col>
        <a-radio-group v-if="!standalone" default-value="a" button-style="solid" @change="handleAffectChange">
          <a-radio-button value="a">
            未修复
          </a-radio-button>
          <a-radio-button value="c">
            已修复
          </a-radio-button>
          <a-radio-button value="b">
            不受影响
          </a-radio-button>
        </a-radio-group>
        <a-radio-group v-else default-value="a" button-style="solid" @change="handleFixChange">
          <a-radio-button value="a">
            未修复
          </a-radio-button>
          <a-radio-button value="b">
            已修复
          </a-radio-button>
        </a-radio-group>
        <a-input-search placeholder="按CVE ID搜索" style="width: 200px;margin-left: 10px;" v-model="cveSearch" @change="searchChange" @search="onSearch" />
      </a-col>
      <a-col>
        <a-row type="flex" :gutter="6">
          <a-col v-if="selectedRowKeys.length > 0">
            <a-alert type="info" show-icon>
              <div slot="message">
                <span>{{ `已选择` + selectedRowKeys.length + `项` }}</span>
                <a @click="resetSelection"> 清除选择</a>
              </div>
            </a-alert>
          </a-col>
        </a-row>
      </a-col>
      <a-col>
        <a-row type="flex" :gutter="6">
          <!-- <a-col>
            <status-change-modal
            :selectedRowsAll="selectedRowsAll"
              @statusUpdated="handleStatusUpdated" />
          </a-col> -->
          <a-col>
            <upload-file v-if="standalone ? true : false" @addSuccess="handleUploadSuccess" />
          </a-col>
          <div v-if="fixed || rollback">
            <a-col v-if="selectedRowKeys.length === 0">
            <!-- 回滚按钮 -->
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
          </div>
          <div v-else>
            <a-col v-if="selectedRowKeys.length === 0 && affected">
              <create-repair-task-drawer
                text="生成修复任务"
                taskType="cve fix"
                :fixed="fixed"
                :cveListProps="standalone ? cveAllList : cveAllListProp"
                :loading="standalone ? cveAllIsLoading : cveAllIsLoadingProp"
                :hostListType="standalone ? 'byLoading' : 'byOneHost'"
                :hostList="hostList"
                @createSuccess="handleTaskCreateSuccess" />
            </a-col>
            <a-col v-if="selectedRowKeys.length !== 0 && affected">
              <create-repair-task-drawer
                taskType="cve fix"
                :fixed="fixed"
                :cveListProps="selectedRowsAll"
                :hostListType="standalone ? 'byLoading' : 'byOneHost'"
                :hostList="hostList"
                @createSuccess="handleTaskCreateSuccess" />
            </a-col>
          </div>
          <a-col>
            <a-button @click="handleRefresh">
              <a-icon type="redo" />
            </a-button>
          </a-col>
        </a-row>
      </a-col>
    </a-row>
    <a-table
      rowKey="cve_id"
      :columns="standalone ? tableColumnsStandalone : tableColumns"
      :data-source="standalone ? tableData : inputList"
      :pagination="pagination.total === 0 ? false : pagination"
      :rowSelection="rowSelection"
      :expandIconAsCell="false"
      :expandIconColumnIndex="1"
      @change="handleTableChange"
      :loading="standalone ? tableIsLoading : inputLoading">
      <router-link
      :to="{path: `/leaks/cves-management/${id}`}"
      slot="cve_id"
        slot-scope="id">{{ id }}</router-link>
      <div slot="expandedRowRender" slot-scope="record" style="margin: 0">
        <p>Description:</p>
        <p>{{ record.description }}</p>
      </div>
      <div slot="hotpatch" slot-scope="hotpatch" style="margin: 0">
        <p>{{ hotpatch ? '是' : '否' }}</p>
      </div>
    </a-table>
  </div>
</template>

<script>
/**
 * cve表格组件
 * cve 表格的业务逻辑公共组件。根据props中standalone属性确定是自动获取列表信息，还是通过外部获取列表信息。
 */

import CreateRepairTaskDrawer from './CreateRepairTaskDrawer';
import StatusChangeModal from './StatusChangeModal';
import {getSelectedRow} from '../utils/getSelectedRow';
import {getCveList} from '@/api/leaks';

import { severityMap } from '../config';
import UploadFile from './UploadFile.vue';

const defaultPagination = {
  current: 1,
  pageSize: 10,
  showTotal: (total) => `总计 ${total} 项`,
  showSizeChanger: true,
  showQuickJumper: true
};

export default {
  name: 'CVEsTable',
  components: {
    CreateRepairTaskDrawer,
    StatusChangeModal,
    UploadFile
  },
  props: {
    // 判断表格是自己发起请求获取数据还是，触发事件通过父组件获取列表数据
    standalone: {
      type: Boolean,
      default: false
    },
    // 如果通过父组件获取数据，则此属性为外部传入的列表数据
    inputList: {
      type: Array,
      default: () => []
    },
    inputLoading: {
      type: Boolean,
      default: false
    },

    /*
     * 生成修复任务时，如果任务中的host是指定的，则使用此属性
     * 目前只有主机详情页中生成修复任务时会用到
     */
    hostList: {
      type: Array,
      default: () => []
    },
    // 当通过父组件获取数据时，通过此属性同步数据的最大数量
    paginationTotal: {
      type: Number,
      default: 0
    },
    // 当通过父组件获取全量cve列表数据时，使用此属性
    cveAllListProp: {
      type: Array,
      default: () => []
    },
    cveAllIsLoadingProp: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    tableColumnsStandalone() {
      let {filters} = this;
      filters = filters || {};
      return [
        {
          dataIndex: 'cve_id',
          key: 'cve_id',
          title: 'CVE_ID',
          sorter: true,
          scopedSlots: {customRender: 'cve_id'},
          width: 250
        },
        {
          dataIndex: 'publish_time',
          key: 'publish_time',
          customRender: (publishTime) => publishTime === '' ? '—' : publishTime,
          title: '发布时间',
          sorter: true
        },
        {
          dataIndex: 'severity',
          key: 'severity',
          title: '严重性',
          customRender: (severity) => severityMap[severity] || '—',
          filteredValue: filters.severity || null,
          filters: [
            {
              text: '严重',
              value: 'Critical'
            },
            {
              text: '高风险',
              value: 'High'
            },
            {
              text: '中风险',
              value: 'Medium'
            },
            {
              text: '低风险',
              value: 'Low'
            },
            {
              text: '未知',
              value: 'Unknown'
            }
          ]
        },
        {
          dataIndex: 'cvss_score',
          key: 'cvss_score',
          customRender: (cvssScore) => cvssScore === '' ? '—' : cvssScore,
          title: 'CVSS 分数',
          sorter: true
        },
        {
          dataIndex: 'host_num',
          key: 'host_num',
          title: '主机',
          sorter: true
        }
      ];
    },
    tableColumns() {
      let {filters} = this;
      filters = filters || {};
      return [
        {
          dataIndex: 'cve_id',
          key: 'cve_id',
          title: 'CVE_ID',
          scopedSlots: {customRender: 'cve_id'},
          width: 250
        },
        {
          dataIndex: 'publish_time',
          key: 'publish_time',
          title: '发布时间',
          sorter: true
        },
        {
          dataIndex: 'severity',
          key: 'severity',
          title: '严重性',
          customRender: (severity) => severityMap[severity],
          filteredValue: filters.severity || null,
          filters: [
            {
              text: '严重',
              value: 'Critical'
            },
            {
              text: '高风险',
              value: 'High'
            },
            {
              text: '中风险',
              value: 'Medium'
            },
            {
              text: '低风险',
              value: 'Low'
            },
            {
              text: '未知',
              value: 'Unknown'
            }
          ]
        },
        {
          dataIndex: 'cvss_score',
          key: 'cvss_score',
          title: 'CVSS 分数',
          sorter: true
        },
        {
          dataIndex: 'hotpatch',
          key: 'hotpatch',
          title: '热补丁支持',
          filteredValue: filters.hotpatch || null,
          filters: [
            {
              text: '是',
              value: 1
            },
            {
              text: '否',
              value: 0
            }
          ],
          scopedSlots: {customRender: 'hotpatch'}
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
  watch: {
    paginationTotal () {
      this.$set(this.pagination, 'total', this.paginationTotal)
    }
  },
  data() {
    return {
      cveSearch: '',
      scanloading: false,
      size: 'small',
      tableData: [],
      tableIsLoading: false,
      // pagination control
      pagination: defaultPagination,
      filters: null,
      sorter: null,
      // selection control
      selectedRowKeys: [],
      selectedRowsAll: [],
      // standalone模式下获取全量cve数据
      cveAllList: [],
      cveAllIsLoading: false,
      // 控制上传弹框显隐
      upLoadFileVisible: false,
      fixed: false,
      // 控制获取的cve是否被修复的变量，默认为未修复
      affected: true,
      // 控制获取的cve是否受影响的变量，默认为受影响
      rollback: false
    };
  },
  methods: {
    searchChange() {
      console.log(this.cveSearch)
      if (!this.filters) {
        this.filters = {};
      }
      if (this.cveSearch !== '') {
        this.filters.cveId = this.cveSearch;
      } else {
        this.filters.cveId = undefined;
      }
    },
    handleAffectChange(e) {
      if (!this.standalone) {
        if (e.target.value === 'a') {
          this.fixed = undefined
          this.affected = true;
          this.rollback = false;
        } else if (e.target.value === 'b') {
          this.fixed = undefined
          this.affected = false;
          this.rollback = false;
        } else {
          this.fixed = true;
          this.affected = true;
          this.rollback = true;
        }
        this.selectedRowKeys = []
        this.getCves();
      } else {
        console.log(e.target.value)
      }
    },
    handleFixChange(e) {
      if (e.target.value === 'a') {
          this.fixed = false;
        } else {
          this.fixed = true;
        }
      this.selectedRowKeys = []
      this.getCves();
    },
    handleTableChange(pagination, filters, sorter) {
      // 存储翻页状态
      this.pagination = pagination;
      this.filters = Object.assign({}, this.filters, filters);
      this.sorter = sorter;
      // 出发排序、筛选、分页时，重新请求主机列表
      this.getCves();
    },
    onSelectChange(selectedRowKeys, selectedRows) {
      const tableData = this.standalone ? this.tableData : this.inputList;
      this.selectedRowKeys = selectedRowKeys;
      this.selectedRowsAll = getSelectedRow(selectedRowKeys, this.selectedRowsAll, tableData, 'cve_id');
    },
    resetSelection() {
      this.selectedRowKeys = [];
      this.selectedRowsAll = [];
    },
    handleRefresh() {
      this.selectedRowKeys = [];
      this.selectedRowsAll = [];
      this.getCves();
    },
    handleReset() {
      this.pagination = defaultPagination;
      this.sorter = null;
      this.filters = null;
      this.selectedRowKeys = [];
      this.selectedRowsAll = [];
      this.getCves();
    },
    // 获取cve列表数据
    getCves() {
      const _this = this;
      this.tableIsLoading = true;
      const pagination = this.pagination || {};
      const filters = this.filters || {};
      const sorter = this.sorter || {};
      // 非standalone模式下，触发事件通过父组件获取数据
      if (!this.standalone) {
        this.$emit('getTableData', {
          tableInfo: {
            pagination: {
              current: pagination.current,
              pageSize: pagination.pageSize
            },
            filters: filters,
            affected: this.affected,
            fixed: this.fixed,
            sorter: {
              field: sorter.field,
              order: sorter.order
            }
          }
        });
        return;
      }
      getCveList({
        tableInfo: {
          pagination: {
            current: pagination.current,
            pageSize: pagination.pageSize
          },
          filters: filters,
          affected: this.affected,
          fixed: this.fixed,
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
        })
        .catch(function (err) {
          _this.$message.error(err.response.message);
        })
        .finally(function () {
          _this.tableIsLoading = false;
        });
    },
    // 获取全部cve数据，用于生成修复任务时选择全部cve
    getCvesAll() {
      const _this = this;
      // this.cveAllIsLoading = true;
      if (!this.standalone) {
        this.$emit('getCveAll', {
          tableInfo: {
            pagination: {},
            filters: {},
            sorter: {}
          }
        });
        return;
      }
      getCveList({
        tableInfo: {
          pagination: {},
          filters: {},
          affected: this.affected,
          fixed: this.fixed,
          sorter: {}
        }
      })
        .then(function (res) {
          _this.cveAllList = res.data.result || [];
        })
        .catch(function (err) {
          _this.$message.error(err.response.message);
        })
        .finally(function () {
          _this.cveAllIsLoading = false;
        });
    },
    onSearch(text) {
      this.pagination = defaultPagination;
      if (!this.filters) {
        this.filters = {};
      }
      if (text !== '') {
        this.filters.cveId = text;
      } else {
        this.filters.cveId = undefined;
      }
      this.getCves();
    },
    handleTaskCreateSuccess() {
      this.handleRefresh();
    },
    handleScanAll() {},
    handleStatusUpdated() {
      this.selectedRowKeys = [];
      this.selectedRowsAll = [];
      if (this.standalone) {
        this.handleRefresh();
      } else {
        const pagination = this.pagination || {};
        const filters = this.filters || {};
        const sorter = this.sorter || {};
        this.$emit('statusUpdated', {
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
      }
    },
    uploadfile() {},
    handleUploadSuccess() {
      setTimeout(() => {
      this.getCvesAll();
      console.log(11111)
    }, 500);
    this.getCves();
    }
  },
  mounted() {
    setTimeout(() => {
      this.getCvesAll();
    }, 500);
    this.getCves();
  }
};
</script>

<style lang="less" scoped>
</style>
