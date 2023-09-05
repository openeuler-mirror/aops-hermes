<!-- eslint-disable vue/max-attributes-per-line -->
<template>
  <a-drawer title="RPM-主机列表" closable :visible="visible" width="600" @close="handleClose">
    <a-table rowKey="host_id" :columns="columns" :data-source="tableData" :pagination="false"
      :loading="tableIsLoading" bordered>
    </a-table>
  </a-drawer>
</template>

<script>
/**
 * 展示任务中各个主机状态的抽屉组件
 */

import {getRpmUnderCve} from '@/api/leaks';

export default {
  name: 'HostInCveRpm',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    packageOfCve: {
      type: String,
      default: null
    },
    cveId: {
      type: String,
      default: null
    },
    propAvailablerpm: {
      type: String,
      default: null
    },
    propInstalledrpm: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      tableData: [],
      tableIsLoading: false
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
        }
      ];
    }
  },
  watch: {
    visible() {
      if (this.visible) {
        const _this = this;
        this.tableIsLoading = true;
        const params = {
          page: 1,
          per_page: 10,
          cve_id: this.cveId,
          available_rpm: this.propAvailablerpm,
          installed_rpm: this.propInstalledrpm,
          direction: 'asc'
        }
        getRpmUnderCve(params)
          .then(function (res) {
            _this.tableData = res.data.result;
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
  },
  methods: {
    handleClose() {
      this.$emit('close');
    }
  }
};
</script>
<style lang="less" scoped></style>
