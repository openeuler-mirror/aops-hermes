<template>
  <my-page-header-wrapper>
    <a-row type="flex" :gutter="20">
      <a-col :xs="24" :md="12" :xl="8">
        <a-card :bordered="false" class="aops-theme" style="margin-bottom: 20px">
          <div class="dash-card-small">
            <a-row type="flex" justify="space-between" align="middle">
              <a-col>
                <a-row type="flex" justify="space-between" align="middle">
                  <a-col>
                    <router-link :to="{path: '/assests/hosts-management'}">
                      <img src="~@/assets/dash-host.png" />
                    </router-link>
                  </a-col>
                  <a-col>
                    <span class="small-title">主机数量</span>
                  </a-col>
                </a-row>
              </a-col>
              <a-col>
                <span class="data-number">{{ hostCount.toString().replace(/(\d)(?=(?:\d{3})+$)/g, '$1,') }}</span>
              </a-col>
            </a-row>
          </div>
        </a-card>
        <a-card :bordered="false" class="aops-theme" style="margin-bottom: 20px">
          <div class="dash-card-small">
            <a-row type="flex" justify="space-between" align="middle">
              <a-col>
                <a-row type="flex" justify="space-between" align="middle">
                  <a-col>
                    <router-link :to="{path: '/diagnosis/alert'}">
                      <img src="~@/assets/dash-fault.png" />
                    </router-link>
                  </a-col>
                  <a-col>
                    <span class="small-title short-length">告警数量</span>
                  </a-col>
                </a-row>
              </a-col>
              <a-col>
                <span class="data-number">{{ alertCount.toString().replace(/(\d)(?=(?:\d{3})+$)/g, '$1,') }}</span>
              </a-col>
            </a-row>
          </div>
        </a-card>
      </a-col>
      <a-col :xs="24" :md="12" :xl="8">
        <a-card :bordered="false" class="aops-theme" style="margin-bottom: 20px">
          <div class="dash-card-small dash-sync-card">
            <a-row type="flex" justify="center" align="middle">
              <a-col span="12" class="progress-container">
                <router-link :to="{path: '/configuration/transcation-domain-management/list'}">
                  <a-progress
                    type="circle"
                    :percent="100"
                    :width="90"
                    :show-info="false"
                    :strokeWidth="14"
                    status="active"
                    strokeColor="#749BFD"
                  />
                </router-link>
              </a-col>
              <a-col span="12">
                <div class="dash-sync-card-desc">
                  <span class="small-title">
                    <a-badge status="processing" />
                    业务域同步率
                  </span>
                  <span class="data-number">100%</span>
                </div>
                <div class="dash-sync-card-desc">
                  <span class="small-title">
                    <a-badge status="error" />
                    未同步业务域
                  </span>
                  <div class="data-number">{{ '0'.toString().replace(/(\d)(?=(?:\d{3})+$)/g, '$1,') }}</div>
                </div>
              </a-col>
            </a-row>
          </div>
        </a-card>
      </a-col>
      <a-col :xs="24" :md="24" :xl="8">
        <a-card :bordered="false" class="aops-theme" style="margin-bottom: 20px">
          <div class="cve-card">
            <h3>CVE风险</h3>
            <v-chart :forceFit="true" :height="120" :data="cveOverview" :scale="cveScale" :padding="[0, 60, 0, 0]">
              <v-legend position="right-center" :offsetX="-10" />
              <v-pie
                position="percent"
                :color="['item', ['#f62f2f', '#fda72c', '#fde92c', '#3bd065', '#ccc']]"
                :vStyle="drawConfig.pieStyle"
                :label="drawConfig.labelConfig"
                :select="false"
              />
              <v-coord type="theta" :radius="0.75" />
            </v-chart>
          </div>
        </a-card>
      </a-col>
    </a-row>
    <alert-header-board onlyInfo />
  </my-page-header-wrapper>
</template>

