<template>
  <a-spin :spinning="chartLoading" style="margin-top: 20px">
    <a-card :bordered="false" class="aops-theme">
      <a-row type="flex" justify="start">
        <a-col>
          <h3 class="card-title">
            指标波形
            <description-tips>
              指标波形主要展示主机基础指标数据。可通过添加和指定时间范围等操作，呈现相关指标数据趋势图。
            </description-tips>
          </h3>
        </a-col>
      </a-row>
      <a-row type="flex" justify="end">
        <a-col>
          <a-row type="flex" :gutter="16">
            <a-col>
              <a-range-picker
                v-model="customTime"
                @ok="handleCustomTimeChange"
                :show-time="{
                  hideDisabledOptions: true
                }"
                format="YYYY-MM-DD HH:mm:ss"
              />
            </a-col>
            <a-col>
              <a-select style="width: 150px" defaultValue="0.5" @change="handleRefresh">
                <a-icon type="clock-circle" slot="suffixIcon" style="fontsize: 15px" />
                <a-select-option value="0.5">Last 30 minutes</a-select-option>
                <a-select-option value="1">Last 1 hour</a-select-option>
                <a-select-option value="3">Last 3 hours</a-select-option>
                <a-select-option value="6">Last 6 hours</a-select-option>
                <a-select-option value="12">Last 12 hours</a-select-option>
                <a-select-option value="24">Last 24 hours</a-select-option>
                <a-select-option value="48">Last 2 days</a-select-option>
              </a-select>
            </a-col>
            <a-col>
              <a-button type="primary" @click="addChartModalOpen">添加图表<a-icon type="plus-square" /></a-button>
            </a-col>
            <a-col>
              <a-button @click="handleRefresh"><a-icon type="redo" />刷新</a-button>
            </a-col>
          </a-row>
        </a-col>
      </a-row>
      <a-row style="margin-bottom: 20px" :gutter="20">
        <a-col class="chart-contianer-item" :xl="12" :lg="24" :id="item" v-for="item in selectedMetrics" :key="item">
          <h3 style="text-align: center">
            <span>{{ item }}</span>
            <a-tooltip overlayClassName="desc-tooltip">
              <template slot="title"> 移除该图表 </template>
              <a-icon @click="handleChartRemove(item)" type="delete" style="margin-left: 5px; font-size: 14px" />
            </a-tooltip>
          </h3>
        </a-col>
        <a-empty v-if="!selectedMetrics.length" :image="simpleImage" />
      </a-row>
    </a-card>
    <a-modal :visible="modalVisible" title="添加图表" @ok="confirmChartAdd" @cancel="addChartModalClose">
      <a-form :form="form">
        <a-form-item label="采集参数">
          <a-select
            show-search
            option-filter-prop="children"
            :filter-option="handleFilterOption"
            v-decorator="['metric', {rules: [{required: true, message: '请选择采集参数 !'}]}]"
            placeholder="请选择采集参数"
          >
            <a-select-option :value="item" v-for="item in metrics" :key="item">
              {{ item }}
            </a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
  </a-spin>
</template>

<script>
import DescriptionTips from '@/components/DescriptionTips';
import {Empty} from 'ant-design-vue';
import storage from 'store';

import {getHostMetrics, getMetricData} from '@/api/assest';
import HostChart from '../utils/chart';

