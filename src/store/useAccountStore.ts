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
import { computed, ref } from 'vue'
import { useRouteStore } from './useRouteStore'
import { api } from '@/api'
import type { LoginParams } from '@/api/paths/account'

export const useAccountStore = defineStore(
  'accountStore',
  () => {
    const userInfo = ref<{
      username: string
      type: string
      token: string
      refreshToken: string
    } | null>()

    const accountRole = computed(() => userInfo.value ? userInfo.value.type : '')

    /**
     * login with username and password
     */
    const login = async (params: LoginParams): Promise<boolean> => {
      const [_, res] = await api.login(params)
      if (!res)
        return false
      const { username, token, refresh_token, type } = res
      userInfo.value = {
        username,
        type,
        token,
        refreshToken: refresh_token,
      }
      return true
    }

    const authorizeLogin = async (code: string): Promise<typeof userInfo.value> => {
      const [_, res] = await api.giteeAuthorize(code)
      if (!res) {
        const { username, token, refresh_token } = _.data
        userInfo.value = {
          username,
          type: '',
          token,
          refreshToken: refresh_token,
        }
        return userInfo.value
      }
      const { username, token, refresh_token, type } = res
      userInfo.value = {
        username,
        type: type || '',
        token,
        refreshToken: refresh_token,
      }
      return userInfo.value
    }

    /**
     * account logout
     */
    const logout = async (): Promise<boolean> => {
      const [_] = await api.logout()
      if (_)
        return false
      clearInfo()
      return true
    }
    function saveInfo(info: typeof userInfo.value) {
      userInfo.value = info
    }

    function clearInfo() {
      const { clearRoutes } = useRouteStore()
      clearRoutes()
      userInfo.value = null
    }

    /**
     * refresh login status by refresh_token
     */
    const refreshToken = async (): Promise<string | null> => {
      const [_, res] = await api.refreshToken({ refresh_token: userInfo.value!.refreshToken })
      if (!res)
        return null
      const { token, refresh_token } = res
      userInfo.value = {
        ...userInfo.value!,
        token,
        refreshToken: refresh_token,
      }
      return token
    }
    return { userInfo, accountRole, login, logout, refreshToken, authorizeLogin, clearInfo, saveInfo }
  },
  {
    persist: {
      key: 'aops',
      paths: ['userInfo'],
    },
  },
)
