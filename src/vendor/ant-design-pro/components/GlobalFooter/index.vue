<template>
  <global-footer class="footer custom-render">
    <template v-slot:links>
      <div>
        <a @click="toHelp" target="_blank">帮助</a>
        <!-- <a href="" target="_blank">反馈</a>
        <a href="" target="_blank">关于我们</a> -->
      </div>
      <div>版权所有 © 2023 openEuler 保留一切权利</div>
    </template>
    <template v-slot:copyright>
      <img src="~@/assets/horizontal-left.png" style="height: 20px" class="logo" alt="logo" />
    </template>
  </global-footer>
</template>

<script>
import {GlobalFooter} from '@ant-design-vue/pro-layout';

export default {
  name: 'ProGlobalFooter',
  components: {
    GlobalFooter
  },
  methods: {
    toHelp() {
      window.open('https://docs.openeuler.org/zh/docs/22.03_LTS_SP2/docs/A-Ops/overview.html');
    }
  }
};
</script>
