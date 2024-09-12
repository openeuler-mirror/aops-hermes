<script lang="ts" setup>
import { useRoute, useRouter } from 'vue-router'
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons-vue'
import type { ItemType, MenuProps } from 'ant-design-vue'
import type { MenuInfo } from 'ant-design-vue/es/menu/src/interface'
import type { RouteLocationRaw, RouteRecordRaw } from 'vue-router'
import { computed, onBeforeMount, ref, useSlots, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  menus: RouteRecordRaw[]
}>()

const { t } = useI18n()

const router = useRouter()
const route = useRoute()

const slots = useSlots()

const collapsed = ref<boolean>(false)
const menuWidth = computed(() => (collapsed.value ? 80 : 256))

// #region ----------------------------------------< menu >----------------------------------------
const openKeys = ref<string[]>([])

/**
 * generate menu by routes map
 * @param tree
 */
function generateMenu(tree: RouteRecordRaw[]): ItemType[] {
  return tree
    .filter(item => {
      const { hidden } = item.meta || {}
      return !hidden
    })
    .map(item => {
      const { title, icon, hiddenChildren } = item.meta || {}
      const result = {
        key: item.path,
        icon,
        label: t(title as string),
      }
      if (item.children && !hiddenChildren) (result as any).children = generateMenu(item.children)

      return result
    }) as ItemType[]
}
const selectedKeys = ref<string[]>([])

/**
 * init current menu after refresh and first load
 */
function initMenu() {
  const { matched } = router.currentRoute.value
  for (let i = matched.length - 1; i >= 0; i--) {
    if (matched[i].meta.hidden) continue
    selectedKeys.value = [matched[i].path as string]
    const path = matched[i].path.split('/')[1]
    openKeys.value = [`/${path}`]
    break
  }
}

// menu
const menu = computed<ItemType[]>(() => {
  const { menus } = props

  const menuTree = generateMenu(menus)
  return menuTree
})

const rootSubmenuKeys = computed(() => menu.value.map(item => item?.key))

/**
 * Click to jump to the specified page
 * @param e
 */
const onMenuItemClick: MenuProps['onClick'] = (e: MenuInfo): void => {
  if (rootSubmenuKeys.value.includes(e.key)) openKeys.value = []
  router.push(e.key as RouteLocationRaw)
}

/**
 * The menu bar expands only one secondary menu at most
 * @param keys
 */
function onOpenMenu(keys: string[]) {
  const latestOpenKey = keys.find(key => !openKeys.value.includes(key))
  if (!rootSubmenuKeys.value.includes(latestOpenKey)) openKeys.value = keys
  else openKeys.value = latestOpenKey ? [latestOpenKey] : []
}

watch(
  () => route.path,
  () => {
    initMenu()
  },
)
// #endregion

onBeforeMount(() => {
  initMenu()
})
</script>

<template>
  <a-layout>
    <a-layout-sider
      v-model:collapsed="collapsed"
      :trigger="null"
      collapsible
      theme="light"
      width="256"
      class="basic-layout-sider"
    >
      <div class="menu-header">
        <slot name="menuHeaderLogo" />
      </div>
      <a-menu
        v-model:selectedKeys="selectedKeys"
        theme="light"
        mode="inline"
        :items="menu"
        :open-keys="openKeys"
        @click="onMenuItemClick"
        @open-change="onOpenMenu"
      />
    </a-layout-sider>
    <a-layout :style="{ marginLeft: `${menuWidth}px` }">
      <a-layout-header class="basic-layout-header">
        <div class="basic-layout-header__left" @click="collapsed = !collapsed">
          <MenuUnfoldOutlined v-if="collapsed" />
          <MenuFoldOutlined v-else />
        </div>
        <div class="basic-layout-header__right">
          <slot name="headerRight" />
        </div>
      </a-layout-header>

      <a-layout-content class="basic-layout-content">
        <router-view />
      </a-layout-content>
      <a-layout-footer v-if="Object.keys(slots).includes('footer')">
        <div class="basic-layout-footer">
          <slot name="footer" />
        </div>
      </a-layout-footer>
    </a-layout>
  </a-layout>
</template>

<style lang="less" scoped>
.basic-layout-sider {
  overflow: auto;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  box-shadow: 2px 0 8px 0 rgba(29, 35, 41, 0.05);
  .menu-header {
    height: 64px;
    line-height: 64px;
    overflow: hidden;
    transition: all 0.3s;
    padding-left: 24px;
    cursor: pointer;
    box-shadow: 1px 1px 0 0 var(--box-shadow-color);
    position: relative;
    white-space: nowrap;
  }
}
.basic-layout-header {
  background-color: var(--bg-basic-layout-header);
  padding: 0 20px 0 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 1px 4px var(--box-shadow-color);
  z-index: 1;
  &__left {
    width: 64px;
    height: auto;
    font-size: 20px;
    text-align: center;
    cursor: pointer;
    &:hover {
      background-color: var(--bg-basic-layout-hover);
    }
  }
  &__right {
    font-size: 14px;
  }
}
.basic-layout-breadcrumb {
  background-color: #ffffff;
  padding: 12px 24px;
  &__operable {
    cursor: pointer;
    &:hover {
      color: #3265f2;
    }
  }
  &__title {
    display: block;
    float: left;
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
    transform: translate(12px, -2px);
  }
}
.basic-layout-content {
  height: calc(100vh - 64px);
  min-height: calc(100vh - 213px);
  display: flex;
  flex-direction: column;
  transition: all 0.5s;
  overflow: auto;
}
.basic-layout-footer {
  padding: 24px 50px 25px 50px;
  color: rgba(0, 0, 0, 0.65);
  font-size: 14px;
  text-align: center;
}

.over {
  position: fixed;
  bottom: 20px;
  right: 20px;
}
.trigger-button {
  width: 50px;
  height: 50px;
  background: var(--background-secondary-color);
  display: grid;
  place-items: center;
  place-content: center;
  border-radius: 50%;
}
.content {
  width: 400px;
  height: 75vh;
}
</style>