<script>
import store from '@/store';
import {mapState} from 'vuex';
import MyPageHeaderWrapper from '@/views/utils/MyPageHeaderWrapper';
import AlertHeaderBoard from '@/views/diagnosis/components/AlertHeaderBoard';
import DrawerView from '@/views/utils/DrawerView';
import GetCheckResultDrawer from '@/views/diagnosis/components/GetCheckResultDrawer';
import AddAbnormalCheckRuleDrawer from '@/views/diagnosis/components/AddAbnormalCheckRuleDrawer';
import CheckResultExpanded from '@/views/diagnosis/components/CheckResultExpanded';
import {getResultCountTopTen, getResult} from '@/api/check';
import {getCveOverview} from '@/api/leaks';
import {hostCount} from '@/api/assest';
import {dateFormat} from '@/views/utils/Utils';

const DataSet = require('@antv/data-set');
const cveTypeList = [
  {typeValue: 'Critical', typeName: '严重'},
  {typeValue: 'High', typeName: '高'},
  {typeValue: 'Medium', typeName: '中等'},
  {typeValue: 'Low', typeName: '低'},
  {typeValue: 'Unknown', typeName: '未知'}
];
const cveScale = [
  {
    dataKey: 'count',
    min: 0
  }
];

export default {
  name: 'Dashboard',
  components: {
    MyPageHeaderWrapper,
    DrawerView,
    AddAbnormalCheckRuleDrawer,
    GetCheckResultDrawer,
    CheckResultExpanded,
    AlertHeaderBoard
  },
  mounted: function () {
    this.getHostCount();
    store.dispatch('updateCount');
    //  this.getResultCountTopTen()
    //  this.getResultList()
    this.getCveOverview();
  },
  data() {
    return {
      hostCount: 0,
      filters: null,
      sorter: null,
      tableIsLoading: false,
      columns,
      resultCountList: [],
      resultList: [],
      countTopLoading: false,
      cveOverview: [],
      cveOverviewLoading: false,
      cveScale,
      drawConfig: {
        pieStyle: {},
        labelConfig: []
      }
    };
  },
  computed: {
    ...mapState({
      alertCount: (state) => state.abnormalAlert.alertCount
    }),
    columnsReulst() {
      return [
        {
          title: '序号',
          dataIndex: 'index',
          key: 'index',
          align: 'center',
          customRender: (text, record, index) => {
            if (index < 3) {
              return <a-tag class="result-tag hight-light">{index + 1}</a-tag>;
            } else {
              return <a-tag class="result-tag">{index + 1}</a-tag>;
            }
          }
        },
        {
          dataIndex: 'hostName',
          key: 'hostName',
          title: '主机名称'
        },
        {
          dataIndex: 'ip',
          key: 'ip',
          title: 'IP地址'
        },
        {
          dataIndex: 'count',
          title: '异常数',
          customRender: (count) => <span class="result-count">{count}</span>
        }
      ];
    }
  },
  methods: {
    getHostCount() {
      var that = this;
      hostCount()
        .then(function (res) {
          that.hostCount = res.data.host_count;
        })
        .catch(function (err) {
          that.$message.error(err.response.message);
        });
    },
    getResultCountTopTen() {
      var that = this;
      this.countTopLoading = true;
      getResultCountTopTen()
        .then(function (res) {
          that.resultCountList = res.data.results;
        })
        .catch(function (err) {
          that.$message.error(err.response.message);
        })
        .finally(() => {
          that.countTopLoading = false;
        });
    },
    getResultList() {
      var that = this;
      getResult({perPage: 5})
        .then(function (res) {
          that.resultList = res.data.check_result
            ? res.data.check_result.map((result) => {
                return {
                  ...result,
                  key: `${result.host_id}+${result.check_item}+${result.start}+${result.end}`
                };
              })
            : [];
        })
        .catch(function (err) {
          that.$message.error(err.response.message);
        });
    },
    getCveOverview() {
      const _this = this;
      this.cveOverviewLoading = true;
      getCveOverview()
        .then(function (res) {
          const arr = [];
          cveTypeList.forEach((type) => {
            arr.push({
              item: type.typeName,
              count: res.data.result[type.typeValue] || 0,
              color: '#FF0000'
            });
          });
          _this.drawPie(arr);
        })
        .catch(function (err) {
          _this.$message.error(err.response.message);
        })
        .finally(function () {
          _this.cveOverviewLoading = false;
        });
    },
    drawPie(dataList) {
      const dv = new DataSet.View().source(dataList);
      dv.transform({
        type: 'percent',
        field: 'count',
        dimension: 'item',
        as: 'percent'
      });
      this.cveOverview = dv.rows;
      this.drawConfig = {
        pieStyle: {
          stroke: '#fff',
          lineWidth: 1
        },
        labelConfig: [
          'count',
          {
            offset: 15,
            formatter: (val, item) => {
              return val;
            }
          }
        ]
      };
    }
  }
};

