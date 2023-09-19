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
        <a-input-search placeholder="按cve_id或package搜索" :maxLength="40" style="width: 200px;margin-left: 10px;" v-model="searchKey" @change="searchChange"
        @search="onSearch" />
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
              <create-repair-task-drawer
                text="生成回滚任务"
                taskType="cve rollback"
                :fixed="fixed"
                :cveListProps="standalone ? cveAllList : cveAllListProp"
                :innerCveList="innerCveList"
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
                :innerCveList="innerCveList"
                :hostListType="standalone ? 'byLoading' : 'byOneHost'"
                :hostList="hostList"
                @createSuccess="handleTaskCreateSuccess" />
            </a-col>
          </div>
          <div v-if="!(fixed || rollback)">
            <a-col v-if="selectedRowKeys.length === 0 && innerselectedRowKeys.length === 0 && affected">
              <create-repair-task-drawer
                text="生成修复任务"
                taskType="cve fix"
                :fixed="fixed"
                :cveListProps="standalone ? cveAllList : cveAllListProp"
                :innerCveList="innerCveList"
                :loading="standalone ? cveAllIsLoading : cveAllIsLoadingProp"
                :hostListType="standalone ? 'byLoading' : 'byOneHost'"
                :hostList="hostList"
                @createSuccess="handleTaskCreateSuccess" />
            </a-col>
            <a-col v-if="selectedRowKeys.length === 0 && innerselectedRowKeys.length !== 0 && affected">
              <create-repair-task-drawer
                text="生成修复任务"
                taskType="cve fix"
                :fixed="fixed"
                :cveListProps="selectedRowsAll"
                :innerCveList="innerCveList"
                :loading="standalone ? cveAllIsLoading : cveAllIsLoadingProp"
                :hostListType="standalone ? 'byLoading' : 'byOneHost'"
                :hostList="hostList"
                @createSuccess="handleTaskCreateSuccess" />
            </a-col>
            <a-col v-if="selectedRowKeys.length !== 0 && innerselectedRowKeys.length === 0 && affected">
              <create-repair-task-drawer
                taskType="cve fix"
                :fixed="fixed"
                :cveListProps="selectedRowsAll"
                :innerCveList="innerCveList"
                :hostListType="standalone ? 'byLoading' : 'byOneHost'"
                :hostList="hostList"
                @createSuccess="handleTaskCreateSuccess" />
            </a-col>
            <a-col v-if="selectedRowKeys.length !== 0 && innerselectedRowKeys.length !== 0 && affected">
              <create-repair-task-drawer
                taskType="cve fix"
                :fixed="fixed"
                :cveListProps="selectedRowsAll"
                :innerCveList="innerCveList"
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
      :row-key="record => record.cve_id"
      :columns="standalone ? tableColumnsStandalone : tableColumns"
      :data-source="standalone ? tableData : propData"
      :pagination="pagination.total === 0 ? false : (!standalone ? (paginationTotal === 0 ? false : pagination) : pagination)"
      :rowSelection="rowSelection"
      :expandIconAsCell="false"
      @change="handleTableChange"
      @expand="expand"
      :expanded-row-keys.sync="expandedRowKeys"
      :loading="standalone ? tableIsLoading : inputLoading">
      <router-link
      :to="{path: `/leaks/cves-management/${id}`}"
      slot="cve_id"
        slot-scope="id">{{ id }}</router-link>
      <div slot="expandedRowRender" slot-scope="record" style="margin: 0">
        <p>Description:</p>
        <p>{{ record.description }}</p>
        <a-table
              :row-key="innerrecord => fixed ? record.cve_id + innerrecord.installed_rpm : record.cve_id + innerrecord.available_rpm + innerrecord.installed_rpm"
              :columns="fixed ? (standalone ? ainnerColumns : binnerColumns) : (standalone ? aloneinnerColumns : innerColumns)"
              :data-source="record.rpms || []"
              :locale="tablenodata"
              :rowSelection="innerRowSelection"
              :pagination="false">
              <a
               slot="hosts"
               slot-scope="hosts, innerrecord"
               @click="showHostListUnderCve(record, innerrecord)">{{ hosts }}</a>
        </a-table>
      </div>
      <div v-if="!fixed" slot="hotpatch" slot-scope="hotpatch" style="margin: 0">
        <p>{{ hotpatch ? '是' : '否' }}</p>
      </div>
    </a-table>
    <host-in-cve-rpm
      :visible="hostListUnderCveVisible"
      @close="closeHostListUnderCve"
      :propAvailablerpm="propAvailablerpm"
      :propInstalledrpm="propInstalledrpm"
      :cveId="hostListOfCveId" />
  </div>
