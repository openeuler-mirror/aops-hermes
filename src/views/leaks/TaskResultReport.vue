<!-- eslint-disable vue/max-attributes-per-line -->
<template>
  <page-header-wrapper :breadcrumb="breadcrumb">
    <a-card :bordered="false" class="aops-theme">
      <div>
        <a-spin :spinning="resultLoading">
          <div class="result-content">
            <a-descriptions :column="{sm: 1}">
              <a-descriptions-item label="任务类型">
                {{ resultData.task_type }}
              </a-descriptions-item>
              <a-descriptions-item label="上次执行时间">
                {{
                  resultData.latest_execute_time &&
                    dateFormat('YYYY-mm-dd HH:MM:SS', resultData.latest_execute_time * 1000)
                }}
              </a-descriptions-item>
            </a-descriptions>
            <p class="reuslt-item-title">任务结果:</p>
            <a-collapse defaultActiveKey="0">
              <a-collapse-panel v-for="(resultItem, riidx) in resultData.task_result" :key="riidx"
                :header="`主机: ${resultItem.host_name}`">
                <a-descriptions :column="{sm: 1}">
                  <a-descriptions-item label="主机地址">
                    {{ resultItem.host_ip }}
                  </a-descriptions-item>
                  <a-descriptions-item label="状态" v-if="resultData.task_type === 'cve fix'">
                    {{ cveStatusTextMap[resultItem.status] }}
                  </a-descriptions-item>
                  <a-descriptions-item label="状态" v-if="resultData.task_type === 'repo set'">
                    {{ repoStatusTextMap[resultItem.status] }}
                  </a-descriptions-item>
                  <a-descriptions-item label="REPO" v-if="taskType === 'repo set'">
                    {{ resultItem.repo }}
                  </a-descriptions-item>
                </a-descriptions>
                <p class="reuslt-item-title">检查项:</p>
                <a-row>
                  <a-col span="8">
                    <a-descriptions :column="{sm: 1}" bordered size="small">
                      <a-descriptions-item :label="item.item"
                        v-for="(item, rkidx) in resultItem.check_items" :key="rkidx">
                        <a-icon v-if="item.result" type="check" style="color: #52c41a" />
                        <a-icon v-else type="close" style="color: #f5222d" />
                      </a-descriptions-item>
                    </a-descriptions>
                  </a-col>
                </a-row>
                <div v-if="taskType === 'cve fix'" style="margin-left: 50px;">
                  <p class="reuslt-item-title" style="margin-top: 12px">CVE修复情况:</p>
                  <a-collapse v-if="resultItem.cves.length !== 0" :bordered="false">
                    <a-collapse-panel v-for="(cve, rkidx) in resultItem.cves" :key="rkidx"
                      :header="`${cve.cve_id}`">
                      <div class="cve-item">
                        <p class="reuslt-item-title">结果:</p>
                        {{ statusResultTextMap[cve.result] }}
                      </div>
                      <div class="cve-item">
                        <p class="reuslt-item-title" style="margin-top: 12px">Log:</p>
                        <p class="result-log" v-html="logFormat(cve.log)"></p>
                      </div>
                      <a-badge :status="statusResultValueMap[cve.result]" slot="extra" />
                    </a-collapse-panel>
                  </a-collapse>
                  <div v-else class="cve-item">
                    <p class="reuslt-item-title" style="margin-top: 12px">Log:</p>
                    <p class="result-log">{{ resultItem.log }}</p>
                  </div>
                </div>
                <div v-if="taskType === 'repo set'">
                  <p class="reuslt-item-title" style="margin-top: 16px">Log:</p>
                  <p class="result-log">{{ resultItem.log }}</p>
                </div>
                <a-badge :status="statusValueMap[resultItem.status]" slot="extra" />
              </a-collapse-panel>
            </a-collapse>
          </div>
        </a-spin>
      </div>
    </a-card>
  </page-header-wrapper>
</template>

<script>
/**
 * 任务结果报告页面
 */

import {i18nRender} from '@/vendor/ant-design-pro/locales';
import {getCveTaskResult, getRepoTaskResult} from '@/api/leaks';

import {dateFormat} from '@/views/utils/Utils';

const cveStatusTextMap = {
  succeed: '修复成功',
  fail: '待修复',
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
  'on standby': 'default',
  set: 'success'
};

const statusResultTextMap = {
  succeed: '修复成功',
  fail: '待修复',
  running: '运行中',
  unknown: '未知'
};

const statusResultValueMap = {
  succeed: 'success',
  unfixed: 'error',
  running: 'processing',
  'on standby': 'default'
};

export default {
  name: 'TaskResultReport',
  components: {},
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
            return <router-link to={route.path}>{route.breadcrumbName}</router-link>;
          }
        }
      };
    }
  },
  data() {
    return {
      taskId: this.$route.params.taskId,
      taskType: this.$route.params.taskType,
      resultLoading: false,
      resultData: {},
      repoStatusTextMap,
      cveStatusTextMap,
      statusValueMap,
      statusResultTextMap,
      statusResultValueMap
    };
  },
  methods: {
    dateFormat,
    logFormat(str) {
      return str.replace(/\n/g, '<br>');
      //  正则匹配替换/n换行符
    },
    getCheckResult() {
      const _this = this;
      this.resultLoading = true;
      switch (this.taskType) {
        case 'cve fix':
          getCveTaskResult({
            taskId: this.taskId,
            cveList: []
          })
            .then(function (res) {
              _this.resultData = Object.assign({}, res.data.result);
            })
            .catch(function (err) {
              _this.$message.error(err.response.message);
            })
            .finally(function () {
              _this.resultLoading = false;
            });
          break;
        case 'repo set':
          getRepoTaskResult({
            taskId: this.taskId,
            hostList: []
          })
            .then(function (res) {
              _this.resultData = Object.assign({}, res.data.result);
            })
            .catch(function (err) {
              _this.$message.error(err.response.message);
            })
            .finally(function () {
              _this.resultLoading = false;
            });
          break;
      }
    }
  },
  mounted: function () {
    this.getCheckResult();
  }
};
</script>

<style lang="less" scoped>
.ant-col-8 {
  display: block;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  width: 100%;
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
