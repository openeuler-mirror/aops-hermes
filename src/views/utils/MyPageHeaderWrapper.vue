<template>
  <page-header-wrapper :breadcrumb="breadcrumb" :extra="setExtraItem">
    <slot></slot>
  </page-header-wrapper>
</template>

<script>
import {PageHeaderWrapper} from '@ant-design-vue/pro-layout';
import DescriptionTips from '@/components/DescriptionTips';
import {i18nRender} from '@/vendor/ant-design-pro/locales';

export default {
  name: 'MyPageHeaderWrapper',
  components: {
    PageHeaderWrapper
  },
  props: {
    extraDesc: {
      type: String,
      default: ''
    }
  },
  computed: {
    // 自定义面包屑内容
    breadcrumb() {
      if (this.$route.meta.diyBreadcrumb) {
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
              if (routes.indexOf(route) === routes.length - 1) {
                return <span>{route.breadcrumbName}</span>;
              } else {
                return <router-link to={route.path}>{route.breadcrumbName}</router-link>;
              }
            }
          }
        };
      } else {
        return true; // 未设置面包屑
      }
    }
  },
  methods: {
    setExtraItem() {
      if (this.extraDesc) {
        return <DescriptionTips>{this.extraDesc}</DescriptionTips>;
      } else {
        return undefined;
      }
    }
  }
};
</script>

<style lang="less" scoped>
/deep/ .ant-page-header-heading-extra {
  float: left;
  line-height: 32px;
}
</style>
