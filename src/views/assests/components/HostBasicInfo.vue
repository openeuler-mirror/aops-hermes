<template>
  <div>
    <a-spin :spinning="isLoading">
      <div class="content">
        <div class="addtional-info">
          <div :class="`host-basic-info info-block${collapsed ? ' collapsed' : ''}`">
            <div class="host-img">
              <img src="~@/assets/dash-host.png" alt="" />
            </div>
            <div>
              <a-row class="host-basic-info-row">
                <a-col :span="12"> 主机名：{{ hostName }} </a-col>
                <a-col :span="12"> 主机ip：{{ hostIp }} </a-col>
              </a-row>
              <a-row class="host-basic-info-row">
                <a-col :span="12"> 主机组：{{ hostGroupName }} </a-col>
                <a-col :span="12"> 状态：{{ hostStatusMap[status] }} </a-col>
              </a-row>
              <span class="detail-info-toggle" @click="hostDetailToggle">
                {{ detailTxt }}
                <a-icon :type="detailIcon" />
              </span>
            </div>
          </div>
          <div v-show="detailToggle">
            <div class="os-info info-block">
              <span class="title info-label">操作系统</span>
              <div class="info-row-item">
                <a-row type="flex">
                  <a-col :span="12" :order="1">
                    <span class="info-label">操作系统版本：</span>
                    <CutText :text="os.os_version || '暂无'" :length="25" />
                  </a-col>
                  <a-col :span="12" :order="2">
                    <span class="info-label">内核版本：</span>
                    <CutText :text="os.kernel || '暂无'" :length="25" />
                  </a-col>
                </a-row>
              </div>
              <div class="info-row-item">
                <a-row>
                  <a-col :span="6" :order="1">
                    <span class="info-label">bios版本：</span>
                    <CutText :text="os.bios_version || '暂无'" :length="14" />
                  </a-col>
                </a-row>
              </div>
            </div>
            <div class="cpu-info info-block">
              <span class="title info-label">CPU信息</span>
              <div class="info-row-item">
                <a-row type="flex">
                  <a-col :span="6" :order="1">
                    <span class="info-label">架构：</span>
                    <CutText :text="cpu.architecture || '暂无'" :length="14" />
                  </a-col>
                  <a-col :span="6" :order="2">
                    <span class="info-label">核数：</span>
                    <CutText :text="cpu.core_count || '暂无'" :length="14" />
                  </a-col>
                  <a-col :span="6" :order="3">
                    <span class="info-label">厂商：</span>
                    <CutText :text="cpu.vendor_id || '暂无'" :length="14" />
                  </a-col>
                  <a-col :span="6" :order="4">
                    <span class="info-label">处理器：</span>
                    <CutText :text="cpu.model_name || '暂无'" :length="14" />
                  </a-col>
                </a-row>
              </div>
              <div class="info-row-item">
                <a-row type="flex">
                  <a-col :span="6" :order="1">
                    <span class="info-label">L1d cache：</span>
                    <CutText :text="cpu.l1d_cache || '暂无'" />
                  </a-col>
                  <a-col :span="6" :order="2">
                    <span class="info-label">L1i cache：</span>
                    <CutText :text="cpu.l1i_cache || '暂无'" />
                  </a-col>
                  <a-col :span="6" :order="3">
                    <span class="info-label">L2 cache：</span>
                    <CutText :text="cpu.l2_cache || '暂无'" />
                  </a-col>
                  <a-col :span="6" :order="4">
                    <span class="info-label">L3 cache：</span>
                    <CutText :text="cpu.l3_cache || '暂无'" />
                  </a-col>
                </a-row>
              </div>
            </div>
            <div class="memory-info info-block">
              <span class="title info-label">内存信息</span>
              <div class="info-row-item">
                <a-row type="flex">
                  <a-col :span="12" :order="1">
                    <span class="info-label info-row-item-left">内存大小：</span>
                    <CutText :text="memory.size || '暂无'" />
                  </a-col>
                  <a-col :span="12" :order="2">
                    <span class="info-label">内存数量：</span>
                    {{ memory.total || '暂无' }}
                  </a-col>
                </a-row>
              </div>
              <a-collapse>
                <a-collapse-panel :header="'详情'">
                  <span v-if="memory.info.length < 1">暂无数据</span>
                  <div class="info-row-item" v-for="(data, idx) in memory.info" :key="idx">
                    <a-row type="flex">
                      <a-col :span="6" :order="1">
                        <span class="info-label">大小：</span>
                        <CutText :text="data.size || '暂无'" />
                      </a-col>
                      <a-col :span="6" :order="2">
                        <span class="info-label">类型：</span>
                        <CutText :text="data.type || '暂无'" />
                      </a-col>
                      <a-col :span="6" :order="3">
                        <span class="info-label">速度：</span>
                        <CutText :text="data.speed || '暂无'" />
                      </a-col>
                      <a-col :span="6" :order="4">
                        <span class="info-label">厂商：</span>
                        <CutText :text="data.manufacturer || '暂无'" />
                      </a-col>
                    </a-row>
                  </div>
                </a-collapse-panel>
              </a-collapse>
            </div>
            <div class="disk-info info-block">
              <span class="title info-label">硬盘信息</span>
              <div class="info-row-item">
                <a-row type="flex">
                  <a-col :span="24" :order="2">
                    <span class="info-label">硬盘数量：</span>
                    {{ disk.length }}
                  </a-col>
                </a-row>
              </div>
              <a-collapse>
                <a-collapse-panel :header="'详情'">
                  <span v-if="disk.length < 1">暂无数据</span>
                  <div class="info-row-item" v-for="(data, idx) in disk" :key="idx">
                    <a-row type="flex">
                      <a-col :span="12" :order="1">
                        <span class="info-label">容量：</span>
                        <CutText :text="data.capacity || '暂无'" />
                      </a-col>
                      <a-col :span="12" :order="2">
                        <span class="info-label">模型：</span>
                        <CutText :text="data.model || '暂无'" :length="20" />
                      </a-col>
                    </a-row>
                  </div>
                </a-collapse-panel>
              </a-collapse>
            </div>
          </div>
        </div>
      </div>
    </a-spin>
  </div>
