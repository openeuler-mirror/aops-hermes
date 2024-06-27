<template>
  <a-spin :spinning="collapseIsLoading">
    <div class="conf-section">
      <h1>主机当前配置</h1>
      <div>主机：{{ host.hostId }}</div>
      <div>IP地址：{{ host.ip }}</div>
      <a-collapse @change="handlePanelChange">
        <a-collapse-panel v-for="item in confs" :key="item.filePath" :header="`配置项：${item.filePath}`">
          <div class="conf-description">
            <a-descriptions title="属性" :column="2">
              <a-descriptions-item label="fileAttr">
                {{ item.fileAttr }}
              </a-descriptions-item>
              <a-descriptions-item label="fileOwner">
                {{ item.fileOwner }}
              </a-descriptions-item>
              <a-descriptions-item label="rpmName">
                {{ item.rpmName }}
              </a-descriptions-item>
              <a-descriptions-item label="spacer">
                {{ item.spacer }}
              </a-descriptions-item>
              <a-descriptions-item label="rpmVersion">
                {{ item.rpmVersion }}
              </a-descriptions-item>
              <a-descriptions-item label="rpmRelease">
                {{ item.rpmRelease }}
              </a-descriptions-item>
            </a-descriptions>
          </div>
          <div class="conf-content">
            <a-row type="flex" justify="space-between" class="conf-content-header">
              <a-col>
                <div class="ant-descriptions-title">文本内容：</div>
              </a-col>
              <a-col v-if="item.syncStatus === 'NOT SYNC'">
                <a-button type="primary" @click="showCompareDrawer(item)"> 差异对比 </a-button>
              </a-col>
            </a-row>
            <div class="text-container">
              {{ item.confContents }}
            </div>
          </div>
          <div class="conf-trace">
            <a-row type="flex" justify="space-between" class="conf-content-header">
              <a-col>
                <div class="ant-descriptions-title">操作记录：</div>
              </a-col>
            </a-row>
            <div>当前显示{{ confTraceInfos.length }}条监控信息</div>
            <a-table
                :rowKey="rowKey"
                :columns="columns"
                :data-source="confTraceInfos"
                :loading="isLoading"
                :pagination="pagination"
                @change="handlePanelChange"/>
          </div>
          <template slot="extra" v-if="item.syncStatus === 'NOT SYNC'">
            <a-icon type="close-circle" theme="twoTone" two-tone-color="#ff0000" />
            <span style="color: #ff0000">&nbsp;与业务域配置不一致</span>
          </template>
          <template slot="extra" v-if="item.syncStatus === 'SYNC'">
            <a-icon type="check-circle" theme="twoTone" two-tone-color="#52c41a" />
            <span>&nbsp;与业务域配置一致</span>
          </template>
        </a-collapse-panel>
      </a-collapse>
    </div>
    <div class="conf-section">
      <h1>主机缺失配置</h1>
      <a-collapse>
        <a-collapse-panel v-for="item in confsNotInHost" :key="item.filePath" :header="`配置项：${item.filePath}`">
          <div class="conf-content">
            <a-row type="flex" justify="space-between" class="conf-content-header">
              <a-col>
                <div class="ant-descriptions-title">文本内容：</div>
              </a-col>
            </a-row>
            <div class="text-container">
              {{ item.contents }}
            </div>
          </div>
          <template slot="extra">
            <a-icon type="exclamation-circle" theme="twoTone" two-tone-color="#f00" />
            <span style="color: #f00">&nbsp;主机中无该项配置</span>
          </template>
        </a-collapse-panel>
      </a-collapse>
    </div>
    <a-drawer width="800" :visible="compareDrawerVisible" @close="closeCompareDrawer">
      <compare-diff-view :comparedConf="comparedConf" />
    </a-drawer>
  </a-spin>
</template>

<script>
import Vue from 'vue';
import MyPageHeaderWrapper from '@/views/utils/MyPageHeaderWrapper';
import {Collapse} from 'ant-design-vue';
import CompareDiffView from './CompareDiffView';
import {checkIsDiff} from '../utils/compareContent';

import {queryConfTraceInfos, queryRealConfs} from '@/api/configuration';
import {isArray} from 'ant-design-vue/lib/_util/vue-types/utils';
Vue.use(Collapse);

const Diff = require('diff');