const columns = [
  {
    title: '序号',
    dataIndex: 'index',
    key: 'index',
    align: 'center',
    width: 70,
    customRender: (text, record, index) => `${index + 1}`
  },
  {
    dataIndex: 'hostName',
    key: 'hostName',
    title: '主机名称'
  },
  {
    dataIndex: 'ip',
    key: 'ip',
    title: 'IP地址'
  },
  {
    dataIndex: 'check_item',
    key: 'check_item',
    title: '检测项'
  },
  {
    dataIndex: 'condition',
    key: 'condition',
    title: '检测条件'
  },
  {
    dataIndex: 'description',
    key: 'description',
    title: '描述'
  },
  {
    title: '检测时间段',
    customRender: (text, record, index) =>
      dateFormat('YYYY-mm-dd HH:MM:SS', record.start * 1000) +
      ' 至 ' +
      dateFormat('YYYY-mm-dd HH:MM:SS', record.end * 1000)
  }
];
</script>

<style lang="less" scoped>
.dash-card-small {
  height: 58px;
  img {
    width: 48px;
    height: 48px;
  }
  .small-title {
    font-size: 14px;
    vertical-align: middle;
    margin-left: 4px;
    &-icon {
      margin-left: 2px;
    }
    &.short-length {
      display: inline-block;
      width: 60px;
    }
  }
  .data-number {
    display: block;
    font-size: 32px;
    font-weight: bold;
  }
  > .ant-row-flex {
    height: 100%;
  }

  &.dash-sync-card {
    height: 186px;
    .progress-container {
      text-align: center;
    }
  }
  .dash-sync-card {
    &-desc {
      text-align: center;
    }
  }

  &.dash-result-count {
    height: 186px;
  }

  .special {
    margin-top: 0px;
  }
}

.check-result-card {
  min-height: 234px;
  margin-bottom: 0;
  h3 {
    margin-top: -12px;
  }
  .result-item {
    margin-bottom: 10px;
    &:last-child {
      margin-bottom: 0;
    }
  }
  .result-tag {
    color: #002fa7;
    font-weight: 900;
    background: none;
    border: 0;
    &.hight-light {
      background: #dde6fa;
      border-radius: 50%;
      border: 0;
    }
  }
  /deep/ .check-result-table {
    .ant-table-thead > tr > th {
      padding: 2px 16px;
      border-bottom: 0;
      background: #fff;
    }
    .ant-table-tbody > tr > td {
      padding: 2px 16px;
      border-bottom: 0;
    }
    .ant-empty-normal {
      margin-top: 16px;
      margin-bottom: 0;
    }
    .ant-table-placeholder {
      border: 0;
    }
  }
  .result-info {
    p {
      margin: 0;
      line-height: 1.1em;
    }
    span {
      font-weight: 600;
    }
    span:nth-child(2) {
      margin-left: 4px;
    }
  }
  .result-count {
    color: #f95858;
  }
  .showAllResult {
    position: absolute;
    top: 12px;
    right: 24px;
    font-weight: 600;
    color: #002fa7;
    cursor: pointer;
    &:hover {
      color: #3455a7;
    }
  }
}
.cve-card {
  height: 185px;
  position: relative;
  display: block;
  padding-top: 1px;
  h3 {
    position: absolute;
    font-weight: bold;
    font-size: 24px;
    color: rgba(0, 0, 0, 0.65);
  }
  > div {
    margin-top: 40px;
    position: relative;
  }
}
</style>