</template>
<script>
import CutText from '@/components/CutText';

const hostStatusMap = {
  '0': '在线',
  '1': '离线',
  '2': '未确认',
  '3': '扫描中',
  '4': '已完成',
  '5': '未知'
};

export default {
  name: 'AddHostDetail',
  components: {CutText},
  data() {
    return {
      hostStatusMap,
      detailToggle: true,
      detailTxt: '详情收起',
      detailIcon: 'up',
      collapsed: false,
      hostId: this.$route.params.hostId,
      hostGroupName: undefined,
      hostName: undefined,
      hostIp: undefined,
      scene: undefined,
      status: undefined,
      os: {},
      cpu: {},
      memory: {
        info: []
      },
      disk: []
    };
  },
  props: {
    basicHostInfo: {
      type: Object,
      default: undefined
    },
    basicInfo: {
      type: Object,
      default: undefined
    },
    isLoading: {
      type: Boolean,
      default: false
    }
  },
  watch: {
    // 主机基本信息
    basicHostInfo: function() {
      this.getHostDetail();
    },
    // 主机下资源信息
    basicInfo: function() {
      this.getDetail();
    }
  },
  methods: {
    getHostDetail() {
      const data = this.basicHostInfo;
      this.hostGroupName = data.host_group_name || '暂无';
      this.hostIp = data.host_ip || '暂无';
      this.status = data.status || '暂无';
      this.hostName = data.host_name || '暂无';
      this.scene = data.scene || '暂无';
    },
    getDetail() {
      let data = this.basicInfo;
      data = data.host_info;
      for (const member in data.os) {
        this.os[member] = data.os[member] || '暂无';
      }
      for (const member in data.cpu) {
        this.cpu[member] = data.cpu[member] || '暂无';
      }
      for (const member in data.memory) {
        this.memory[member] = data.memory[member] || '暂无';
      }
      this.disk = data.disk || [];
    },
    hostDetailToggle() {
      this.detailToggle = !this.detailToggle;
      this.collapsed = !this.collapsed;
      if (this.detailIcon === 'up') {
        this.detailTxt = '详情展开';
        this.detailIcon = 'down';
      } else {
        this.detailTxt = '详情收起';
        this.detailIcon = 'up';
      }
    }
  },
  mounted() {}
};
</script>
<style lang="less" scoped>
.addtional-info {
  font-size: 12px;
}

.info-block {
  display: block;
  position: relative;
  width: 100%;
  padding: 12px 0 16px;
  box-sizing: border-box;
  border-bottom: 2px solid rgba(240, 242, 245);
  &.collapsed {
    border-bottom: 2px solid transparent;
    padding-bottom: 9px !important;
  }
  .info-row-item {
    padding-top: 16px;
  }
  .detail-info-toggle {
    position: absolute;
    font-size: 14px;
    right: 0;
    cursor: pointer;
  }
}

.host-img {
  display: block;
  width: 75px;
  height: 75px;
  border-radius: 50%;
  background-color: transparent;
  position: absolute;
  & img {
    width: 80%;
    height: 80%;
    border-radius: 50%;
    transform: translate(8px, 8px);
  }
}

.host-basic-info {
  font-size: 16px;
  padding-top: 0;
  padding-bottom: 32px;
  &-row {
    font-weight: bold;
    padding-top: 9px;
    .ant-col:first-child {
      padding-left: 100px;
    }
  }
}

.memory-info {
  padding-bottom: 0;
}

.disk-info {
  padding-bottom: 0;
  border-bottom: none;
}

.title {
  display: block;
  font-size: 16px;
}

.info-label {
  font-weight: bold;
}

/deep/ .ant-collapse {
  background: #fff;
  border: 0;
  & > .ant-collapse-item {
    border-bottom: 0;
    & > .ant-collapse-header {
      padding-left: 0;
      font-size: 14px;
      color: rgba(0, 0, 0, 0.65);
      .ant-collapse-arrow {
        left: 40px;
      }
    }
  }
  .info-row-item:first-child {
    padding-top: 0;
  }
}
/deep/ .ant-collapse-content {
  border-top: 0;
  .ant-collapse-content-box {
    padding-top: 0;
  }
}
</style>
