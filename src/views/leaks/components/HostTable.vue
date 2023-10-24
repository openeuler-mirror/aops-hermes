<template>
  <div class="hostbox">
    <div class="mesinfo">
      <a-row
      v-if="standalone && scanningHostIds.length > 0 && scanStatusloading"
      type="flex"
        justify="end"
        align="middle">
        <a-icon type="loading" />
        <p class="scan-result-message">{{ `目前有${scanningHostIds.length}台机器正在扫描` }}</p>
      </a-row>
    </div>
    <a-row class="aops-app-table-control-row" type="flex" justify="space-between">
      <a-col v-if="!standalone">
        <a-radio-group default-value="a" button-style="solid" @change="handleFixChange">
          <a-radio-button value="a">
            未修复
          </a-radio-button>
          <a-radio-button value="b">
            已修复
          </a-radio-button>
        </a-radio-group>
        <a-input-search placeholder="按主机名搜索" v-model="hostSearch" @change="searchChange" style="width: 200px;margin-left: 10px;" @search="onSearch" />
      </a-col>
      <a-col v-else>
        <a-input-search placeholder="按主机名搜索" v-model="hostSearch" @change="searchChange" style="width: 200px" @search="onSearch" />
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
            <a-input-search placeholder="按主机名搜索" style="width: 200px" @search="onSearch" />
          </a-col> -->
          <a-col v-if="standalone && selectedRowKeys.length > 0">
            <create-repair-task-drawer
            taskType="repo set"
            dataType="selected"
              hostListType="bySelection"
              :hostList="selectedRowsAll"
              :repoList="repoListProps"
              @createSuccess="handleTaskCreateSuccess"
              @getAllHost="getAllHost" />
          </a-col>
          <a-col v-if="standalone && selectedRowKeys.length === 0">
            <create-repair-task-drawer
            taskType="repo set"
            dataType="all"
            hostListType="bySelection"
              :hostList="hostListAll"
              :repoList="repoListProps"
              @createSuccess="handleTaskCreateSuccess"
              @getAllHost="getAllHost" />
          </a-col>
          <a-col v-if="standalone && selectedRowKeys.length !== 0">
            <a-button @click="handleScan" type="primary" :loading="scanloading">
              漏洞扫描
            </a-button>
          </a-col>
          <a-col v-if="standalone && selectedRowKeys.length === 0">
            <a-button @click="handleScanAll" :loading="scanloading" type="primary">漏洞扫描</a-button>
          </a-col>
          <a-col v-if="standalone">
            <a-button @click="handleExport" type="primary">导出</a-button>
          </a-col>
          <a-col v-if="!standalone && !fixed && selectedRowKeys.length === 0">
            <create-repair-task-drawer
            text="生成修复任务"
            taskType="cve fix"
            :fixed="fixed"
            :cveListProps="cveList"
            hostListType="byLoading"
            @createSuccess="handleTaskCreateSuccess" />
          </a-col>
          <a-col v-if="!standalone && !fixed && selectedRowKeys.length !== 0">
            <create-repair-task-drawer
              taskType="cve fix"
              :fixed="fixed"
              :cveListProps="cveList"
              hostListType="bySelection"
              :hostList="selectedRowsAll"
              @createSuccess="handleTaskCreateSuccess" />
          </a-col>
          <a-col v-if="!standalone && fixed && selectedRowKeys.length === 0">
            <create-repair-task-drawer
              text="生成回滚任务"
              taskType="cve rollback"
              :fixed="fixed"
              :cveListProps="cveList"
              hostListType="byLoading"
              @createSuccess="handleTaskCreateSuccess" />
          </a-col>
          <a-col v-if="!standalone && fixed && selectedRowKeys.length !== 0">
            <create-repair-task-drawer
              taskType="cve rollback"
              :fixed="fixed"
              :cveListProps="cveList"
              hostListType="bySelection"
              :hostList="selectedRowsAll"
              @createSuccess="handleTaskCreateSuccess" />
          </a-col>
          <a-col v-if="standalone">
            <a-button @click="handleRefresh">
              <a-icon type="redo" />
            </a-button>
          </a-col>
        </a-row>
      </a-col>
    </a-row>
    <a-table
      class="standtable"
      rowKey="host_id"
      :columns="standalone ? hostTableColumnsStandalone : hostTableColumns"
      :data-source="standalone ? hostTableData : propData"
      :pagination="pagination"
      :rowSelection="rowSelection"
      @change="handleTableChange"
      @expand="expand"
      :expanded-row-keys.sync="expandedRowKeys"
      :loading="standalone ? hostTableIsLoading : inputLoading"
    >
      <router-link
      :to="{path: `/leaks/host-leak-list/${record.host_id}`}"
      slot="host_name"
      slot-scope="host_name, record">{{ host_name }}</router-link>
      <div slot="last_scan" slot-scope="last_scan">
        {{ last_scan }}
        <!-- {{ record.last_scan === null ? '未扫描' : record.last_scan }} -->
      </div>
      <div slot="repo" slot-scope="repo">
        {{ repo || '——' }}
      </div>
      <div slot="hotpatch" slot-scope="hotpatch">
        {{ hotpatch ? '是' : '否' }}
        <!-- {{ record.last_scan === null ? '未扫描' : record.last_scan }} -->
      </div>
      <div v-if="!standalone" slot="expandedRowRender" slot-scope="record" style="margin: 0">
        <a-table
              :row-key="innerrecord => fixed ? record.host_id + innerrecord.installed_rpm : record.host_id + innerrecord.available_rpm + innerrecord.installed_rpm"
              :columns="fixed ? ainnerColumns : innerColumns"
              :data-source="record.rpms || []"
              :rowSelection="innerRowSelection"
              :pagination="false">
              <a
               slot="hosts"
               slot-scope="hosts, innerrecord"
               @click="showHostListUnderCve(record, innerrecord)">{{ hosts }}</a>
            </a-table>
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
 * host表格组件
 * hostlist 表格的业务逻辑公共组件。根据props中standalone属性确定是自动获取列表信息，还是通过外部获取列表信息。
 */

