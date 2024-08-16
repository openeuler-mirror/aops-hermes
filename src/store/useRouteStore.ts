// Copyright (c) Huawei Technologies Co., Ltd. 2023-2024. All rights reserved.
// licensed under the Mulan PSL v2.
// You can use this software according to the terms and conditions of the Mulan PSL v2.
// You may obtain a copy of Mulan PSL v2 at:
//      http://license.coscl.org.cn/MulanPSL2
// THIS SOFTWARE IS PROVIDED ON AN 'AS IS' BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT, MERCHANTABILITY OR FIT FOR A PARTICULAR
// PURPOSE.
// See the Mulan PSL v2 for more details.
import { defineStore } from 'pinia'
import type { RouteRecordRaw } from 'vue-router'
import { ref } from 'vue'
import { useAccountStore } from '@/store'
import { dynamicRoutes, staticRoutes } from '@/conf'
import { deepClone } from '@/utils'

export const useRouteStore = defineStore('routeStore', () => {
  const routeMap = ref<RouteRecordRaw[]>([])

  /**
   * generate dynamic routes by route config
   */
  function generateRouter(): RouteRecordRaw[] {
    const { userInfo } = useAccountStore()
    const roleType = userInfo?.type || ''
    if (roleType === 'administrator') {
      return (routeMap.value = [...staticRoutes, ...dynamicRoutes])
    }
    else {
      const authentication = (routes: RouteRecordRaw[]) => {
        const routesDp = deepClone(routes) as RouteRecordRaw[]
        const result = routesDp.map((route: RouteRecordRaw) => {
          route.children = route.children?.filter((child) => {
            if (!child.meta)
              return true
            if (!child.meta.permission)
              return true
            if (child.meta.permission === roleType)
              return true
            return false
          })
          return route
        })

        return result
      }
      const dynamicR = authentication(dynamicRoutes)
      return (routeMap.value = [...staticRoutes, ...dynamicR])
    }
  }

  /**
   * clear routes
   */
  function clearRoutes() {
    routeMap.value = []
  }

  return { routeMap, generateRouter, clearRoutes }
})
