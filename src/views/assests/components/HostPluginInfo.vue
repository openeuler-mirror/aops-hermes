<!-- eslint-disable vue/max-attributes-per-line -->
<template>
  <div class="footor-wrapper">
    <div class="scene-identify">
      <a-button @click="sceneIdentify()" type="primary" :loading="sceneLoading"> 场景识别 </a-button>
      <div class="recommend-list">
        <div>当前场景：{{ sceneMap[scene] }}</div>
        <div style="display: flex; width: 100%">
          建议开启：
          <a-collapse v-if="scenePropertys.length">
            <a-collapse-panel v-for="(item, index) in scenePropertys" :key="index">
              <span slot="header">
                <span>{{ item }}</span>
                <span style="marginleft: 30px">({{ sceneData.collect_items[item].length }})</span>
              </span>
              <p>采集项：{{ recommendListMap[item] }}</p>
            </a-collapse-panel>
          </a-collapse>
          <span v-else-if="isEmpty">暂无</span>
        </div>
      </div>
    </div>
    <a-divider></a-divider>
    <div class="plugin-set">
      <span>插件运行信息</span>
      <a-space :size="8">
        <a-button @click="clearModal()"
          :disabled="changedPlugin.length === 0 && changedProbe.length === 0">
          取消
        </a-button>
        <a-button @click="saveModal()" type="primary"
          :disabled="changedPlugin.length === 0 && changedProbe.length === 0"
          :loading="saveLoading">保存</a-button>
      </a-space>
    </div>
    <a-table :columns="columns" :data-source="tableData" :scroll="{y: 400}" :loading="tableLoading"
      :pagination="false">
      <span slot="plugin_name" slot-scope="plugin_name">
        <CutText :text="plugin_name"></CutText>
      </span>
      <span v-if="record.info.is_installed" slot="status" slot-scope="status, record">
        <a-switch checked-children="on" un-checked-children="off" :checked="status"
          @change="PluginStatuChange(record)">
        </a-switch>
      </span>
      <span slot="resourceTitle">
        插件资源
        <a-tooltip placement="top">
          <template slot="title">
            <span>当前值 / 限定值</span>
          </template>
          <a-icon type="question-circle" />
        </a-tooltip>
      </span>
      <span v-if="record.info.status && record.info.is_installed" slot="resource"
        slot-scope="resource, record">
        <div v-for="(item, index) in resource" :key="index">
          <span>{{ `${item.name}：` }}</span><br />
          <span>{{ `${item.current_value} / ${item.limit_value}` }}</span>
        </div>
      </span>
      <span v-if="record.info.status && record.info.is_installed" slot="collect_items"
        slot-scope="collect_items, record" class="probe">
        <div v-for="(item, index) in collect_items" :key="index" class="probe-item">
          <span>
            <CutText :text="item.probe_name"></CutText>
            :
          </span>
          <a-radio-group class="probe-radio" size="small" v-model="item.probe_status"
            @change="ProbeStatuChange(record, index)" button-style="solid">
            <a-radio-button value="on"> on </a-radio-button>
            <a-radio-button value="off"> off </a-radio-button>
            <a-radio-button v-if="item.support_auto" value="auto"> auto </a-radio-button>
          </a-radio-group>
        </div>
      </span>
      <!-- 插件关闭时隐藏probe和resource -->
      <span v-else-if="!record.info.is_installed"> 插件未安装，暂无数据 </span>
      <span v-else-if="!record.info.status"> 插件已关闭，暂无服务信息 </span>
    </a-table>
  </div>
</template>

<script>
import {sceneGet, pluginInfoGet, metricSet, pluginSet} from '@/api/assest';
import CutText from '@/components/CutText';
const sceneMap = {
  'big_data': '大数据',
  'web': 'web服务',
  'edge': '边缘设备',
  'cloud': '云服务',
  'normal': '通用'
};
const columns = [
  {
    title: '名称',
    dataIndex: 'info.plugin_name',
    key: 'info.plugin_name',
    scopedSlots: {customRender: 'plugin_name'},
    width: 120
  },
  {
    title: '状态',
    dataIndex: 'info.status',
    key: 'info.status',
    scopedSlots: {customRender: 'status'},
    width: 80
  },
  {
    dataIndex: 'info.resource',
    key: 'info.resource',
    slots: {title: 'resourceTitle'},
    scopedSlots: {customRender: 'resource'},
    width: 150
  },
  {
    title: '探针',
    key: 'info.collect_items',
    dataIndex: 'info.collect_items',
    scopedSlots: {customRender: 'collect_items'}
  }
];