import CreateRepairTaskDrawer from './CreateRepairTaskDrawer';
import HostInCveRpm from './HostInCveRpm';
import {getHostLeakList, scanHost, getHostScanStatus, getRepoList, getCveExport, getCveUnfixRpm, getCveFixRpm} from '@/api/leaks';
import {hostGroupList} from '@/api/assest';
import {getSelectedRow} from '../utils/getSelectedRow';
import {downloadBlobFile} from '@/views/utils/downloadBlobFile';

import {dateFormat} from '@/views/utils/Utils';
import configs from '@/config/defaultSettings';

const defaultPagination = {
  current: 1,
  pageSize: 10,
  showTotal: (total) => `总计 ${total} 项`,
  showSizeChanger: true,
  showQuickJumper: true
};

export default {
  name: 'HostTable',
  components: {
    CreateRepairTaskDrawer,
    HostInCveRpm
  },
  props: {
    // 判断表格是自己发起请求获取数据还是，触发事件通过父组件获取数据
    standalone: {
      type: Boolean,
      default: false
    },
    // cve详情页面-创建修复任务时，通过此属性将选择的cve列表传进来
    cveList: {
      type: Array,
      default: () => []
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
    // 当通过父组件获取数据时，通过此属性同步数据的最大数量
    paginationTotal: {
      type: Number,
      default: undefined
    },
    // 设置repo时，需要传入repo数据
    repoListProps: {
      type: Array,
      default: () => []
    },
    cveId: {
      type: String,
      default: ''
    }
  },
  computed: {
    hostTableColumnsStandalone() {
      let {filters} = this;
      filters = filters || {};
      return [
        {
          dataIndex: 'host_name',
          key: 'host_name',
          title: '主机名',
          scopedSlots: {customRender: 'host_name'}
        },
        {
          dataIndex: 'host_ip',
          key: 'host_ip',
          title: 'ip地址'
        },
        {
          dataIndex: 'host_group',
          key: 'host_group',
          title: '主机组',
          filteredValue: filters.host_group || [],
          filters: this.hostGroupList
        },
        {
          dataIndex: 'repo',
          key: 'repo',
          title: 'CVE REPO',
          filteredValue: filters.repo || [],
          filters: this.repoList,
          scopedSlots: {customRender: 'repo'}
        },
        {
          dataIndex: 'cve_num',
          key: 'cve_num',
          title: '未修复/已修复CVE'
        },
        {
          dataIndex: 'last_scan',
          key: 'last_scan',
          title: '上次扫描',
          sorter: true,
          customRender: (time) => dateFormat('YYYY-mm-dd HH:MM:SS', time * 1000)
        }
      ];
    },
    hostTableColumns() {
      let {filters} = this;
      filters = filters || {};
      return [
        {
          dataIndex: 'host_name',
          key: 'host_name',
          title: '主机名',
          scopedSlots: {customRender: 'host_name'}
        },
        {
          dataIndex: 'host_ip',
          key: 'host_ip',
          title: 'ip地址'
        },
        {
          dataIndex: 'host_group',
          key: 'host_group',
          title: '主机组',
          filteredValue: filters.host_group || null,
          filters: this.hostGroupList
        },
        {
          dataIndex: 'repo',
          key: 'repo',
          title: 'CVE REPO',
          filteredValue: filters.repo || null,
          filters: this.standalone ? this.repoList : this.repoFilterList,
          scopedSlots: {customRender: 'repo'}
        },
        // {
        //   dataIndex: this.hotpatchContent === '支持热补丁' ? 'hotpatch' : 'fixStatus',
        //   key: this.hotpatchContent === '支持热补丁' ? 'hotpatch' : 'fixStatus',
        //   title: this.hotpatchContent,
        //   filteredValue: this.hotpatchContent === '支持热补丁' ? filters.hotpatch || null : filters.fixStatus || null,
        //   filters: this.hotpatchContent === '支持热补丁' ? [
        //     {
        //       text: '是',
        //       value: 1
        //     },
        //     {
        //       text: '否',
        //       value: 0
        //     }
        //   ] : [
        //     {
        //       text: '是(ACCEPTED)',
        //       value: 1
        //     },
        //     {
        //       text: '是(ACTIVED)',
        //       value: 2
        //     },
        //     {
        //       text: '否',
        //       value: 0
        //     }
        //   ],
        //   scopedSlots: {customRender: this.hotpatchContent === '支持热补丁' ? 'hotpatch' : 'fixStatus'}
        // },
        {
          dataIndex: 'last_scan',
          key: 'last_scan',
          title: '上次扫描',
          sorter: true,
          customRender: (time) => dateFormat('YYYY-mm-dd HH:MM:SS', time * 1000)
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
        },
        {
          dataIndex: 'host_num',
          key: 'host_num',
          title: '主机数量',
          scopedSlots: {customRender: 'hosts'}
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
        }
      ];
    },
    rowSelection() {
      return {
        selectedRowKeys: this.selectedRowKeys,
        onChange: this.onSelectChange
      };
    },
    innerRowSelection() {
      return {
        selectedRowKeys: this.innerselectedRowKeys,
        onChange: this.innerOnSelectChange,
        getCheckboxProps: (it) => ({
          props: {
            disabled: this.fixed
          }
        })
      };
    },
    // 通过repo筛选时的数据转换
    repoList() {
      const arr = this.repoListProps.map((repo) => {
        return {
          text: repo.repo_name,
          value: repo.repo_name
        };
      });
      arr.push({
        text: '未设置',
        value: ''
      });
      return arr;
    }
  },
  watch: {
    paginationTotal() {
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
      expandedRowKeys: [],
      innerselectedRowKeys: [],
      propData: this.inputList,
      hotpatchContent: '支持热补丁',
      hostSearch: '',
      hostTableData: [],
      hostTableIsLoading: false,
      pagination: defaultPagination,
      filters: null,
      sorter: null,
      selectedRowKeys: [],
      selectedRowsAll: [],
      // 筛选数据
      hostGroupList: [],
      repoFilterList: [],
      // 获取全量主机。用于创建修复任务时选择全部主机
      hostListAll: [],
      hostListAllIsLoading: false,
      // 发起扫描loading
      scanloading: false,
      // 查询扫描状态loading
      scanStatusloading: false,
      scanStatusData: {},
      scanningHostIds: [],
      scanStatueAllTimeout: null,
      fixed: false,
      hostListUnderCveVisible: false,
      hostListOfCveId: null,
      propAvailablerpm: null,
      propInstalledrpm: null
    };
  },
  methods: {
    checkCondition() {
      this.$nextTick(() => {
        const contain = document.querySelector('.standtable')
        if (contain) {
          const elements1 = contain.querySelectorAll('.ant-table-row-expand-icon-cell')
          const elements2 = contain.querySelectorAll('.ant-table-expand-icon-th')
          if (this.standalone) {
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
        }
      });
    },
    closeHostListUnderCve() {
      this.hostListUnderCveVisible = false;
    },
    showHostListUnderCve(params, innerparams) {
      this.hostListUnderCveVisible = true;
      this.hostListOfCveId = this.cveId;
      this.propAvailablerpm = innerparams.available_rpm
      this.propInstalledrpm = innerparams.installed_rpm
    },
    innerOnSelectChange(selectedRowKeys, selectedRows) {
      this.innerselectedRowKeys = selectedRowKeys;
    },
    expand(expanded, record) {
      if (expanded && !this.standalone) {
        const _this = this
        const Params = {
          cve_id: this.cveId,
          host_ids: [record.host_id]
        }
        if (this.fixed) {
          getCveFixRpm(Params)
          .then(function (res) {
            const target = _this.propData.find(item => item.host_id === record.host_id)
            target.rpms = res.data
            target.rpms.forEach((item) => {
              _this.$set(item, 'host_id', record.host_id)
            })
            // 数据更新后给表格重新赋值
            _this.propData = JSON.parse(JSON.stringify(_this.propData))
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
            const target = _this.propData.find(item => item.host_id === record.host_id)
            target.rpms = res.data
            target.rpms.forEach((item) => {
              _this.$set(item, 'host_id', record.host_id)
            })
            // 数据更新后给表格重新赋值
            _this.propData = JSON.parse(JSON.stringify(_this.propData))
          })
          .catch(function (err) {
            _this.$message.error(err.response.message);
          })
          .finally(function () {
            _this.tableIsLoading = false;
          });
      }
      }
    },
    searchChange() {
      if (!this.filters) {
        this.filters = {};
      }
      if (this.hostSearch !== '') {
        this.filters.host_name = this.hostSearch;
      } else {
        this.filters.host_name = undefined;
      }
    },
    getAllHost() {
      this.getHostList();
      this.getHostGroup();
      if (this.standalone) {
        // 主机列表页面中要自行获取全量主机和扫描状态
        this.getScanStatusAll([]);
        this.getHostListAll();
      } else {
        // 主机详情页面中要自行获取repo列表
        this.getRepoList();
      }
    },
    handleFixChange(e) {
      if (e.target.value === 'a') {
        this.hotpatchContent = '支持热补丁'
        this.fixed = false;
      } else {
        this.hotpatchContent = '热补丁修复'
        this.fixed = true;
      }
      this.expandedRowKeys = []
      this.selectedRowKeys = []
      // 切换修复状态后重新请求受影响主机列表
      this.handleReset();
    },
    handleExport() {
      if (this.selectedRowKeys.length !== 0) {
        const _this = this;
        getCveExport(_this.selectedRowKeys)
          .then(function (res) {
            downloadBlobFile(res.data, res.fileName);
            // _this.scanStatusData = res.result || {};
          })
          .catch(function (err) {
            _this.$message.error(err.response.message);
          })
          .finally(function () {
            _this.scanStatusloading = false;
          });
      } else {
        this.$message.info('请至少选择一组主机!');
      }
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
      this.expandedRowKeys = []
      this.filters = Object.assign({}, this.filters, filters);
      if (this.filters['fixStatus'] != null) {
        this.assignFiltersFixStatus(this.filters['fixStatus'])
      }
      this.sorter = sorter;
      // 排序、筛选、分页时，重新请求主机列表
      this.getHostList();
      if (this.standalone) {
        this.getHostListAll();
      }
    },
    onSelectChange(selectedRowKeys, selectedRows) {
      const tableData = this.standalone ? this.hostTableData : this.inputList;
      this.selectedRowKeys = selectedRowKeys;
      this.selectedRowsAll = getSelectedRow(selectedRowKeys, this.selectedRowsAll, tableData, 'host_id');
    },
    resetSelection() {
      this.selectedRowKeys = [];
      this.selectedRowsAll = [];
    },
    handleScan() {
      const _this = this;
      this.scanloading = true;
      // 检查要扫描的主机是否有正在被扫描
      getHostScanStatus({
        hostList: this.selectedRowKeys
      })
        .then(function (res) {
          const scanningHost = _this.getScanningHost(res.data.result, _this.selectedRowsAll);
          if (scanningHost.length > 0) {
            _this.$warning({
              title: '以下主机正在进行扫描，不能批量执行：',
              content: scanningHost.map((host) => host.host_name).join('、')
            });
          } else {
            _this.$confirm({
              title: '确定扫描以下主机?',
              content: _this.selectedRowsAll.map((host) => host.host_name).join('、'),
              okText: '确认',
              cancelText: '取消',
              icon: () => <a-icon type="exclamation-circle" />,
              onOk: function () {
                _this.scanloading = true;
                const requestIds = _this.selectedRowKeys;
                return scanHost({
                  hostList: requestIds,
                  filter: null
                })
                  .then(function (res) {
                    _this.$message.success(res.message);
                    _this.handleRefresh();
                    _this.getScanStatusAll([]);
                  })
                  .catch(function (err) {
                    _this.$message.error(err.response.message);
                  })
                  .finally(function () {
                    _this.scanloading = false;
                  });
              }
            });
          }
        })
        .catch(function (err) {
          _this.$message.error(err.response.message);
        })
        .finally(function () {
          _this.scanloading = false;
        });
    },
    handleScanAll() {
      const _this = this;
      this.scanloading = true;
      getHostScanStatus({
        hostList: this.selectedRowKeys
      })
        .then(function (res) {
          if (_this.hasScanningHost(res.data.result)) {
            _this.$warning({
              title: '有主机正在进行扫描，不能扫描全部主机！'
            });
          } else {
            const hasFilter = _this.checkHasFilter(_this.filters);
            _this.$confirm({
              title: hasFilter ? '按当前筛选条件扫描主机？' : '确定扫描全部主机?',
              icon: () => <a-icon type="exclamation-circle" />,
              onOk: function () {
                _this.scanloading = true;
                return scanHost({
                  hostList: [],
                  filter: _this.filters
                })
                  .then(function (res) {
                    _this.$message.success(res.message);
                    _this.handleRefresh();
                    _this.getScanStatusAll([]);
                  })
                  .catch(function (err) {
                    _this.$message.error(err.response.message);
                  })
                  .finally(function () {
                    _this.scanloading = false;
                  });
              }
            });
          }
        })
        .catch(function (err) {
          _this.$message.error(err.response.message);
        })
        .finally(function () {
          _this.scanloading = false;
        });
    },
    // 轮训检查主机扫描状态，当没有‘scanning’状态的主机后停止
    getScanStatusAll(hostList) {
      const _this = this;
      this.scanStatusloading = true;
      clearTimeout(this.scanStatueAllTimeout);
      getHostScanStatus({
        hostList
      })
        .then(function (res) {
          _this.scanStatusData = res.data.result || {};
          if (_this.standalone) {
            _this.scanningHostIds = _this.getScanningHostAll(res.data.result);
            // 第一次判断是否有正在扫描的主机
            if (_this.scanningHostIds.length > 0) {
              if (_this.scanningHostIds.length > 0) {
                // 第二次判断是否进入轮询查询扫描状态
                _this.scanStatueAllTimeout = setTimeout(function () {
                  _this.getScanStatusAll(_this.scanningHostIds);
                }, configs.scanProgressInterval);
              } else {
                // 扫描结束后刷新界面
                _this.handleRefresh();
                _this.scanStatusloading = false;
              }
            } else {
              // 第一次判断是否有正在扫描的主机，若没有则退出查询
              _this.scanStatusloading = false;
            }
          }
        })
        .catch(function (err) {
          _this.$message.error(err.response.message);
        })
        .finally(function () {
        });
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
    getScanningHostAll(scanMap) {
      const arr = [];
      for (const hostId in scanMap) {
        if (scanMap[hostId] === 3) {
          arr.push(hostId);
        }
      }
      return arr;
    },
    // 检查是否有扫描状态的主机
    hasScanningHost(scanMap) {
      for (const hostId in scanMap) {
        if (scanMap[hostId] === 3) {
          return true;
        }
      }
      return false;
    },
    handleRefresh() {
      this.selectedRowKeys = [];
      this.selectedRows = [];
      this.getHostList();
      if (this.standalone) {
        this.getHostListAll();
      }
    },
    handleReset() {
      this.pagination = defaultPagination;
      this.sorter = null;
      this.filters = null;
      this.selectedRowKeys = [];
      this.selectedRows = [];
      this.getHostList();
      if (this.standalone) {
        this.getHostListAll();
      }
    },
    getHostList() {
      const _this = this;
      this.hostTableIsLoading = true;
      const pagination = this.pagination || {};
      const filters = this.filters || {};
      const sorter = this.sorter || {};
      // 非standalone模式下触发外部获取数据
      if (!this.standalone) {
        this.$emit('getTableData', {
          tableInfo: {
            pagination: {
              current: pagination.current,
              pageSize: pagination.pageSize
            },
            filters: filters,
            fixed: this.fixed,
            sorter: {
              field: sorter.field,
              order: sorter.order
            }
          }
        });
        return;
      }

      getHostLeakList({
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
          _this.hostTableData = res.data.result || [];
          // 获取数据后调取方法查看是否影藏展开符号
          _this.$nextTick(() => {
            _this.checkCondition();
          });
          _this.hostTableData.forEach((item) => {
            item.cve_num = `${item.unfixed_cve_num}/${item.fixed_cve_num}`
          })
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
          _this.hostTableIsLoading = false;
        });
    },
    getHostListAll() {
      // only excute when it's standalone
      const _this = this;
      this.hostListAllIsLoading = true;
      const filters = this.filters || {};

      getHostLeakList({
        tableInfo: {
          pagination: {},
          filters: filters,
          sorter: {}
        }
      })
        .then(function (res) {
          _this.hostListAll = res.data.result || [];
        })
        .catch(function (err) {
          _this.$message.error(err.response.message);
        })
        .finally(function () {
          _this.hostListAllIsLoading = false;
        });
    },
    onSearch(text) {
      this.pagination = defaultPagination;
      if (!this.filters) {
        this.filters = {};
      }
      if (text !== '') {
        this.filters.host_name = text;
      } else {
        this.filters.host_name = undefined;
      }
      this.getHostList();
      if (this.standalone) {
        this.getHostListAll();
      }
      // 重新请求数据后重置列表
      this.expandedRowKeys = []
    },
    handleTaskCreateSuccess() {
      this.handleRefresh();
    },
    getHostGroup() {
      const _this = this;
      hostGroupList({
        tableInfo: {sorter: {}, pagination: {}}
      })
        .then(function (res) {
          _this.hostGroupList = res.data.host_group_infos.map((hg) => {
            return {
              text: hg.host_group_name,
              value: hg.host_group_name
            };
          });
        })
        .catch(function (err) {
          _this.$message.error(err.response.message);
        });
    },
    getRepoList() {
      const _this = this;
      getRepoList()
        .then(function (res) {
          const arr = (res.data.result || []).map((repo) => {
            return {
              text: repo.repo_name,
              value: repo.repo_name
            };
          });
          arr.push({
            text: '未设置',
            value: ''
          });
          _this.repoFilterList = arr;
        })
        .catch(function (err) {
          _this.$message.error(err.response.message);
        });
    },
    // 检查是否有筛选条件
    checkHasFilter(filters) {
      if (!filters) {
        return false;
      }
      for (const key in filters) {
        if (filters[key] && filters[key].length > 0) {
          return true;
        }
      }
      return false;
    }
  },
  mounted: function () {
    this.getHostGroup();
    this.getHostList();
    if (this.standalone) {
      // 主机列表页面中要自行获取全量主机和扫描状态
      this.getScanStatusAll([]);
    } else {
      // 主机详情页面中要自行获取repo列表
      this.getRepoList();
    }
  },
  beforeDestroy() {
    // 离开页面前，若当前存在轮询，清除轮询
    if (this.scanStatueAllTimeout) {
      clearInterval(this.scanStatueAllTimeout);
      this.scanStatueAllTimeout = null;
    }
  }
};
</script>

<style lang="less" scoped>
.mesinfo {
  height: 20px;
}
.scan-result-message {
  font-weight: 400;
  font-size: 16px;
  margin: 0 6px;
}
.hostbox {
  overflow: auto;
}
</style>
