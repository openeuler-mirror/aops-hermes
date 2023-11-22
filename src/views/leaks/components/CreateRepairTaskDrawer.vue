<template>
  <div>
    <a-button :disabled="disabled" :loading="loading" @click="handleOpen" type="primary">
      {{ taskTypsbutton[taskType] }}
    </a-button>
    <a-drawer
      :title="`生成任务${taskType === 'repo set' ? ' 设置REPO' : ''}`"
      closable
      @close="handleCancel"
      :get-container="false"
      :visible="visible"
      :body-style="{paddingBottom: '80px'}"
      width="650"
      destroyOnClose
    >
      <div class="create-task-contenxt">
        <a-form :form="form" :label-col="{span: 5}" :wrapper-col="{span: 16}">
          <a-form-item label="任务类型">{{ taskTypsEnum[taskType] }}</a-form-item>
          <a-form-item label="任务名称">
            <a-input
              :maxLength="20"
              v-decorator="[
                'task_name',
                {rules: [{required: true, message: '请输入任务名称'}], initialValue: taskNameDefault}
              ]"
              placeholder="请输入任务名称，20个字符以内"
            />
          </a-form-item>
          <a-form-item label="任务描述">
            <a-textarea
              :maxLength="50"
              v-decorator="[
                'task_desc',
                {rules: [{required: true, message: '请输入任务描述'}], initialValue: taskDescDefault}
              ]"
              :rows="4"
              placeholder="请输入任务描述，50个字符以内"
            />
          </a-form-item>
          <!-- <a-form-item label="自动重启" v-if="taskType === 'cve fix'">
            <a-switch :checked="isResetChecked" @click="handleResetChanage">
              <a-icon slot="checkedChildren" type="check" />
              <a-icon slot="unCheckedChildren" type="close" />
            </a-switch>
          </a-form-item> -->
          <a-form-item label="是否accept" v-if="taskType === 'cve fix'">
            <description-tips v-if="taskType === 'cve fix'" style="margin-right: 6px">
              如使用热补丁修复，accept后会在重启时自动应用热补丁，不勾选则重启时失效
            </description-tips>
            <a-switch :checked="accepted" @click="handleAcceptedChanage">
              <a-icon slot="checkedChildren" type="check" />
              <a-icon slot="unCheckedChildren" type="close" />
            </a-switch>
          </a-form-item>
          <a-form-item label="冷补丁收编" v-if="taskType === 'cve fix'">
            <description-tips v-if="taskType === 'cve fix'" style="margin-right: 6px">
              仅针对内核：应用热补丁后会同步安装最新冷补丁。<br />若收编失败会自动accept热补丁
            </description-tips>
            <a-switch :checked="takeover" @click="handleTakeoverChanage">
              <a-icon slot="checkedChildren" type="check" />
              <a-icon slot="unCheckedChildren" type="close" />
            </a-switch>
          </a-form-item>
          <a-form-item label="选择REPO" v-if="taskType === 'repo set'">
            <a-select
              v-decorator="['repo', {rules: [{required: true, message: '请选择REPO'}]}]"
              placeholder="请选择REPO"
            >
              <a-select-option v-for="repo in repoList" :value="repo.repo_name" :key="repo.repo_id">
                {{ repo.repo_name }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-form>
        <div v-if="taskType === 'cve fix' || taskType === 'cve rollback'">
          <a-table
            rowKey="cve_id"
            :columns="taskType === 'cve fix' ? tableColumns : rollbacktableColumns"
            :data-source="cveList"
            :pagination="false"
          >
            <span slot="customTitle" v-if="taskType === 'cve rollback'"
              >{{ taskType === 'cve rollback' ? '热补丁修复' : '支持热补丁' }}
              <description-tips
                >包 若支持热补丁，默认使用热补丁修复；
                注意：由于一个软件包只能应用一个热补丁，热补丁修复时可能导致部分已修复cve重新生成
              </description-tips>
            </span>
            <span slot="customName"
              >主机
              <description-tips v-if="taskType === 'cve fix'"> cve选中的修复方式对应的主机数量 </description-tips>
            </span>
            <div slot="hostsList" slot-scope="hostsList">
              <a-spin v-if="hostUnderCveLoading" />
              <span v-else>
                {{ hostsList ? hostsList.length : 0 }}
              </span>
            </div>
            <div slot="packages" slot-scope="packages">
              <span>
                {{ packages }}
              </span>
            </div>
            <div slot="hotpatch" slot-scope="hotpatch">
              <span>
                {{ hotpatch ? '是' : '否' }}
              </span>
            </div>
            <a-table
              rowKey="host_id"
              slot="expandedRowRender"
              slot-scope="record"
              :columns="taskType === 'cve fix' ? innerColumns : rollbackinnerColumns"
              :rowSelection="{
                selectedRowKeys: selectedRowKeyMaps[record.cve_id] || [],
                getCheckboxProps: (it) => ({
                  props: {
                    disabled: !it.hotpatch && taskType === 'cve rollback'
                  }
                }),
                onChange: function (selectedRowKeys, selectedRows) {
                  onSelectChange(selectedRowKeys, selectedRows, record.cve_id);
                }
              }"
              :data-source="record.hostsList || []"
              :pagination="false"
            >
              <div slot="hotpatch" slot-scope="hotpatch">
                <span v-if="taskType === 'cve fix'">
                  <a-switch
                    :defaultChecked="hotpatch"
                    checked-children="是"
                    un-checked-children="否"
                    :disabled="!record.hotpatch || taskType === 'cve rollback'"
                    style="margin-bottom: 5px"
                    @change="hotchange(record.cve_id)"
                  />
                </span>
                <span v-else>
                  {{ hotpatch ? '是' : '否' }}
                </span>
              </div>
            </a-table>
          </a-table>
        </div>
        <div v-if="taskType === 'repo set' && dataType === 'all'" style="margin-bottom: 4px">
          根据筛选条件获取到以下主机：
        </div>
        <div v-if="taskType === 'repo set'">
          <a-table
            rowKey="host_id"
            :columns="tableColumnsRepo"
            :data-source="hostList"
            :rowSelection="repoRowSelection"
            :pagination="false"
          />
        </div>
        <div
          :style="{
            position: 'absolute',
            right: 0,
            bottom: 0,
            width: '100%',
            borderTop: '1px solid #e9e9e9',
            padding: '10px 16px',
            background: '#fff',
            textAlign: 'right',
            zIndex: 1
          }"
        >
          <a-button :style="{marginRight: '8px'}" @click="handleCancel"> 取消 </a-button>
          <a-button
            :style="{marginRight: '8px'}"
            type="primary"
            @click="handleSubmit(false)"
            :disabled="submitAndExecuteLoading || hostUnderCveLoading"
            :loading="submitLoading"
          >
            创建
          </a-button>
          <a-button
            type="primary"
            @click="handleSubmit(true)"
            :disabled="submitLoading || hostUnderCveLoading"
            :loading="submitAndExecuteLoading"
          >
            立即执行
          </a-button>
        </div>
      </div>
    </a-drawer>
    <a-modal :closable="false" :visible="jumpModalVisible" :footer="null" destroyOnClose>
      <div>
        <a-row type="flex" :gutter="12">
          <a-col>
            <a-icon type="check-circle" style="font-size: 32px; color: #52c41a" />
          </a-col>
          <a-col>
            <h3>{{ jumpModalTitle || '成功' }}</h3>
            <p>
              <a @click="jumpToPage">点击跳转到该任务页面</a>
            </p>
            <p>{{ countDown }}秒后回到原页面</p>
          </a-col>
        </a-row>
        <a-row type="flex" justify="end">
          <a-button type="primary" @click="jumpModalClose"> 关闭 </a-button>
        </a-row>
      </div>
    </a-modal>
  </div>
