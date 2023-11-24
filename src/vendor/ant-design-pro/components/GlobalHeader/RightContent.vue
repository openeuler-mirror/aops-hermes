<template>
  <div :class="wrpCls">
    <span class="support" @click="toSupprotFile">
      <a-icon type="question-circle" />
      帮助文档
    </span>
    <avatar-dropdown :menu="showMenu" :current-user="{name: userName}" :class="prefixCls" />
  </div>
</template>

<script>
import {mapState} from 'vuex';
import AvatarDropdown from './AvatarDropdown';

export default {
  name: 'RightContent',
  components: {
    AvatarDropdown
  },
  props: {
    prefixCls: {
      type: String,
      default: 'ant-pro-global-header-index-action'
    },
    isMobile: {
      type: Boolean,
      default: () => false
    },
    topMenu: {
      type: Boolean,
      required: true
    },
    theme: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      showMenu: true,
      currentUser: {}
    };
  },
  methods: {
    toSupprotFile() {
      window.open('https://docs.openeuler.org/zh/docs/22.03_LTS_SP2/docs/A-Ops/overview.html');
    }
  },
  computed: {
    wrpCls() {
      return {
        'ant-pro-global-header-index-right': true,
        [`ant-pro-global-header-index-${this.isMobile || !this.topMenu ? 'light' : this.theme}`]: true
      };
    },
    ...mapState({
      userName: (state) => state.user.name
    })
  },
  mounted() {}
};
</script>

<style lang="less" scoped>
.support {
  cursor: pointer;
  transition: all 0.3s;
}
.support:hover {
  color: #002fa7;
}
</style>
