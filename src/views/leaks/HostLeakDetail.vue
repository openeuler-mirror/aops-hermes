<template>
  <page-header-wrapper :breadcrumb="breadcrumb">
    <a-card :bordered="false" class="aops-theme">
      <a-spin :spinning="infoLoading">
        <div class="detail-info-content">
          <h1>{{ detail.host_name }}</h1>
          <a-row type="flex">
            <a-col span="8">
              <p>{{ `主机组： ${detail.host_group || ''}` }}</p>
            </a-col>
            <a-col span="8">
              <p>{{ `未修复的CVE数量： ${detail.affected_cve_num}` }}</p>
            </a-col>
            <a-col span="8">
              <p>{{ `CVE REPO： ${detail.repo || ''}` }}</p>
            </a-col>
            <a-col span="8">
              <p>{{ `IP： ${detail.host_ip || ''}` }}</p>
            </a-col>
            <a-col span="8">
              <p>{{ `已修复的CVE数量： ${detail.fixed_cve_num}` }}</p>
            </a-col>
            <a-col span="8">
              <p>
                {{
                  `上次扫描： ${(detail.last_scan && dateFormat('YYYY-mm-dd HH:MM:SS', detail.last_scan * 1000)) || ''}`
                }}
              </p>
            </a-col>
            <a-col span="8">
              <a-button type="primary" @click="sacnHost" :loading="scanloading || scanStatus === 3">
                {{ scanStatus === 3 ? '扫描中' : '漏洞扫描' }}
              </a-button>
              <a-button type="primary" @click="handleExport" style="margin-left: 20px"> 导出cve信息 </a-button>
            </a-col>
            <a-col span="8">
              <p>{{ `不受影响的CVE数量： ${detail.unaffected_cve_num}` }}</p>
            </a-col>
            <a-col span="8">
              <p>{{ `重启后内核变更： ${detail.reboot ? '是' : '否'}` }}</p>
            </a-col>
          </a-row>
        </div>
      </a-spin>
    </a-card>
    <a-card :bordered="false" class="aops-theme">
      <h1>CVEs</h1>
      <cves-table
        ref="cve_table"
        :hostId="hostId"
        :inputList="cveList"
        :inputLoading="cveIsLoading"
        :hostList="[detail]"
        @statusUpdated="handleStatusUpdated"
        @getTableData="getCveData"
        @updataCveAllList="updataCveAllList"
        :paginationTotal="paginationTotal"
        @getCveAll="getCveAllList"
        :cveAllIsLoadingProp="cveAllIsLoading"
        :cveAllListProp="cveAllList"
      />
    </a-card>
  </page-header-wrapper>
</template>

<script>
/**
 * 主机详情页面
 */

import {PageHeaderWrapper} from '@ant-design-vue/pro-layout';
import CvesTable from './components/CvesTable';
import {downloadBlobFile} from '@/views/utils/downloadBlobFile';
import {i18nRender} from '@/vendor/ant-design-pro/locales';
import {dateFormat} from '@/views/utils/Utils';
import {getHostInfo, getCveUnderHost, scanHost, getHostScanStatus, getCveExport} from '@/api/leaks';
import configs from '@/config/defaultSettings';