export default {
  name: 'HostChartInfo',
  props: {
    queryIp: {
      type: String,
      default: ''
    }
  },
  components: {
    DescriptionTips
  },
  data() {
    return {
      metrics: [],
      selectedMetrics: [],
      metricData: {},
      chartRepo: {},
      durationHour: 0.5,
      customTime: [],
      chartLoading: false,
      form: this.$form.createForm(this),
      modalVisible: false
    };
  },
  beforeCreate() {
    this.simpleImage = Empty.PRESENTED_IMAGE_SIMPLE;
  },
  created() {
    this.selectedMetrics = storage.get('hostChartsSelectedMetrics') || [];
    this.getHostMetrics();
  },
  methods: {
    // 获取指标项，一个指标项对应一个图表
    getHostMetrics() {
      this.chartLoading = true;
      getHostMetrics({
        query_ip: this.queryIp
      }).then((res) => {
        if (res) {
          this.metrics = res.data.results;
          if (this.selectedMetrics.length < 1) {
            this.selectedMetrics = res.data.results.slice(0, 4);
            storage.set('hostChartsSelectedMetrics', this.selectedMetrics, 30 * 24 * 60 * 60 * 1000);
          }
          this.getMetricData();
        }
        this.chartLoading = false;
      });
    },
    // 获取各个指标项下的所有序列数据
    getMetricData() {
      const _this = this;
      // 时间处理
      let currentTime = null;
      let previousTime = null;
      if (_this.customTime.length === 2) {
        currentTime = Date.parse(_this.customTime[1]) / 1000;
        previousTime = Date.parse(_this.customTime[0]) / 1000;
      } else {
        currentTime = Date.parse(new Date()) / 1000;
        previousTime = Date.parse(new Date(currentTime * 1000 - _this.durationHour * 60 * 60 * 1000)) / 1000;
      }
      // 指标处理
      const metricDetail = {};
      _this.selectedMetrics.forEach((item) => {
        metricDetail[item] = [];
      });
      getMetricData({
        query_ip: _this.queryIp,
        time_range: [previousTime, currentTime],
        query_info: metricDetail
      })
        .then((res) => {
          _this.metricData = res.data.results;
          _this.handleChartLoad();
        })
        .catch((err) => {
          _this.$message.error(err.response.message);
        });
    },
    // 处理图表数据
    handleChartLoad() {
      const data = this.metricData;
      let chartData = [];

      for (const key in data) {
        if (data[key] instanceof Array && !data[key].length) {
          if (!this.chartRepo[key]) {
            const chart = new HostChart(key, []);
            this.chartRepo[key] = chart;
          } else {
            this.chartRepo[key].changeData([]);
          }
        } else {
          for (const key2 in data[key]) {
            data[key][key2].forEach((item) => {
              chartData.push({
                time: item[0] * 1000,
                value: Number(item[1]),
                metric: key2.substr(key2.indexOf('{'))
              });
            });
          }
          if (!this.chartRepo[key]) {
            const chart = new HostChart(key, chartData);
            this.chartRepo[key] = chart;
          } else {
            this.chartRepo[key].loadData(chartData);
            this.chartRepo[key].render();
            // this.chartRepo[key].changeData(chartData)
          }
          chartData = [];
        }
      }
    },
    addChartModalOpen() {
      this.modalVisible = true;
    },
    addChartModalClose() {
      this.form.resetFields();
      this.modalVisible = false;
    },
    confirmChartAdd() {
      const _this = this;
      this.form.validateFields((err, values) => {
        if (!err) {
          _this.selectedMetrics.push(values.metric);
          _this.selectedMetrics = Array.from(new Set(_this.selectedMetrics));
          storage.set('hostChartsSelectedMetrics', _this.selectedMetrics, 30 * 24 * 60 * 60 * 1000);
          _this.handleRefresh();
          _this.addChartModalClose();
        }
      });
    },
    handleRefresh(duration) {
      typeof duration === 'string' && (this.durationHour = duration);
      this.getMetricData();
    },
    handleChartRemove(metric) {
      this.selectedMetrics = this.selectedMetrics.filter((item) => item !== metric);
      storage.set('hostChartsSelectedMetrics', this.selectedMetrics, 30 * 24 * 60 * 60 * 1000);
      this.chartRepo[metric].destroy();
      delete this.chartRepo[metric];
      this.handleRefresh();
    },
    handleFilterOption(input, option) {
      return option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0;
    },
    handleCustomTimeChange(dates) {
      const customTime = dates.map((item) => Date.parse(item));
      const endTime = customTime[1] / 1000;
      const startTime = customTime[0] / 1000;
      const durationHour = (endTime - startTime) / (60 * 60);
      if (durationHour > 48) {
        this.$message.info('选取的时间间隔不能超过两天.');
        this.customTime.splice(0);
        return;
      }
      this.handleRefresh();
    }
  }
};
</script>

<style lang="less" scoped>
/deep/ .ant-select-open .ant-select-arrow-icon svg {
  -webkit-transform: rotate(0deg) !important;
  transform: rotate(0deg) !important;
}
.card-title {
  color: #666666;
  font-weight: 600;
  font-size: 17px;
  margin-bottom: 10px;
  .anticon {
    font-size: 14px;
    position: relative;
    left: 4px;
    bottom: 1px;
  }
}

.chart-contianer-item {
  height: 300px;
  margin: 45px 0;
}
</style>