</template>

<script>
/**
 * 新建修复任务/repo设置任务弹窗
 */

import {getHostUnderMultipleCVE, generateTask, executeTask, generateRepoTask, generateRollbackTask} from '@/api/leaks';
import DescriptionTips from '@/components/DescriptionTips';

const taskTypes = ['cve fix', 'repo set', 'cve rollback'];
const dataTypes = ['selected', 'all'];
const taskTypsbutton = {
  'cve fix': '生成修复任务',
  'repo set': '设置REPO',
  'cve rollback': '生成回滚任务'
};
const taskTypsEnum = {
  'cve fix': 'cve修复',
  'repo set': 'repo设置',
  'cve rollback': 'cve回滚(当前仅支持热补丁回滚)'
};
const hostListTypes = ['byLoading', 'bySelection', 'byOneHost'];
// const restartTypesEnum = {
//   true: '是',
//   false: '否'
// };

export default {
  name: 'CreateRepairTaskDrawer',
  components: {
    DescriptionTips
  },
  props: {
    // 基本控制信息
    fixed: {
      type: Boolean,
      default: false
    },
    text: {
      type: String,
      default: '生成修复任务'
    },
    disabled: {
      type: Boolean,
      default: false
    },
    taskType: {
      type: String,
      default: taskTypes[0]
    },
    dataType: {
      type: String,
      default: dataTypes[0]
    },
    // 要修复的cve列表
    cveListProps: {
      type: Array,
      default: () => []
    },
    // cve下主机数据的获取方式：byLoading自行加载、bySelection和byOneHost都由外部传入
    hostListType: {
      type: String,
      default: hostListTypes[0]
    },
    // hostListType为bySelection和byOneHost时，使用此数据
    hostList: {
      type: Array,
      default: () => []
    },
    // 设置repo时，使用此属性进行选择
    repoList: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    },
    innerCveList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      hostListparams: [],
      fixParams: {},
      // 修复任务入参
      taskTypsbutton: taskTypsbutton,
      visible: false,
      taskTypsEnum,
      form: this.$form.createForm(this),
      // cve列表，包含开展开的host数据
      cveList: [],
      selectedRowKeyMaps: {},
      selectedRowsAllMaps: {},
      submitLoading: false,
      submitAndExecuteLoading: false,
      // 是否重启按钮数据
      isResetChecked: false,
      accepted: false,
      takeover: false,
      // 自动生成的任务名称和描述，初始化为空
      taskNameDefault: '',
      taskDescDefault: '',
      // 创建任务时，cve下action数据
      hostUnderCveLoading: false,

      selectedRepoKeys: [],
      selectedRepoRows: [],
      // 创建完成后跳转控制
      jumpTaskId: '',
      jumpModalTitle: '',
      jumpModalVisible: false,
      countDown: 5,
      jumpModalInterval: null
    };
  },
  computed: {
    tableColumns() {
      return [
        {
          dataIndex: 'cve_id',
          key: 'cve_id',
          title: 'CVE_ID',
          scopedSlots: {customRender: 'cve_id'},
          width: 150
        },
        {
          dataIndex: 'hostsList',
          key: 'hostsList',
          // title: '主机',
          slots: {title: 'customName'},
          width: 150,
          scopedSlots: {customRender: 'hostsList'}
        }
      ];
    },
    rollbacktableColumns() {
      return [
        {
          dataIndex: 'cve_id',
          key: 'cve_id',
          title: 'CVE_ID',
          scopedSlots: {customRender: 'cve_id'},
          width: 200
        },
        {
          dataIndex: 'hostsList',
          key: 'hostsList',
          title: '主机',
          width: 150,
          scopedSlots: {customRender: 'hostsList'}
        },
        // {
        //   dataIndex: 'package',
        //   key: 'package',
        //   title: '修复软件包',
        //   width: 140,
        //   customRender: (_package) => _package === '' ? '—' : _package,
        //   scopedSlots: {customRender: 'packages'}
        // },
        // {
        //   dataIndex: 'reboot',
        //   key: 'reboot',
        //   width: 80,
        //   title: <span>重启后生效</span>,
        //   customRender: (reboot) => restartTypesEnum[reboot]
        // },
        {
          dataIndex: 'hotpatch',
          key: 'hotpatch',
          slots: {title: 'customTitle'},
          scopedSlots: {customRender: 'hotpatch'}
        }
      ];
    },
    innerColumns() {
      return [
        {
          dataIndex: 'host_name',
          key: 'host_name',
          title: '主机'
        },
        {
          dataIndex: 'host_ip',
          key: 'host_ip',
          title: 'ip地址'
        }
      ];
    },
    rollbackinnerColumns() {
      return [
        {
          dataIndex: 'host_name',
          key: 'host_name',
          title: '主机'
        },
        {
          dataIndex: 'host_ip',
          key: 'host_ip',
          title: 'ip地址'
        },
        {
          dataIndex: 'hotpatch',
          key: 'hotpatch',
          title: '热补丁修复',
          scopedSlots: {customRender: 'hotpatch'}
        }
      ];
    },
    tableColumnsRepo() {
      return [
        {
          dataIndex: 'host_name',
          key: 'host_name',
          title: '主机名称'
        },
        {
          dataIndex: 'host_ip',
          key: 'host_ip',
          title: 'ip地址'
        }
      ];
    },
    repoRowSelection() {
      return {
        selectedRowKeys: this.selectedRepoKeys,
        onChange: this.onRepoSelectChange
      };
    }
  },
  watch: {},
  created() {},
  methods: {
    jumpToPage() {
      clearTimeout(this.jumpModalInterval);
      this.jumpModalVisible = false;
      this.$emit('createSuccess');
      this.$router.push({
        path: `/leaks/task/${this.taskType}/${this.jumpTaskId}`,
        query: {
          task_id: this.jumpTaskId
        }
      });
    },
    handleCancel() {
      // 弹窗关闭事件
      this.$emit('close');
      // clear status
      this.takeover = false;
      this.accepted = false;
      this.visible = false;
      this.cveList = [];
      this.fixParams = {};
      this.hostListparams = [];
      this.form.resetFields();
    },
    // 判断cve修复任务时是否有选择cve
    cveLiIsEmpty() {
      if (this.cveList.length !== 0) {
        return false;
      }
      this.visible = false;
      if (this.taskType === 'cve fix') {
        this.$message.info('至少需要选择一个CVE才能进行修复!');
      } else {
        this.$message.info('至少需要选择一个CVE才能进行回滚!');
      }
      this.hostUnderCveLoading = false;
      return true;
    },
    // 更改cve下主机的热更新状态
    hotchange(value) {
      this.cveList.forEach((item) => {
        if (item.cve_id === value) {
          item.hostsList.forEach((msg) => {
            this.$set(msg, 'hotpatch', !msg.hotpatch);
          });
        }
      });
    },
    findSameValues(array, key) {
      // 查找对象数组中是否有两个元素具有相同的某个值
      for (let i = 0; i < array.length; i++) {
        for (let j = i + 1; j < array.length; j++) {
          if (array[i][key] === array[j][key]) {
            return [array[i], array[j]];
          }
        }
      }
      return null;
    },
    // 每次展开抽屉时触发，替代mounted
    handleOpen() {
      // inital defualt data
      this.visible = true;
      this.cveList = this.cveListProps;
      this.isResetChecked = false;
      this.accepted = false;
      this.selectedRowKeyMaps = {};
      this.selectedRowsAllMaps = {};
      // 设置repo任务时，直接使用传入的host数据
      if (this.taskType === 'repo set') {
        this.selectedRepoKeys = this.hostList.map((host) => host.host_id);
        this.selectedRepoRows = this.hostList;
        this.setDefaultInfo();
        // 自动填写默认任务信息
        return;
      }

      const _this = this;
      if (this.taskType === 'cve fix') {
        if (this.cveLiIsEmpty()) {
          return;
        }
        if (this.innerCveList.length !== 0) {
          const cveListparam = this.cveList.map((cve) => {
            return {
              cve_id: cve.cve_id,
              rpms: []
            };
          });
          this.innerCveList.forEach((item) => {
            if (cveListparam.some((it) => it.cve_id === item.cve_id)) {
              const index = cveListparam.findIndex((id) => id.cve_id === item.cve_id);
              cveListparam.splice(index, 1);
            }
          });
          // 去除两个数组中具有相同cve_id的重复的值
          const uni = Array.from(new Set([...cveListparam, ...this.innerCveList]));
          this.fixParams = {
            cveList: uni,
            fixed: this.fixed
          };
          // 取去重后两个数组的并集
        } else {
          const cveFixParams = this.cveList.map((cve) => {
            return {
              cve_id: cve.cve_id,
              rpms: []
            };
          });
          this.fixParams = {
            cveList: cveFixParams,
            fixed: this.fixed
          };
        }
        switch (this.hostListType) {
          case hostListTypes[0]:
            _this.hostUnderCveLoading = true;
            getHostUnderMultipleCVE(this.fixParams)
              .then(function (res) {
                // hostlists are contained in cveMap
                const cveMap = res.data.result || {};
                const cveKey = Object.keys(cveMap);
                cveKey.forEach((item) => {
                  if (!_this.cveList.some((it) => it.cve_id === item)) {
                    _this.cveList.push({
                      cve_id: item,
                      package: cveMap[item].package
                    });
                  }
                });
                _this.addHostListToCVEData(cveMap);
              })
              .catch(function (err) {
                _this.$message.error(err.response.message);
              })
              .finally(function () {
                _this.hostUnderCveLoading = false;
              });
            break;
          case hostListTypes[1]:
            // hostListType为bySelection cve详情下的受影响主机界面
            // if (this.cveLiIsEmpty()) {
            //   return;
            // }
            if (this.cveList.length === 0) {
              this.cveList = this.innerCveList;
            }
            const tempObj1 = {};
            this.cveList.forEach((cve) => {
              tempObj1[cve.cve_id] = this.hostList.map((host) => {
                return {
                  host_id: host.host_id,
                  host_name: host.host_name,
                  host_ip: host.host_ip
                  // hotpatch: host.hotpatch
                  // 当传入hostList为cve列表下选择的主机列表时，直接选用当前主机的hotpatch
                };
              });
            });
            this.addHostListToCVEData(tempObj1);
            break;
          case hostListTypes[2]:
            // hostListType为byOneHost 主机详情界面下的cve界面
            // if (this.cveLiIsEmpty()) {
            //   return;
            // }
            if (this.cveList.length === 0) {
              this.cveList = this.innerCveList;
            }
            const tempObj2 = {};
            this.cveList.forEach((cve) => {
              tempObj2[cve.cve_id] = this.hostList.map((host) => {
                return {
                  host_id: host.host_id,
                  host_name: host.host_name,
                  host_ip: host.host_ip
                  // hotpatch: cve.hotpatch
                  // 当传入hostList为主机列表下选择的cve列表时，选用cveList循环到当前cve的hotpatch
                };
              });
            });
            this.addHostListToCVEData(tempObj2);
            break;
        }
      }

      if (this.taskType === 'cve rollback') {
        // 根据主机数据获取类型，自行或cve下的主机数据或者使用外部输入的主机数据更行talbe数据
        if (this.cveLiIsEmpty()) {
          return;
        }
        if (this.innerCveList.length !== 0) {
          const cveListparam = this.cveList.map((cve) => {
            return {
              cve_id: cve.cve_id,
              rpms: []
            };
          });
          this.innerCveList.forEach((item) => {
            if (cveListparam.some((it) => it.cve_id === item.cve_id)) {
              const index = cveListparam.findIndex((id) => id.cve_id === item.cve_id);
              cveListparam.splice(index, 1);
            }
          });
          // 去除两个数组中具有相同cve_id的重复的值
          const uni = Array.from(new Set([...cveListparam, ...this.innerCveList]));
          this.fixParams = {
            cveList: uni,
            fixed: this.fixed
          };
          // 取去重后两个数组的并集
        } else {
          const cveFixParams = this.cveList.map((cve) => {
            return {
              cve_id: cve.cve_id,
              rpms: []
            };
          });
          this.fixParams = {
            cveList: cveFixParams,
            fixed: this.fixed
          };
        }
        switch (this.hostListType) {
          case hostListTypes[0]:
            // hostListType为byLoading
            _this.hostUnderCveLoading = true;
            getHostUnderMultipleCVE(this.fixParams)
              .then(function (res) {
                // hostlists are contained in cveMap
                const cveMap = res.data.result || {};
                const cveKey = Object.keys(cveMap);
                cveKey.forEach((cve) => {
                  let existsHotpatch = false;
                  if (!_this.cveList.some((it) => it.cve_id === cve)) {
                    _this.cveList.push({
                      cve_id: cve,
                      package: cveMap[cve].package
                    });
                  }
                  cveMap[cve].hosts.forEach((host) => {
                    if (host.hotpatch) {
                      existsHotpatch = true;
                    }
                  });
                  _this.cveList.forEach((cveinfo, index) => {
                    if (cveinfo.cve_id === cve) {
                      _this.cveList[index].hotpatch = existsHotpatch;
                    }
                  });
                });
                _this.addHostListToCVEData(cveMap);
              })
              .catch(function (err) {
                _this.$message.error(err.response.message);
              })
              .finally(function () {
                _this.hostUnderCveLoading = false;
              });
            break;
          case hostListTypes[1]:
            // hostListType为bySelection cve详情界面下的受影响主机界面
            _this.hostUnderCveLoading = true;
            _this.hostList.forEach((item) => {
              _this.hostListparams.push(item.host_id);
            });
            _this.$set(_this.fixParams, 'host_list', _this.hostListparams);
            getHostUnderMultipleCVE(this.fixParams)
              .then(function (res) {
                // hostlists are contained in cveMap
                const cveMap = res.data.result || {};
                const cveKey = Object.keys(cveMap);
                cveKey.forEach((cve) => {
                  let existsHotpatch = false;
                  if (!_this.cveList.some((it) => it.cve_id === cve)) {
                    _this.cveList.push({
                      cve_id: cve,
                      package: cveMap[cve].package
                    });
                  }
                  cveMap[cve].hosts.forEach((host) => {
                    if (host.hotpatch) {
                      existsHotpatch = true;
                    }
                  });
                  _this.cveList.forEach((cveinfo, index) => {
                    if (cveinfo.cve_id === cve) {
                      _this.cveList[index].hotpatch = existsHotpatch;
                    }
                  });
                });
                _this.addHostListToCVEData(cveMap);
              })
              .catch(function (err) {
                _this.$message.error(err.response.message);
              })
              .finally(function () {
                _this.hostUnderCveLoading = false;
              });
            break;
          case hostListTypes[2]:
            // hostListType为byOneHost 主机详情界面下的cve界面
            _this.hostList.forEach((item) => {
              _this.hostListparams.push(item.host_id);
            });
            _this.$set(_this.fixParams, 'host_list', _this.hostListparams);
            _this.hostUnderCveLoading = true;
            getHostUnderMultipleCVE(this.fixParams)
              .then(function (res) {
                // hostlists are contained in cveMap
                const cveMap = res.data.result || {};
                const cveKey = Object.keys(cveMap);
                cveKey.forEach((cve) => {
                  let existsHotpatch = false;
                  if (!_this.cveList.some((it) => it.cve_id === cve)) {
                    _this.cveList.push({
                      cve_id: cve,
                      package: cveMap[cve].package
                    });
                  }
                  cveMap[cve].hosts.forEach((host) => {
                    if (host.hotpatch) {
                      existsHotpatch = true;
                    }
                  });
                  _this.cveList.forEach((cveinfo, index) => {
                    if (cveinfo.cve_id === cve) {
                      _this.cveList[index].hotpatch = existsHotpatch;
                    }
                  });
                });
                _this.addHostListToCVEData(cveMap);
              })
              .catch(function (err) {
                _this.$message.error(err.response.message);
              })
              .finally(function () {
                _this.hostUnderCveLoading = false;
              });
            break;
        }
      }
    },
    handleSubmit(excuteASAP = false) {
      const _this = this;
      this.form.validateFields((err, values) => {
        if (!err) {
          if (!excuteASAP) {
            // this.submitLoading = true;
          } else {
            this.submitAndExecuteLoading = true;
          }
          switch (this.taskType) {
            case 'cve fix':
              // prepare data
              const params = {
                ...values,
                takeover: this.takeover,
                check_items: [],
                accepted: this.accepted,
                info: this.cveList
                  .map((cveInfo) => {
                    return {
                      cve_id: cveInfo.cve_id,
                      host_info: this.selectedRowsAllMaps[cveInfo.cve_id],
                      rpms: this.fixParams.cveList.find((it) => it.cve_id === cveInfo.cve_id).rpms || []
                    };
                  })
                  .filter((item) => item.host_info && item.host_info.length > 0)
              };
              params.info.forEach((item) => {
                item.host_info.forEach((it) => {
                  delete it.host_name;
                  delete it.host_ip;
                });
              });
              if (params.info.length === 0) {
                this.$message.info('请至少选择一个cve下的一台主机进行修复!');
                this.submitLoading = false;
                this.submitAndExecuteLoading = false;
                break;
              } else {
                // make request
                generateTask(params)
                  .then(function (res) {
                    _this.$message.success(res.message);
                    if (excuteASAP) {
                      _this.handleExcuteASAP(res.data.task_id, res.data);
                    } else {
                      _this.visible = false;
                      _this.handleGenerateSuccess(res.data, 'CVE修复', 'normal');
                    }
                  })
                  .catch(function (err) {
                    _this.$message.error(err.response.message);
                  })
                  .finally(function () {
                    if (!excuteASAP) {
                      _this.submitLoading = false;
                    }
                  });
                break;
              }
            case 'repo set':
              // prepare data
              if (this.selectedRepoRows.length !== 0) {
                const repoParams = {
                  ...values,
                  info: this.selectedRepoRows.map((host) => {
                    return {
                      host_id: host.host_id
                    };
                  })
                };
                // make request
                generateRepoTask(repoParams)
                  .then(function (res) {
                    _this.$message.success(res.message);
                    if (excuteASAP) {
                      _this.handleExcuteASAP(res.data.task_id, res.data);
                    } else {
                      _this.visible = false;
                      _this.handleGenerateSuccess(res.data, 'REPO设置', 'normal');
                    }
                  })
                  .catch(function (err) {
                    _this.$message.error(err.response.message);
                    _this.submitAndExecuteLoading = false;
                  })
                  .finally(function () {
                    if (!excuteASAP) {
                      _this.submitLoading = false;
                    }
                  });
                break;
              } else {
                this.$message.info('至少需要选择一个主机才能设置repo任务!');
                this.submitLoading = false;
                this.submitAndExecuteLoading = false;
                break;
              }
            case 'cve rollback':
              // prepare data
              const cveRollback = Object();
              this.cveList.forEach((cveInfo) => {
                cveInfo.hostsList.forEach((host) => {
                  const cveRollbackInfo = {
                    cve_id: cveInfo.cve_id,
                    hotpatch: host.hotpatch
                  };
                  if (this.selectedRowKeyMaps[cveInfo.cve_id].includes(host.host_id)) {
                    // 筛选出选中的某主机中的cve
                    if (cveRollback.hasOwnProperty(host.host_id)) {
                      cveRollback[host.host_id].push(cveRollbackInfo);
                    } else {
                      cveRollback[host.host_id] = [cveRollbackInfo];
                    }
                  }
                });
              });
              const cveRoobackInfo = Object.keys(cveRollback).map((hostId) => {
                return {
                  host_id: Number(hostId),
                  cves: cveRollback[hostId]
                };
              });
              const rollParams = {
                task_name: values.task_name,
                description: values.task_desc,
                info: cveRoobackInfo
              };
              if (cveRoobackInfo.length === 0) {
                this.$message.info('请至少选择一个cve下的一台主机进行回滚!');
                this.submitLoading = false;
                this.submitAndExecuteLoading = false;
                break;
              } else {
                generateRollbackTask(rollParams)
                  .then(function (res) {
                    _this.$message.success(res.message);
                    if (excuteASAP) {
                      _this.handleExcuteASAP(res.data.task_id, res.data);
                    } else {
                      _this.visible = false;
                      _this.handleGenerateSuccess(res.data, 'CVE回滚', 'normal');
                    }
                  })
                  .catch(function (err) {
                    _this.$message.error(err.response.message);
                  })
                  .finally(function () {
                    if (!excuteASAP) {
                      _this.submitLoading = false;
                    }
                  });
                break;
              }
          }
        }
      });
    },
    // 立即执行任务
    handleExcuteASAP(taskId, data) {
      const _this = this;
      executeTask(taskId)
        .then(function (res) {
          let text = '';
          switch (data.type) {
            case 'cve fix':
              text = 'CVE修复';
              break;
            case 'repo set':
              text = 'REPO设置';
              break;
            case 'cve rollback':
              text = 'CVE回滚';
              break;
          }

          _this.visible = false;
          _this.handleGenerateSuccess(data, text, 'asap');
        })
        .catch(function (err) {
          _this.$message.error(err.response.message);
        })
        .finally(function () {
          _this.submitAndExecuteLoading = false;
        });
    },
    handleResetChanage(checked) {
      this.isResetChecked = checked;
    },
    handleAcceptedChanage(checked) {
      this.accepted = checked;
    },
    handleTakeoverChanage(checked) {
      this.takeover = checked;
    },
    onSelectChange(selectedRowKeys, selectedRows, cid) {
      this.selectedRowKeyMaps[cid] = selectedRowKeys;
      this.selectedRowsAllMaps[cid] = selectedRows;
      this.selectedRowKeyMaps = Object.assign({}, this.selectedRowKeyMaps);
      this.selectedRowsAllMaps = Object.assign({}, this.selectedRowsAllMaps);
    },
    // 工具方法，将主机信息更新进cve数据中
    getHostListUnderCve(val, key) {
      if (this.taskType === 'cve rollback') {
        return val[key].hosts;
      }
      if (this.taskType === 'cve fix') {
        if (this.hostListType === 'byLoading') {
          return val[key].hosts;
        } else {
          return val[key];
        }
      }
    },
    addHostListToCVEData(cveMap) {
      this.cveList.forEach((cveInfo) => {
        // const hostListUnderCve = this.hostListType === 'byLoading' ? cveMap[cveInfo.cve_id].hosts : cveMap[cveInfo.cve_id];
        const hostListUnderCve = this.getHostListUnderCve(cveMap, cveInfo.cve_id);
        cveInfo.hostsList = hostListUnderCve || [];
        if (hostListUnderCve && hostListUnderCve.length > 0) {
          if (this.taskType === 'cve fix') {
            this.selectedRowKeyMaps[cveInfo.cve_id] = hostListUnderCve.map((host) => host.host_id);
          } else if (this.taskType === 'cve rollback') {
            this.selectedRowKeyMaps[cveInfo.cve_id] = hostListUnderCve
              .filter((host) => host.hotpatch === true)
              .map((host) => host.host_id);
          }
          this.selectedRowsAllMaps[cveInfo.cve_id] = hostListUnderCve;
        } else {
          this.selectedRowKeyMaps[cveInfo.cve_id] = [];
          this.selectedRowsAllMaps[cveInfo.cve_id] = [];
        }
      });
      // forced refresh
      this.cveList = Object.assign([], this.cveList);
      this.setDefaultInfo();
      // 自动填写默认任务信息
    },
    // repo
    onRepoSelectChange(selectedRowKeys, selectedRows) {
      this.selectedRepoKeys = selectedRowKeys;
      this.selectedRepoRows = selectedRows;
    },
    // 当创建任务成功或执行任务成功后，弹窗提示用户是否跳转
    handleGenerateSuccess(res, type, modalType) {
      const _this = this;
      this.jumpTaskId = res.task_id;
      this.jumpModalVisible = true;
      let text = '';
      switch (modalType) {
        case 'normal':
          text = `${type}任务创建成功`;
          break;
        case 'asap':
          text = `${type}任务创建成功，正在执行中...`;
          break;
      }
      this.jumpModalTitle = text;
      this.countDown = 5;
      this.jumpModalInterval = setInterval(function () {
        _this.countDown = _this.countDown - 1;
        if (_this.countDown === 0) {
          clearTimeout(_this.jumpModalInterval);
          _this.jumpModalClose();
        }
      }, 1000);
    },
    jumpModalClose() {
      clearTimeout(this.jumpModalInterval);
      this.jumpModalVisible = false;
      this.$emit('createSuccess');
    },
    // 自动填写任务信息
    setDefaultInfo() {
      // this.taskNameDefault = `${this.taskType === 'cve fix' ? 'CVE修复任务' : 'REPO设置任务'}`;
      switch (this.taskType) {
        case 'cve fix':
          this.taskNameDefault = 'CVE修复任务';
          this.taskDescDefault = `修复以下${this.cveList.length}个CVE：${this.cveList
            .map((cve) => cve.cve_id)
            .join('、')}`;
          break;
        case 'cve rollback':
          this.taskNameDefault = 'CVE回滚任务';
          this.taskDescDefault = `回滚以下${this.cveListProps.length}个CVE：${this.cveListProps
            .map((cve) => cve.cve_id)
            .join('、')}`;
          break;
        case 'repo set':
          this.taskNameDefault = 'REPO设置任务';
          this.taskDescDefault = `为以下${this.hostList.length}个主机设置Repo：${this.hostList
            .map((host) => host.host_name)
            .join('、')}`;
          break;
      }
      if (this.taskNameDefault.length > 20) {
        this.taskNameDefault = this.taskDescDefault.slice(0, 17) + '...';
      }
      if (this.taskDescDefault.length > 50) {
        this.taskDescDefault = this.taskDescDefault.slice(0, 47) + '...';
      }
    }
  }
};
</script>