export default {
  name: 'HostLeakDetail',
  components: {
    PageHeaderWrapper,
    CvesTable
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
            // 若为路由diyBreadcrumb数组的最后一个元素，替换标题文本为其对应的主机名称
            if (routes.indexOf(route) === routes.length - 1) {
              return <span>{this.detail.host_name}</span>;
            } else {
              return <router-link to={route.path}>{route.breadcrumbName}</router-link>;
            }
          }
        }
      };
    }
  },
  data() {
    return {
      hostId: this.$route.params.host_id,
      detail: {},
      infoLoading: false,
      // 需要传给子组件的数据
      cveList: [],
      cveIsLoading: false,
      paginationTotal: undefined,
      affected: true,
      cveAllList: [],
      cveAllIsLoading: false,
      // 主机扫描状态数据
      scanloading: false,
      scanStatusloading: false,
      scanStatus: '',
      getScanStatusTimeout: null
    };
  },
  methods: {
    dateFormat,
    handleExport() {
      const _this = this;
      getCveExport([_this.hostId])
        .then(function (res) {
          downloadBlobFile(res.data, res.fileName);
        })
        .catch(function (err) {
          _this.$message.error(err.response.message);
        })
        .finally(function () {
          _this.scanStatusloading = false;
        });
    },
    getDetail() {
      const _this = this;
      this.infoLoading = true;
      getHostInfo({
        host_id: this.hostId
      })
        .then(function (res) {
          const resultObj = res.data.result || {};
          resultObj.host_id = _this.hostId;
          _this.detail = resultObj;
          // _this.getCVEList(res.info && res.info.cveList)
        })
        .finally(function () {
          _this.infoLoading = false;
        });
    },
    getCveData(data) {
      this.getCVEList(this.hostId, data);
    },
    getCVEList(hostId, data) {
      const _this = this;
      this.cveIsLoading = true;
      getCveUnderHost({
        ...data,
        host_id: hostId
      })
        .then(function (res) {
          _this.cveList = res.data.result;
          _this.cveList.forEach((item) => {
            item.hp_status = item.hp_status ? item.hp_status : '——';
            item.fixStatus = item.hotpatch ? `是(${item.hp_status})` : '否';
          });
          _this.paginationTotal = res.data.total_count || (res.data.total_count === 0 ? 0 : undefined);
        })
        .catch(function (err) {
          _this.$message.error(err.response.message);
        })
        .finally(function () {
          _this.cveIsLoading = false;
        });
    },
    getCveAllList(data) {
      const _this = this;
      // this.cveAllIsLoading = true;
      getCveUnderHost({
        ...data,
        host_id: this.hostId
      })
        .then(function (res) {
          _this.cveAllList = res.data.result;
        })
        .catch(function (err) {
          _this.$message.error(err.response.message);
        })
        .finally(function () {
          _this.cveAllIsLoading = false;
        });
    },
    updataCveAllList(val) {
      this.cveAllList = val;
    },
    handleStatusUpdated(data) {
      this.getCVEList(this.hostId, data);
    },
    sacnHost() {
      const _this = this;
      this.scanloading = true;
      scanHost({
        hostList: [Number(_this.hostId)],
        filter: null
      })
        .then(function (res) {
          _this.$message.success(res.message);
          _this.scanStatus = 3;
          _this.getScanStatue();
        })
        .catch(function (err) {
          _this.$message.error(err.response.message);
        })
        .finally(function () {
          _this.scanloading = false;
        });
    },
    // 轮训查询当前主机的扫描状态
    getScanStatue() {
      const _this = this;
      this.scanStatusloading = true;
      clearTimeout(this.getScanStatusTimeout);
      getHostScanStatus({
        hostList: [_this.hostId]
      })
        .then(function (res) {
          _this.scanStatus = res.data.result[_this.hostId];
          if (_this.scanStatus === 3) {
            _this.getScanStatusTimeout = setTimeout(function () {
              _this.getScanStatue();
            }, configs.scanProgressInterval);
          } else {
            // 扫描完成后重新请求主机详情列表
            _this.getDetail();
            _this.$refs.cve_table.getCves();
            setTimeout(() => {
              _this.$refs.cve_table.getCvesAll();
            }, 500);
          }
        })
        .catch(function (err) {
          _this.$message.error(err.response.message);
        })
        .finally(function () {
          _this.scanStatusloading = false;
        });
    }
  },
  mounted: function () {
    this.getDetail();
    this.getScanStatue();
  },
  beforeDestroy() {
    // 离开页面前，若当前存在轮询，清除轮询
    if (this.getScanStatusTimeout) {
      clearInterval(this.getScanStatusTimeout);
      this.getScanStatusTimeout = null;
    }
  }
};
</script>

<style lang="less" scoped>
.detail-info-content {
  h1 {
    font-size: 24px;
    font-weight: bold;
    color: rgba(0, 0, 0, 0.65);
  }
  padding: 12px 12px 12px 24px;
}
.scan-text {
  margin-left: 6px;
  font-size: 14px;
}
</style>