export default {
  name: 'HostPluginInfo',
  components: {CutText},
  props: {
    scene: {
      type: String,
      default: undefined
    }
  },
  data() {
    return {
      sceneMap,
      tableData: [],
      originData: [],
      columns,
      sceneData: {},
      scenePropertys: [],
      recommendListMap: {},
      isEmpty: false,
      // 用户修改的记录
      changedPlugin: [],
      changedProbe: [],
      sceneLoading: false,
      saveLoading: false,
      tableLoading: false,
      hostId: this.$route.params.hostId,
      // resultEnum枚举plugin修改结果：0——无修改，1——成功，2——部分成功，3——失败，4——接口异常，pluginChangeResult记录修改结果
      resultEnum: {
        inAction: 0,
        success: 1,
        successList: 2,
        failure: 3,
        err: 4
      },
      pluginChangeResult: 0,
      notifyType: '',
      notifyMsg: ''
    };
  },
  methods: {
    pluginDataGet(This) {
      const _this = This;
      _this.tableLoading = true;
      pluginInfoGet({
        hostId: _this.hostId
      })
        .then((res) => {
          const pluginData = []; // 创建数组处理获取到的数据，再赋值给tableData，防止再次请求时导致的tableData重复数据
          res.data.info.forEach((element, index) => {
            if (element.status === 'active') {
              element.status = true;
            } else {
              element.status = false;
            }
            pluginData.push({
              key: index,
              info: element
            });
          });
          _this.tableData = pluginData;
          _this.originData = JSON.parse(JSON.stringify(pluginData)); // 保存原始数据
        })
        .catch((err) => {
          _this.$message.error(err.response.message, 5);
        })
        .finally(() => {
          _this.tableLoading = false;
        });
    },
    PluginStatuChange(rowData) {
      // index：判断将要压入数组的plugin在数组中是否存在，如存在则弹出数组并终止执行
      const index = this.changedPlugin.indexOf(rowData.key);
      if (index !== -1) {
        this.changedPlugin.splice(index, 1);
      } else {
        this.changedPlugin.push(rowData.key);
      }
      rowData.info.status = !rowData.info.status;
      // 如果修改的插件状态中有“关闭”状态，则将其对应的探针从changedProbe中移除并恢复探针修改前状态
      if (!rowData.info.status) {
        // 创建数组array记录插件状态为false的所有探针，并根据array将changedProbe中的对应探针剔除，重置探针状态
        const array = this.changedProbe.filter((element) => element.fatherFlugin === rowData.key);
        array.forEach((element) => {
          this.changedProbe.splice(this.changedProbe.indexOf(element), 1);
          rowData.info.collect_items[element.probeFlag].probe_status =
            this.originData[rowData.key].info.collect_items[element.probeFlag].probe_status;
        });
      }
    },
    ProbeStatuChange(rowData, probeKey) {
      let insert = true; // 作用与PluginStatuChange()中的index相似
      this.changedProbe.forEach((element, index) => {
        if (rowData.key === element.fatherFlugin && probeKey === element.probeFlag) {
          insert = false;
          if (
            this.originData[rowData.key].info.collect_items[probeKey].probe_status ===
            rowData.info.collect_items[element.probeFlag].probe_status
          ) {
            this.changedProbe.splice(index, 1);
          }
        }
      });
      if (insert === true) {
        this.changedProbe.push({
          fatherFlugin: rowData.key,
          probeFlag: probeKey
        });
      }
    },
    // 场景识别
    sceneIdentify() {
      const _this = this;
      _this.sceneLoading = true;
      _this.$emit('reFetchHostInfo');
      sceneGet({
        hostId: _this.hostId
      })
        .then(function (res) {
          _this.scene = res.data.scene
          _this.$set(_this.sceneData, 'collect_items', res.data.collect_items);
          // 创建数组scenePropertys存储sceneData.collect_items的属性，即推荐开启的插件列表
          _this.scenePropertys = Object.keys(_this.sceneData.collect_items);
          if (_this.scenePropertys.length === 0) {
            _this.isEmpty = true;
          } else {
            _this.scenePropertys.forEach((element) => {
              if (_this.sceneData.collect_items[element].length === 0) {
                _this.$set(_this.recommendListMap, element, '暂无');
              } else {
                _this.$set(_this.recommendListMap, element, _this.sceneData.collect_items[element].join('、'));
              }
            });
          }
        })
        .catch(function (err) {
          _this.$message.error(err.response.message, 5);
        })
        .finally(function () {
          _this.sceneLoading = false;
        });
    },
    // modal
    clearModal() {
      const _this = this;
      this.$confirm({
        title: '是否取消修改？',
        onOk() {
          _this.changedPlugin.forEach((pluginKey) => {
            _this.tableData[pluginKey].info.status = _this.originData[pluginKey].info.status;
          });
          _this.changedProbe.forEach((probe) => {
            _this.tableData[probe.fatherFlugin].info.collect_items[probe.probeFlag].probe_status =
              _this.originData[probe.fatherFlugin].info.collect_items[probe.probeFlag].probe_status;
          });
          // 清空缓存数组并禁止保存按钮
          _this.changedPlugin = [];
          _this.changedProbe = [];
        },
        onCancel() {}
      });
    },
    saveModal() {
      const _this = this;
      this.$confirm({
        title: '是否保存修改？',
        onOk() {
          _this.saveLoading = true;
          // 分别判断changedPlugin和changedProbe中是否有数据，有的就进行请求
          if (_this.changedPlugin.length !== 0) {
            // 根据changePlugin生成需要传递的参数
            const pluginsVariation = {};
            _this.changedPlugin.forEach((element) => {
              const status = _this.tableData[element].info.status ? 'active' : 'inactive';
              _this.$set(pluginsVariation, _this.tableData[element].info.plugin_name, status);
            });
            _this.$options.methods.handlePluginSet(_this, pluginsVariation);
          }
          if (_this.changedProbe.length !== 0) {
            // 根据changeProbe生成需要传递的参数
            const probesVariation = {};
            // 去重，fatherList用以合并plugin相同的probe
            const fatherList = [_this.changedProbe[0].fatherFlugin];
            _this.changedProbe.forEach((element) => {
              if (fatherList.indexOf(element.fatherFlugin) === -1) {
                fatherList.push(element.fatherFlugin);
              }
            });
            // 根据fatherList创建数组，存储plugin相同的probe，最后将数组压入最终要传递的参数中（即probesVariation）
            fatherList.forEach((element) => {
              const probeList = {};
              _this.changedProbe.forEach((item) => {
                const index = _this.tableData[element].info.collect_items[item.probeFlag];
                _this.$set(probeList, index.probe_name, index.probe_status);
              });
              _this.$set(probesVariation, _this.tableData[element].info.plugin_name, probeList);
            });
            _this.$options.methods.handleMetricSet(_this, probesVariation);
          }
        },
        onCancel() {}
      });
    },

    /**
     * 设置插件状态：
     * 返回数据会包含一个succeed_list和failure_list.
     * 前端需要根据情况分别展示成功、失败、部分成功（显示失败的插件名）
     */
    handlePluginSet(This, pluginsVariation) {
      const _this = This;
      pluginSet({
        pluginStatus: {
          hostId: _this.hostId,
          plugins: pluginsVariation
        }
      })
        .then(function (e) {
          _this.notifyType = 'success';
          if (e.data.failed_list.length === 0) {
            _this.pluginChangeResult = _this.resultEnum.success;
          } else {
            if (e.data.succeed_list.length === 0) {
              _this.pluginChangeResult = _this.resultEnum.failure;
              _this.notifyType = 'error';
            } else {
              _this.pluginChangeResult = _this.resultEnum.successList;
              _this.notifyType = 'warning';
            }
            _this.notifyMsg = '失败插件：' + e.data.failed_list.toString();
          }
        })
        .catch(function (err) {
          _this.pluginChangeResult = _this.resultEnum.err;
          _this.notifyType = 'error';
          _this.notifyMsg = '插件修改失败：' + err.response.message;
        })
        .finally(function () {
          if (_this.changedProbe.length === 0) {
            _this.notifyMsg =
              _this.notifyType === 'success' ? '你所提交的修改已成功，页面数据已刷新！' : _this.notifyMsg;
            if (_this.notifyType !== 'error') {
              _this.$options.methods.pluginDataGet(_this);
              _this.changedPlugin = [];
            }
            _this.$options.methods.notifyResult(_this);
          }
          _this.saveLoading = false;
        });
    },

    /**
     * 设置探针状态：
     * 返回数据会针对每一个插件，给出其中探针状态的修改情况。实例：
     * resp: {
     *   '插件1': {
     *      failure: ['探针1']，
     *      success: ['探针2'、'探针3'']
     *   }
     * }
     * 前端需要根据情况分别展示成功、失败、部分成功（显示失败的探针名）
     */
    handleMetricSet(This, probesVariation) {
      const _this = This;
      metricSet({
        metricStatus: {
          hostId: _this.hostId,
          plugins: probesVariation
        }
      })
        .then(function (e) {
          const failedProbes = [];
          for (var key in e.data.resp) {
            failedProbes.push(...e.data.resp[key].failure);
          }
          if (failedProbes.length === 0) {
            if (_this.pluginChangeResult <= 1) {
              _this.notifyType = 'success';
              _this.notifyMsg = '你所提交的修改已成功，页面数据已刷新！';
            } else {
              _this.notifyType = 'warning';
            }
          } else if (failedProbes.length === _this.changedProbe.length) {
            _this.notifyMsg = _this.notifyMsg + '\n失败探针：' + failedProbes.toString();
            _this.notifyType =
              _this.pluginChangeResult === _this.resultEnum.success ||
              _this.pluginChangeResult === _this.resultEnum.successList
                ? 'warning'
                : 'error';
          } else {
            _this.notifyType = 'warning';
            _this.notifyMsg = _this.notifyMsg + '\n失败探针：' + failedProbes.toString();
          }
        })
        .catch(function (err) {
          _this.notifyMsg = _this.notifyMsg + '\n探针修改失败：' + err.response.message;
          _this.notifyType =
            _this.pluginChangeResult === _this.resultEnum.success ||
            _this.pluginChangeResult === _this.resultEnum.successList
              ? 'warning'
              : 'error';
        })
        .finally(function () {
          if (_this.notifyType !== 'error') {
            _this.$options.methods.pluginDataGet(_this);
            _this.changedPlugin = [];
            _this.changedProbe = [];
          }
          _this.$options.methods.notifyResult(_this);
          _this.saveLoading = false;
        });
    },
    notifyResult(This) {
      const _this = This;
      let title = '';
      switch (_this.notifyType) {
        case 'success':
          title = '修改配置成功';
          break;
        case 'warning':
          title = '修改部分成功';
          break;
        case 'error':
          title = '修改失败';
          break;
      }
      This.$notification[_this.notifyType]({
        message: title,
        description: _this.notifyMsg,
        style: {
          whiteSpace: 'pre-wrap'
        }
      });
    }
  },
  // 初始化请求插件信息
  mounted: function () {
    this.$options.methods.pluginDataGet(this);
  }
};
</script>

<style lang="less" scoped>
.scene-identify {
  display: flex;
  padding: 0 16px;

  .recommend-list {
    margin-left: 20px;

    /deep/ .ant-collapse > .ant-collapse-item > .ant-collapse-header {
      padding: 0 10px 0 60px;
    }

    /deep/ .ant-collapse-content > .ant-collapse-content-box {
      padding: 10px 16px 0 16px;
    }

    div {
      font-size: 10px;
    }
  }
}

.plugin-set {
  display: flex;
  justify-content: space-between;
  padding: 10px 30px 10px 16px;

  span {
    font-weight: 600;
    color: rgba(0, 0, 0, 0.85);
  }
}

.probe {
  display: flex;
  flex-wrap: wrap;

  .probe-item {
    min-width: 220px;
    margin: 8px 16px 8px 0px;
    align-items: center;
    position: relative;

    .probe-radio {
      position: absolute;
      left: 110px;
    }
  }
}
</style>
