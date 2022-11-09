<template>
  <page-header-wrapper>
    <a-card :bordered="false" class="aops-theme">
      <a-tabs type="card">
        <a-tab-pane key="1" tab="概览">
          <a-card class="aops-theme">
            <HostBasicInfo
              :basicHostInfo="basicHostInfo"
              :basicInfo="basicInfo"
              :isLoading="basicHostInfoIsLoading || basicInfoIsLoading"
            >
            </HostBasicInfo>
          </a-card>
        </a-tab-pane>
        <a-tab-pane key="2" tab="插件">
          <a-card class="aops-theme">
            <HostPluginInfo :scene="scene" @reFetchHostInfo="reFetchHostInfo"></HostPluginInfo>
          </a-card>
        </a-tab-pane>
      </a-tabs>
    </a-card>
    <HostChartInfo :queryIp="basicHostInfo.public_ip" v-if="basicHostInfo.public_ip"/>
  </page-header-wrapper>
</template>

<script>
import {PageHeaderWrapper} from '@ant-design-vue/pro-layout';
import HostPluginInfo from './components/HostPluginInfo.vue';
import HostChartInfo from './components/HostChartInfo'
import HostBasicInfo from '@/views/assests/components/HostBasicInfo.vue';
import {getHostDetail} from '@/api/assest';

export default {
  name: 'HostDetail',
  components: {
    PageHeaderWrapper,
    HostPluginInfo,
    HostBasicInfo,
    HostChartInfo
  },
  data() {
    return {
      hostId: this.$route.params.hostId,
      basicHostInfo: {},
      basicHostInfoIsLoading: false,
      basicInfo: {},
      basicInfoIsLoading: false,
      scene: undefined
    };
  },
  methods: {
    fetchHostInfo(This) {
      const _this = This;
      This.basicHostInfoIsLoading = true;
      getHostDetail(This.hostId, true)
        .then(res => {
          _this.basicHostInfo = res.host_infos[0];
          _this.scene = This.basicHostInfo.scene;
        })
        .catch(err => {
          _this.$message.error(err.response.data.msg);
        })
        .finally(() => {
          _this.basicHostInfoIsLoading = false;
        });
      This.basicInfoIsLoading = true;
      getHostDetail(This.hostId, false)
        .then(res => {
          _this.basicInfo = res.host_infos[0];
        })
        .catch(err => {
          _this.$message.error(err.response.data.msg);
        })
        .finally(() => {
          _this.basicInfoIsLoading = false;
        });
    },
    reFetchHostInfo() {
      this.$options.methods.fetchHostInfo(this);
    }
  },
  mounted: function() {
    this.$options.methods.fetchHostInfo(this);
  }
};
</script>

<style lang="less" scoped>
/deep/ .ant-tabs-bar {
  margin-bottom: 0px;
}
</style>