</template>

<script>
/**
 * cve表格组件
 * cve 表格的业务逻辑公共组件。根据props中standalone属性确定是自动获取列表信息，还是通过外部获取列表信息。
 */

import CreateRepairTaskDrawer from './CreateRepairTaskDrawer';
import HostInCveRpm from './HostInCveRpm';
import StatusChangeModal from './StatusChangeModal';
import {getSelectedRow} from '../utils/getSelectedRow';
import {getCveList, getCveUnfixRpm, getCveFixRpm} from '@/api/leaks';

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
    UploadFile,
    HostInCveRpm
  },
  props: {
    hostId: {
      type: String,
      default: undefined
    },
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
          dataIndex: 'package',
          key: 'package',
          customRender: (_package) => _package === '' ? '—' : _package,
          title: '软件包'
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
          dataIndex: 'package',
          key: 'package',
          customRender: (_package) => _package === '' ? '—' : _package,
          title: '软件包'
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
          title: '待安装rpm'
        },
        {
          dataIndex: 'support_way',
          key: 'support_way',
          title: '修复方式'
        }
      ];
    },
    ainnerColumns() {
      return [
        {
          dataIndex: 'installed_rpm',
          key: 'installed_rpm',
          title: '已安装rpm'
        },
        {
          dataIndex: 'fixed_way',
          key: 'fixed_way',
          title: '修复方式'
        },
        {
          dataIndex: 'host_num',
          key: 'host_num',
          title: '主机数量',
          scopedSlots: {customRender: 'hosts'}
        }
      ];
    },
    binnerColumns() {
      return [
        {
          dataIndex: 'installed_rpm',
          key: 'installed_rpm',
          title: '已安装rpm'
        },
        {
          dataIndex: 'fixed_way',
          key: 'fixed_way',
          title: '修复方式'
        }
      ];
    },
    aloneinnerColumns() {
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
          dataIndex: 'support_way',
          key: 'support_way',
          title: '修复方式'
        },
        {
          dataIndex: 'host_num',
          key: 'host_num',
          title: '涉及主机数量',
          scopedSlots: {customRender: 'hosts'}
        }
      ];
    },
    rowSelection() {
      return {
        onSelect: this.onSelect,
        onSelectAll: this.onSelectAll,
        selectedRowKeys: this.selectedRowKeys,
        onChange: this.onSelectChange
      };
    },
    innerRowSelection() {
        return {
          selectedRowKeys: this.innerselectedRowKeys,
          onChange: this.innerOnSelectChange,
          onSelect: this.innerOnSelect,
          onSelectAll: this.innerOnSelectAll,
          getCheckboxProps: (it) => ({
            props: {
              disabled: this.fixed || !it.installed_rpm || !it.available_rpm
            }
          })
       }
    }
  },
  watch: {
    paginationTotal () {
      this.$set(this.pagination, 'total', this.paginationTotal)
    },
    inputList: {
      handler (newVal, oldval) {
        this.propData = newVal
      },
      deep: true,
      immediate: true
    }
  },
  data() {
    return {
      tablenodata: {emptyText: () => (
      <div><div>暂无可修复的rpm包, 可能原因为：</div>
      <div>1. 界面未刷新</div>
      <div>2. 冷补丁修复kernel后界面未重启</div></div>
      )},
      selectedRows: [], // 选中行的row
      searchKey: '',
      innerCveList: [],
      // 勾选二级列表rpm参数时传入的数据流
      propAvailablerpm: null,
      propInstalledrpm: null,
      propData: this.inputList,
      expandedRowKeys: [],
      hostListOfCveId: null,
      hostListUnderCveVisible: false,
      hotpatchContent: '支持热补丁',
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
      innerselectedRowKeys: [],
      innerSelectedRowsAll: [],
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
      rollback: false,
      // 判断rpm二级列表是否有空值的变量
      nullkey: 0
    };
  },
  methods: {
    closeHostListUnderCve() {
      this.hostListUnderCveVisible = false;
    },
    showHostListUnderCve(params, innerparams) {
      this.hostListUnderCveVisible = true;
      this.hostListOfCveId = params.cve_id;
      this.propAvailablerpm = innerparams.available_rpm
      this.propInstalledrpm = innerparams.installed_rpm
    },
    expand(expanded, record) {
      if (expanded) {
        // 当一级列表展开时
        const _this = this
        const Params = {
          cve_id: record.cve_id,
          host_ids: this.hostId ? [this.hostId] : []
        }
        if (this.fixed) {
        getCveFixRpm(Params)
        .then(function (res) {
          if (_this.standalone) {
            const target = _this.tableData.find(item => item.cve_id === record.cve_id)
            target.rpms = res.data
            target.rpms.forEach((item) => {
              _this.$set(item, 'cve_id', record.cve_id)
            })
            // 数据更新后给表格重新赋值
            _this.tableData = JSON.parse(JSON.stringify(_this.tableData))
          } else {
            const target = _this.propData.find(item => item.cve_id === record.cve_id)
            target.rpms = res.data
            target.rpms.forEach((item) => {
              _this.$set(item, 'cve_id', record.cve_id)
            })
            // 数据更新后给表格重新赋值
            _this.propData = JSON.parse(JSON.stringify(_this.propData))
          }
        })
        .catch(function (err) {
          _this.$message.error(err.response.message);
        })
        .finally(function () {
          _this.tableIsLoading = false;
        });
        } else {
        getCveUnfixRpm(Params)
        .then(function (res) {
          if (_this.standalone) {
            const target = _this.tableData.find(item => item.cve_id === record.cve_id)
            target.rpms = res.data
            target.rpms.forEach((item) => {
              _this.$set(item, 'cve_id', record.cve_id)
            })
             if (!_this.fixed && _this.selectedRowKeys.includes(record.cve_id)) {
               target.rpms.forEach(function(v) {
                 _this.getChildCheck(record.cve_id, v)
               });
             }
            // 数据更新后给表格重新赋值
            _this.tableData = JSON.parse(JSON.stringify(_this.tableData))
          } else {
            const target = _this.propData.find(item => item.cve_id === record.cve_id)
            target.rpms = res.data
            target.rpms.forEach((item) => {
              _this.$set(item, 'cve_id', record.cve_id)
            })
            if (!_this.fixed && _this.selectedRowKeys.includes(record.cve_id)) {
              target.rpms.forEach(function(v) {
                _this.getChildCheck(record.cve_id, v)
              });
            }
            // 数据更新后给表格重新赋值
            _this.propData = JSON.parse(JSON.stringify(_this.propData))
          }
        })
        .catch(function (err) {
          _this.$message.error(err.response.message);
        })
        .finally(function () {
          _this.tableIsLoading = false;
        });
      }
      } else {
        // 当一级列表收起时
        const _this = this
        if (_this.selectedRowKeys.includes(record.cve_id)) {
          // 若收起的cve是一级列表中选中的cve，则循环去除掉该cve下所有二级项的选中状态，并更新innerCveList的值
          if (_this.standalone) {
            const target = _this.tableData.find(item => item.cve_id === record.cve_id)
            target.rpms.forEach(function(v) {
              _this.innerselectedRowKeys = _this.innerselectedRowKeys.filter(function(item) {
                return item !== _this.getChildUnCheck(record.cve_id, v)
              })
              _this.getUncheck(record.cve_id, v)
            });
          } else {
            const target = _this.propData.find(item => item.cve_id === record.cve_id)
            target.rpms.forEach(function(v) {
              _this.innerselectedRowKeys = _this.innerselectedRowKeys.filter(function(item) {
                return item !== _this.getChildUnCheck(record.cve_id, v)
              })
              _this.getUncheck(record.cve_id, v)
            });
          }
        }
      }
    },
    searchChange() {
      if (!this.filters) {
        this.filters = {};
      }
      if (this.searchKey !== '') {
        this.filters.search_key = this.searchKey;
      } else {
        this.filters.search_key = undefined;
      }
    },
    handleAffectChange(e) {
        if (e.target.value === 'a') {
          this.hotpatchContent = '支持热补丁'
          this.fixed = undefined
          this.affected = true;
          this.rollback = false;
        } else if (e.target.value === 'b') {
          this.hotpatchContent = '支持热补丁'
          this.fixed = undefined
          this.affected = false;
          this.rollback = false;
        } else {
          this.hotpatchContent = '热补丁修复'
          this.fixed = true;
          this.affected = true;
          this.rollback = true;
        }
        this.sorter = null
        this.expandedRowKeys = []
        this.selectedRowKeys = []
        this.getCvesAll()
        this.handleReset();
    },
    handleFixChange(e) {
      if (e.target.value === 'a') {
          this.fixed = false;
        } else {
          this.fixed = true;
        }
      this.sorter = null
      this.expandedRowKeys = []
      this.selectedRowKeys = []
      this.getCvesAll()
      this.handleReset();
    },
    assignFiltersFixStatus(fixStatus) {
      this.filters.hotpatch = []
      this.filters.hp_status = []
      fixStatus.forEach(value => {
        if (value === 1) {
          if (!this.filters.hotpatch.includes(1)) {
            this.filters.hotpatch.push(1)
          }
          this.filters.hp_status.push('ACCEPTED')
        }
        if (value === 2) {
          if (!this.filters.hotpatch.includes(1)) {
            this.filters.hotpatch.push(1)
          }
          this.filters.hp_status.push('ACTIVED')
        }
        if (value === 0) {
          this.filters.hotpatch.push(0)
        }
      })
    },
    handleTableChange(pagination, filters, sorter) {
      // 存储翻页状态
      this.pagination = pagination;
      // 翻页时清楚展开状态
      this.expandedRowKeys = []

      this.filters = Object.assign({}, this.filters, filters);
      if (this.filters['fixStatus'] != null) {
        this.assignFiltersFixStatus(this.filters['fixStatus'])
      }
      this.sorter = sorter;
      // 出发排序、筛选、分页时，重新请求主机列表
      this.getCves();
    },
    // 当用户手动勾选全选 Checkbox 时触发的事件
    onSelectAll(selected) {
      const _this = this
      if (selected) {
        const tabData = this.standalone ? this.tableData : this.propData;
        const arr = [];
        setVal(tabData, arr);
        this.selectedRowKeys = arr;
      } else {
        this.selectedRowKeys = [];
        this.innerselectedRowKeys = [];
        this.innerCveList = [];
      }
      function setVal(list, arr) {
        list.forEach(v => {
          arr.push(v.cve_id);
          if (v.rpms) {
            v.rpms.forEach(it => {
              _this.getChildCheck(v.cve_id, it)
            })
          }
        });
      }
    },
    getChildCheck(id, val) {
      // 重置nullkey
      this.nullkey = 0
      const _this = this
      Object.keys(val).forEach(function(key) {
        if (!val[key]) {
          _this.nullkey++
        }
      });
      if (this.nullkey === 0) {
        // 若该行所有属性都不为null，再执行添加勾选及判断操作
        this.innerselectedRowKeys.push(this.fixed ? id + val.installed_rpm : id + val.available_rpm + val.installed_rpm)
        if (this.innerCveList.length !== 0) {
                const result = this.innerCveList.some(item => item.cve_id === id)
                if (result) {
                  const target = this.innerCveList.find(item => item.cve_id === id)
                  target.rpms.push({
                    installed_rpm: val.installed_rpm,
                    available_rpm: val.available_rpm,
                    fix_way: val.support_way
                  })
                } else {
                  this.innerCveList.push({
                   cve_id: id,
                   rpms: [{
                       installed_rpm: val.installed_rpm,
                       available_rpm: val.available_rpm,
                       fix_way: val.support_way
                   }]
                  })
                }
        } else {
          this.innerCveList.push({
            cve_id: id,
            rpms: [{
                installed_rpm: val.installed_rpm,
                available_rpm: val.available_rpm,
                fix_way: val.support_way
            }]
          })
        }
      }
    },
    getUncheck(id, val) {
      if (this.innerCveList.length !== 0) {
        const result = this.innerCveList.some(item => item.cve_id === id)
        if (result) {
          const target = this.innerCveList.find(item => item.cve_id === id)
          const index = target.rpms.findIndex(item => item.installed_rpm === val.installed_rpm)
          target.rpms.splice(index, 1)
          if (target.rpms.length === 0) {
            const dindex = this.innerCveList.findIndex(it => it.cve_id === id)
            this.innerCveList.splice(dindex, 1)
          }
        }
      }
    },
    getChildUnCheck(id, val) {
      return this.fixed ? id + val.installed_rpm : id + val.available_rpm + val.installed_rpm
    },
    onSelect(record, selected) {
      const set = new Set(this.selectedRowKeys);
      const key = record.cve_id;
      const _this = this
      if (selected) {
        set.add(key);
        if (_this.expandedRowKeys.includes(key)) {
          record.rpms && setChildCheck(record.rpms);
        }
      } else {
        set.delete(key);
        if (_this.expandedRowKeys.includes(key)) {
          record.rpms && setChildUncheck(record.rpms);
        }
      }
      this.selectedRowKeys = Array.from(set);
      // 设置child全选
      function setChildCheck(list) {
        list.forEach(function(v) {
          _this.getChildCheck(record.cve_id, v)
        });
      }
      // 设置child取消
      function setChildUncheck(list) {
        list.forEach(function(v) {
          _this.innerselectedRowKeys = _this.innerselectedRowKeys.filter(function(item) {
            return item !== _this.getChildUnCheck(record.cve_id, v)
          })
          _this.getUncheck(record.cve_id, v)
        });
      }
    },
    onSelectChange(selectedRowKeys, selectedRows) {
      this.selectedRows = selectedRows
      const tableData = this.standalone ? this.tableData : this.propData;
      this.selectedRowKeys = selectedRowKeys;
      this.selectedRowsAll = getSelectedRow(selectedRowKeys, this.selectedRowsAll, tableData, 'cve_id');
    },
    innerOnSelectChange(selectedRowKeys, selectedRows) {
      this.innerselectedRowKeys = selectedRowKeys;
    },
    innerOnSelect(record, selected, selectedRows, nativeEvent) {
      if (this.innerCveList.length !== 0) {
              const result = this.innerCveList.some(item => item.cve_id === record.cve_id)
              if (result) {
                const target = this.innerCveList.find(item => item.cve_id === record.cve_id)
                if (selected) {
                  target.rpms.push({
                    installed_rpm: record.installed_rpm,
                    available_rpm: record.available_rpm,
                    fix_way: record.support_way
                  })
                  // 给父元素添加选中状态
                  if (!this.selectedRowKeys.includes(record.cve_id)) {
                    this.selectedRowKeys.push(record.cve_id)
                  }
                  this.selectedRowsAll = getSelectedRow(this.selectedRowKeys, this.selectedRowsAll, this.standalone ? this.tableData : this.propData, 'cve_id');
                } else {
                  const index = target.rpms.findIndex(item => item.installed_rpm === record.installed_rpm)
                  target.rpms.splice(index, 1)
                  if (target.rpms.length === 0) {
                    const dindex = this.innerCveList.findIndex(it => it.cve_id === record.cve_id)
                    this.innerCveList.splice(dindex, 1)
                  }
                  if (selectedRows.length === 0) {
                    // 如果删除后当前cve子表剩余选中项为空，给父元素去除选中状态
                    this.selectedRowKeys = this.selectedRowKeys.filter(function(item) {
                      return item !== record.cve_id
                    })
                    this.selectedRowsAll = getSelectedRow(this.selectedRowKeys, this.selectedRowsAll, this.standalone ? this.tableData : this.propData, 'cve_id');
                  }
                }
              } else {
                if (selected) {
                  this.innerCveList.push({
                   cve_id: record.cve_id,
                   rpms: [{
                       installed_rpm: record.installed_rpm,
                       available_rpm: record.available_rpm,
                       fix_way: record.support_way
                   }]
                  })
                  // 给父元素添加选中状态
                  if (!this.selectedRowKeys.includes(record.cve_id)) {
                    this.selectedRowKeys.push(record.cve_id)
                  }
                  this.selectedRowsAll = getSelectedRow(this.selectedRowKeys, this.selectedRowsAll, this.standalone ? this.tableData : this.propData, 'cve_id');
                } else {
                  if (selectedRows.length === 0) {
                    // 如果删除后当前cve子表剩余选中项为空，给父元素去除选中状态
                    this.selectedRowKeys = this.selectedRowKeys.filter(function(item) {
                      return item !== record.cve_id
                    })
                    this.selectedRowsAll = getSelectedRow(this.selectedRowKeys, this.selectedRowsAll, this.standalone ? this.tableData : this.propData, 'cve_id');
                  }
                }
              }
      } else {
             if (selected) {
               this.innerCveList.push({
                 cve_id: record.cve_id,
                 rpms: [{
                     installed_rpm: record.installed_rpm,
                     available_rpm: record.available_rpm,
                     fix_way: record.support_way
                 }]
               })
               // 给父元素添加选中状态
               if (!this.selectedRowKeys.includes(record.cve_id)) {
                 this.selectedRowKeys.push(record.cve_id)
               }
               this.selectedRowsAll = getSelectedRow(this.selectedRowKeys, this.selectedRowsAll, this.standalone ? this.tableData : this.propData, 'cve_id');
             } else {
               if (selectedRows.length === 0) {
                 // 如果删除后当前cve子表剩余选中项为空，给父元素去除选中状态
                 this.selectedRowKeys = this.selectedRowKeys.filter(function(item) {
                   return item !== record.cve_id
                 })
                 this.selectedRowsAll = getSelectedRow(this.selectedRowKeys, this.selectedRowsAll, this.standalone ? this.tableData : this.propData, 'cve_id');
               }
             }
      }
    },
    innerOnSelectAll(selected, selectedRows, changeRows) {
      if (this.innerCveList.length !== 0) {
        if (!selected) {
          const recordId = changeRows[0].cve_id
          const index = this.innerCveList.findIndex(item => item.cve_id === recordId)
          this.innerCveList.splice(index, 1)
          // 给父元素去除选中状态
          this.selectedRowKeys = this.selectedRowKeys.filter(function(item) {
            return item !== recordId
          })
          this.selectedRowsAll = getSelectedRow(this.selectedRowKeys, this.selectedRowsAll, this.standalone ? this.tableData : this.propData, 'cve_id');
        } else {
          const recordId = changeRows[0].cve_id
          const target = this.innerCveList.find(item => item.cve_id === recordId)
          const result = this.innerCveList.some(item => item.cve_id === recordId)
          // 给父元素添加选中状态
          if (!this.selectedRowKeys.includes(recordId)) {
            this.selectedRowKeys.push(recordId)
          }
          this.selectedRowsAll = getSelectedRow(this.selectedRowKeys, this.selectedRowsAll, this.standalone ? this.tableData : this.propData, 'cve_id');
          if (result) {
            changeRows.forEach((item) => {
              if (!target.rpms.some(it => it.available_rpm === item.available_rpm)) {
                target.rpms.push({
                  installed_rpm: item.installed_rpm,
                  available_rpm: item.available_rpm,
                  fix_way: item.support_way
                })
              }
            })
          } else {
            this.innerCveList.push({
              cve_id: recordId,
              rpms: []
            })
            const ls = this.innerCveList.findIndex(item => item.cve_id === recordId)
            changeRows.forEach((item) => {
               this.innerCveList[ls].rpms.push({
                 installed_rpm: item.installed_rpm,
                 available_rpm: item.available_rpm,
                 fix_way: item.support_way
               })
            })
          }
        }
      } else {
        if (!selected) {
          const recordId = changeRows[0].cve_id
          // 给父元素去除选中状态
          this.selectedRowKeys = this.selectedRowKeys.filter(function(item) {
            return item !== recordId
          })
          this.selectedRowsAll = getSelectedRow(this.selectedRowKeys, this.selectedRowsAll, this.standalone ? this.tableData : this.propData, 'cve_id');
        } else {
          const recordId = changeRows[0].cve_id
          // 给父元素添加选中状态
          if (!this.selectedRowKeys.includes(recordId)) {
            this.selectedRowKeys.push(recordId)
          }
          this.selectedRowsAll = getSelectedRow(this.selectedRowKeys, this.selectedRowsAll, this.standalone ? this.tableData : this.propData, 'cve_id');
          this.innerCveList.push({
            cve_id: recordId,
            rpms: []
          })
          changeRows.forEach((item) => {
             this.innerCveList[0].rpms.push({
               installed_rpm: item.installed_rpm,
               available_rpm: item.available_rpm,
               fix_way: item.support_way
             })
          })
        }
      }
    },
    resetSelection() {
      this.selectedRowKeys = [];
      this.selectedRowsAll = [];
      this.innerselectedRowKeys = [];
      this.expandedRowKeys = [];
      this.innerCveList = []
    },
    handleRefresh() {
      this.selectedRowKeys = [];
      this.selectedRowsAll = [];
      this.innerselectedRowKeys = [];
      this.expandedRowKeys = [];
      this.innerCveList = []
      // 重新请求界面, 收起展开状态
      // this.innerCveList = [];
      this.getCves();
    },
    handleReset() {
      this.pagination = defaultPagination;
      this.sorter = null;
      this.filters = null;
      this.selectedRowKeys = [];
      this.selectedRowsAll = [];
      this.innerCveList = [];
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
            sorter: {},
            fixed: this.fixed
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
          _this.$emit('updataCveAllList', res.data.result || [])
          // _this.cveAllListProp = res.data.result || [];
        })
        .catch(function (err) {
          _this.$message.error(err.response);
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
        this.filters.search_key = text.length > 40 ? text.substring(0, 40) : text;
      } else {
        this.filters.search_key = undefined;
      }
      this.getCves();
      // 重新请求数据后重置列表
      this.resetSelection()
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
    }, 500);
    this.getCves();
    }
  },
  beforeRouteLeave(to, from, next) {
  // 路由跳转前，清除轮询
    next();
    this.innerCveList = []
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
