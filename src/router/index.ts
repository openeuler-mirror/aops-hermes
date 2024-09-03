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
import i18n from '@/locales'

const { t } = i18n.global

const LOGIN_ROUTE_PATH = '/user/login'
const DEFAULT_ROUTE_PATH = '/dashboard'
const ALLOW_ROUTES: RouteRecordName[] = ['login', 'register']
const reg = /^\/user\/(?:login|register|account|auth)|error/

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: staticRoutes,
})

/**
 * A navigation guard that checks if the user is trying to access a route other than the login page.
 * If the user is not trying to access the login page, it generates the dynamic routes using the route configuration,
 * adds them to the router, and redirects the user to the intended route if available.
 * If the user is trying to access the login page, it redirects them to the default route.
 *
 * @param {RouteLocationNormalized} to - The route location object representing the target route.
 * @param {RouteLocationNormalized} from - The route location object representing the current route.
 * @param {NavigationGuardNext} next - The function to call to continue the navigation.
 * @return {void} This function does not return anything.
 */
function noAuthGuard(to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext): void {
  if (to.path !== LOGIN_ROUTE_PATH) {
    NProgress.done()
    const { generateRouter, routeMap } = useRouteStore()

    if (routeMap.length === 0) {
      const routes = generateRouter()
      routes && routes.forEach(r => router.addRoute(r))
      const redirect = decodeURIComponent((from.query.redirect as string) || to.path)

      to.path === redirect ? next({ ...to, replace: true }) : next({ path: redirect })
    }
    else { next() }
  }
  else {
    next({ path: DEFAULT_ROUTE_PATH })
  }
}
/**
 * Checks if the user is authorized to access the route specified by the given `to` parameter.
 * If the user is authorized, the `next` function is called. Otherwise, the user is redirected to the login page.
 *
 * @param {RouteLocationNormalized} to - The route location object representing the target route.
 * @param {NavigationGuardNext} next - The function to call to continue the navigation.
 * @return {void} This function does not return anything.
 */
async function authGuard(to: RouteLocationNormalized, next: NavigationGuardNext): Promise<void> {
  if (to.name && ALLOW_ROUTES.includes(to.name)) {
    const { getAuthRedirectUrl } = useAccountStore()
    const url = await getAuthRedirectUrl()
    if (url) {
      window.location.href = url
    } else {
      router.push('/error')
    }
  }
  else {
    reg.test(to.path)
      ? next()
      : next({ path: LOGIN_ROUTE_PATH, query: { redirect: to.fullPath } })
  }
  NProgress.done()
}

router.beforeEach(
  (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
    NProgress.start()
    to.meta && typeof to.meta.title !== 'undefined' && (document.title = `${t(to.meta.title as string)} - A-OPS` as string)

    const { userInfo } = useAccountStore()
    const token = userInfo && userInfo.token
    if (token && token !== 'undefined')
      noAuthGuard(to, from, next)
    else
      authGuard(to, next)
  },
)

router.afterEach(() => {
  NProgress.done()
})

export default router
