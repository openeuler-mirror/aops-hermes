// Copyright (c) Huawei Technologies Co., Ltd. 2023-2024. All rights reserved.
// licensed under the Mulan PSL v2.
// You can use this software according to the terms and conditions of the Mulan PSL v2.
// You may obtain a copy of Mulan PSL v2 at:
//      http://license.coscl.org.cn/MulanPSL2
// THIS SOFTWARE IS PROVIDED ON AN 'AS IS' BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT, MERCHANTABILITY OR FIT FOR A PARTICULAR
// PURPOSE.
// See the Mulan PSL v2 for more details.
import type {
  NavigationGuardNext,
  RouteLocationNormalized,
  RouteRecordName,
} from 'vue-router'
import {
  createRouter,
  createWebHistory,
} from 'vue-router'
import NProgress from 'nprogress'
import { useAccountStore, useRouteStore } from '@/store'
import { staticRoutes } from '@/conf/routeSettings'

const LOGIN_ROUTE_PATH = '/user/login'
const DEFAULT_ROUTE_PATH = '/dashboard'
const ALLOW_ROUTES: RouteRecordName[] = ['login', 'register']
const reg = /^\/user\/(login|register|account)/

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: staticRoutes,
})

router.beforeEach(
  (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
    NProgress.start()
    to.meta
    && typeof to.meta.title !== 'undefined'
    && (document.title = `${to.meta.title} - A-OPS` as string)

    const { userInfo } = useAccountStore()
    const token = userInfo && userInfo.token
    if (token && token !== 'undefined') {
      if (to.path === LOGIN_ROUTE_PATH) {
        next({ path: DEFAULT_ROUTE_PATH })
        NProgress.done()
      }
      else {
        const { generateRouter, routeMap } = useRouteStore()

        if (routeMap.length === 0) {
          const routes = generateRouter()
          routes && routes.forEach(r => router.addRoute(r))
          const redirect = decodeURIComponent((from.query.redirect as string) || to.path)

          to.path === redirect ? next({ ...to, replace: true }) : next({ path: redirect })
        }
        else { next() }
      }
    }
    else {
      if (to.name && ALLOW_ROUTES.includes(to.name)) { next() }
      else {
        reg.test(to.path)
          ? next()
          : next({ path: LOGIN_ROUTE_PATH, query: { redirect: to.fullPath } })
      }
      NProgress.done()
    }
  },
)

router.afterEach(() => {
  NProgress.done()
})

export default router
