<!-- eslint-disable vue/max-attributes-per-line -->
<template>
  <a-drawer :title="this.propType === 'rpm' ? 'CVE-主机列表' : 'RPM-主机列表'" closable :visible="visible" width="600" @close="handleClose">
    <a-table rowKey="host_id" :columns="this.propType === 'rpm' ? columns : rpmColumns" :data-source="tableData" :pagination="false"
      :loading="tableIsLoading" bordered>
      <div slot="status" slot-scope="status">
        <span>
          <a-badge :status="statusValueMap[status]" />
          {{ taskType === 'cve fix' ? fixStatusTextMap[status] : rollbackStatusTextMap[status] }}
        </span>
      </div>
    </a-table>
  </a-drawer>
</template>

<script>
/**
 * 展示任务中各个主机状态的抽屉组件
 */

import {getHostOfCveInCveTask, getCveRpmHostUnderLeak} from '@/api/leaks';

const fixStatusTextMap = {
  succeed: '已修复',
  fail: '未修复',
  running: '运行中',
  unknown: '未知'
};

const rollbackStatusTextMap = {
  succeed: '已回滚',
  fail: '待回滚',
  running: '运行中',
  unknown: '未知'
};

const statusValueMap = {
  succeed: 'success',
  fail: 'error',
  running: 'processing',
  unknown: 'default'
};

export default {
  name: 'HostStatusInTaskDrawer',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    taskId: {
      type: String,
      default: null
    },
    cveId: {
      type: String,
      default: null
    },
    taskType: {
      type: String,
      default: 'cve fix'
    },
    propType: {
      type: String,
      default: 'rpm'
    },
    rpmrecord: {
      type: Object,
      default: undefined
    }
  },
  data() {
    return {
      tableData: [],
      tableIsLoading: false,
      rollbackStatusTextMap,
      fixStatusTextMap,
      statusValueMap
    };
  },
  computed: {
    columns() {
      return [
        {
          dataIndex: 'index',
          title: '序号'
        },
        {
          dataIndex: 'host_name',
          title: '主机名'
        },
        {
          dataIndex: 'host_ip',
          title: 'IP地址'
        },
        {
          dataIndex: 'status',
          title: '最新状态',
          scopedSlots: {customRender: 'status'}
        }
      ];
    },
    rpmColumns() {
      return [
        {
          dataIndex: 'index',
          title: '序号'
        },
        {
          dataIndex: 'host_name',
          title: '主机名'
        },
        {
          dataIndex: 'host_ip',
          title: 'IP地址'
        }
      ];
    }
  },
  watch: {
    visible() {
      if (this.visible) {
        const _this = this;
        this.tableIsLoading = true;
        if (this.propType === 'rpm') {
          getHostOfCveInCveTask({
            taskId: this.taskId,
            cveList: [this.cveId]
          })
            .then(function (res) {
              _this.tableData = (res.data.result && res.data.result[_this.cveId]) || [];
              _this.tableData = _this.tableData.map((row, idx) => {
                const tempObj = row;
                tempObj.index = idx + 1;
                return tempObj;
              });
            })
            .catch(function (err) {
              _this.$message.error(err.response.message);
            })
            .finally(function () {
              _this.tableIsLoading = false;
            });
        } else {
            getCveRpmHostUnderLeak({
              task_id: this.taskId,
              cve_id: this.cveId,
              installed_rpm: this.rpmrecord.installed_rpm,
              available_rpm: this.rpmrecord.available_rpm
            })
              .then(function (res) {
                _this.tableData = res.data || [];
                _this.tableData = _this.tableData.map((row, idx) => {
                  const tempObj = row;
                  tempObj.index = idx + 1;
                  return tempObj;
                });
              })
              .catch(function (err) {
                _this.$message.error(err.response.message);
              })
              .finally(function () {
                _this.tableIsLoading = false;
              });
        }
      }
    }
  },
  methods: {
    handleClose() {
      this.$emit('close');
    }
  }
};
</script>
<style lang="less" scoped></style>
