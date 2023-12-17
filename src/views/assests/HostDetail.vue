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
    fetchHostInfo() {
      this.basicHostInfoIsLoading = true;
      getHostDetail(Number(this.hostId), true)
        .then((res) => {
          this.basicHostInfo = res.data.host_infos[0];
          this.scene = this.basicHostInfo.scene;
        })
        .catch((err) => {
          this.$message.error(err.response.message);
        })
        .finally(() => {
          this.basicHostInfoIsLoading = false;
        });
      this.basicInfoIsLoading = true;
      getHostDetail(Number(this.hostId), false)
        .then((res) => {
          this.basicInfo = res.data.host_infos[0];
        })
        .catch((err) => {
          this.$message.error(err.response.message);
        })
        .finally(() => {
          this.basicInfoIsLoading = false;
        });
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
