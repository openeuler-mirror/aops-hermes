<script lang="ts" setup>
import { useRoute, useRouter } from 'vue-router'
import { QuestionCircleOutlined } from '@ant-design/icons-vue'
import { computed } from 'vue'

export interface Breadcrumb {
  breadcrumbName: string
  path: string
  label: string
  redirect?: string
  desc?: string
  query?: any
}

const props = defineProps<{
  breadcrumb?: Breadcrumb[]
}>()
const route = useRoute()
const router = useRouter()
const breadcrumb = computed<Breadcrumb[]>(() => {
  if (props.breadcrumb)
    return props.breadcrumb
  const { matched } = route
  if (matched[matched.length - 1].meta.diyBreadcrumb)
    return matched[matched.length - 1].meta.diyBreadcrumb as Breadcrumb[]

  return matched
    .filter(item => !item.meta.hiddenChildren)
    .map(item => ({
      breadcrumbName: item.meta.title,
      path: item.path,
      label: item.meta.title,
      desc: item.meta.desc,
      redirect: item.redirect,
    })) as Breadcrumb[]
})

/**
 * Breadcrumb click event
 * @param route
 */
function onBreadCrumbClick(route: Breadcrumb): void {
  // const path = route.redirect ?? route.path;
  router.push({ path: route.path, query: route.query })
}
</script>

<template>
  <div class="page-wrapper">
    <div class="page-wrapper-breadcrumb">
      <a-breadcrumb>
        <a-breadcrumb-item v-for="(item, index) in breadcrumb" :key="item.path">
          <span v-if="index === breadcrumb.length - 1">{{ item.breadcrumbName }}</span>
          <span v-else class="page-wrapper-breadcrumb__operable" @click="onBreadCrumbClick(item)">{{
            item.breadcrumbName
          }}</span>
        </a-breadcrumb-item>
      </a-breadcrumb>
      <div class="page-wrapper-breadcrumb__title">
        <span>
          {{
            breadcrumb[breadcrumb.length - 1].label
              || breadcrumb[breadcrumb.length - 1].breadcrumbName
          }}
        </span>
        <a-tooltip
          v-if="breadcrumb[breadcrumb.length - 1].desc"
          class="page-wrapper-breadcrumb__extra"
          color="#fff"
          placement="bottomLeft"
        >
          <QuestionCircleOutlined />
          <template #title>
            <span style="color: #000000"> {{ breadcrumb[breadcrumb.length - 1].desc }}</span>
          </template>
        </a-tooltip>
      </div>
    </div>
    <div class="page-wrapper-content">
      <slot />
    </div>
  </div>
</template>

<style lang="less" scoped>
.page-wrapper {
  &-content {
    padding: 20px;
  }
  &-breadcrumb {
    background-color: #ffffff;
    padding: 12px 24px;

    &__operable {
      cursor: pointer;
      &:hover {
        color: #3265f2;
      }
    }
    &__title {
      display: flex;
      margin-bottom: 0;
      padding-right: 12px;
      color: rgba(0, 0, 0, 0.85);
      font-weight: 600;
      font-size: 20px;
      line-height: 32px;
      margin-top: 7px;
    }
    &__extra {
      font-size: 14px;
      transform: translate(12px, 0px);
    }
  }
}
</style>
