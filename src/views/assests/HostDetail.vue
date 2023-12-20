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
    <HostChartInfo :queryIp="basicHostInfo.host_ip" v-if="basicHostInfo.host_ip" />
  </page-header-wrapper>
</template>

<script>
import {PageHeaderWrapper} from '@ant-design-vue/pro-layout';
import HostPluginInfo from './components/HostPluginInfo.vue';
import HostChartInfo from './components/HostChartInfo';
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
    async fetchHostInfo() {
      this.basicHostInfoIsLoading = true;
      this.basicInfoIsLoading = true;
      const basicHostRes = await getHostDetail(Number(this.hostId), true);
      if (basicHostRes) {
        this.basicHostInfo = basicHostRes.data.host_infos[0];
        this.scene = this.basicHostInfo.scene;
      }
      const basicRes = await getHostDetail(Number(this.hostId), false);
      if (basicRes) {
        this.basicInfo = basicRes.data.host_infos[0];
      }
      this.basicInfoIsLoading = false;
      this.basicHostInfoIsLoading = false;
    },
    reFetchHostInfo() {
      this.fetchHostInfo();
    }
  },
  mounted() {
    this.fetchHostInfo();
  }
};
</script>

<style lang="less" scoped>
/deep/ .ant-tabs-bar {
  margin-bottom: 0px;
}
</style>