const defaultPagination = {
    current: 1,
    pageSize: 10,
    showTotal: (total) => `总计 ${total} 项`,
    showSizeChanger: true,
    showQuickJumper: true
};
export default {
  name: 'QueryRealConfsDrawer',
  inject: ['onload'], // 来自祖辈们provide中声明的参数、方法
  components: {
    Collapse,
    CompareDiffView,
    MyPageHeaderWrapper
  },
  props: {
    confsOfDomain: {
      type: Array,
      default: () => []
    },
    confsOfDomainLoading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      domainName: '',
      collapseIsLoading: false,
      confsOfHost: [],
      confs: [],
      confTraceInfos: [],
      confsNotInHost: [],
      host: {},
      compareDrawerVisible: false,
      comparedConf: {},
      pagination: defaultPagination,
      isLoading: false,
      rowKey: 'conf_name',
      temp_conf: ''
    };
  },
  watch: {
    confsOfDomainLoading: function () {
      this.compareDiff();
    },
    collapseIsLoading: function () {
      this.compareDiff();
    }
  },
  methods: {
    handlePanelChange(row) {
      if (Object.keys(row).length !== 0) {
        if (isArray(row)) {
          this.temp_conf = row[0]
          this.handleConfTraceChange(row[0]);
        } else {
          const confName = this.temp_conf
          this.pagination.current = row.current
          this.pagination.pageSize = row.pageSize
          this.handleConfTraceChange(confName);
        }
      }
    },
    handleConfTraceChange(confName) {
      const _this = this
      const pagination = this.pagination || {};
      this.isLoading = true;
      queryConfTraceInfos({
        domainName: _this.domainName,
        hostId: _this.host.hostId,
        confName: confName,
        page: pagination.current,
        per_page: pagination.pageSize
      })
        .then((res) => {
          _this.confTraceInfos = res.data.conf_trace_infos || [];
          _this.totalCount = res.data.total_count
          _this.pagination = {
            ..._this.pagination,
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: res.data.total_count || (res.data.total_count === 0 ? 0 : pagination.total)
          };
        })
        .catch((err) => {
          _this.$message.error(err.response.message || err.response.data.detail || err.message);
        })
        .finally(() => {
          _this.isLoading = false;
        });
    },
    getRealConfsList(hostId) {
      const _this = this;
      _this.collapseIsLoading = true;
      queryRealConfs({
        domainName: _this.domainName,
        hostIds: [{hostId}]
      })
        .then((res) => {
          _this.confsOfHost = (res.data && res.data[0] && res.data[0].confBaseInfos) || [];
        })
        .catch((err) => {
          if (err.response.code !== '400' && err.code !== 'ERR_BAD_REQUEST') {
            _this.$message.error(err.response.message || err.response.data.detail || err.message);
          }
        })
        .finally(() => {
          _this.collapseIsLoading = false;
        });
    },
    compareDiff() {
      const confs = [];
      const confsNotInHost = [];
      this.confsOfDomain.forEach((confOfDomain) => {
        let confTemp = confOfDomain;
        // 域配置返回的filePath前会加‘openEuler：’
        const confOfHostMatched = this.confsOfHost.filter(
          (conf) => conf.filePath === confOfDomain.filePath.replace(/openEuler:/, '')
        )[0];
        if (!confOfHostMatched) {
          confTemp.syncStatus = 'NOT IN HOST';
          confsNotInHost.push(confTemp);
        } else {
          confTemp = {
            ...confOfDomain,
            ...confOfHostMatched
          };
          // 域配置返回的contents最后会多个\n，需要去掉
          const diffByLine = Diff.diffLines(confOfHostMatched.confContents, confOfDomain.contents.replace(/\n$/, ''));
          if (checkIsDiff(diffByLine)) {
            confTemp.syncStatus = 'NOT SYNC';
            confTemp.diffResult = diffByLine;
          } else {
            confTemp.syncStatus = 'SYNC';
          }
          confs.push(confTemp);
        }
      });
      this.confs = confs;
      this.confsNotInHost = confsNotInHost;
    },
    showCompareDrawer(conf) {
      this.comparedConf = conf;
      this.compareDrawerVisible = true;
    },
    closeCompareDrawer() {
      this.compareDrawerVisible = false;
    }
  },
  computed: {
    columns() {
      return [
        {
          dataIndex: 'create_time',
          title: '时间',
          width: '15%',
          key: 'create_time',
          align: 'left',
          scopedSlots: {customRender: 'create_time'}
        },
        {
          dataIndex: 'info',
          title: '监控记录',
          width: '15%',
          key: 'info',
          align: 'left',
          scopedSlots: {customRender: 'info'}
        },
        {
          dataIndex: 'ptrace',
          title: '进程追溯',
          width: '15%',
          key: 'ptrace',
          align: 'left'
        }
      ];
    }
  },
  mounted: function () {
    const _this = this;
    this.onload(function (params) {
      _this.domainName = params.domainName;
      _this.host = params.host;
    });
    this.getRealConfsList(this.host.hostId);
  }
};
</script>

<style lang="less" scoped>
.conf-section:first-child {
  padding-bottom: 20px;
  margin-bottom: 20px;
  border-bottom: 1px solid #eee;
}
.text-container {
  border: 1px solid #ccc;
  border-radius: 3px;
  padding: 10px;
}
.conf-description {
  border-bottom: 1px solid #ccc;
}
.conf-content {
  &-header {
    padding-top: 10px;
  }
}
</style>
