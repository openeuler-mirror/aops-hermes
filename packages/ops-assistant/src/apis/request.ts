// Copyright (c) Huawei Technologies Co., Ltd. 2023-2024. All rights reserved.
// licensed under the Mulan PSL v2.
// You can use this software according to the terms and conditions of the Mulan PSL v2.
// You may obtain a copy of Mulan PSL v2 at:
//      http://license.coscl.org.cn/MulanPSL2
// THIS SOFTWARE IS PROVIDED ON AN 'AS IS' BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT, MERCHANTABILITY OR FIT FOR A PARTICULAR
// PURPOSE.
// See the Mulan PSL v2 for more details.
import type { AxiosError, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import axios from 'axios'
import { message as Message, notification } from 'ant-design-vue'
import { useAccountStore, useLangStore } from '@/store'
import { isArrayOrObject } from '@/utils'
import i18n from '@/locales'
import { userApi } from './account'

const { t } = i18n.global

export interface Result<T = any> {
  code: number
  data: T
  message?: string
  label?: string
}

export interface IAnyObj {
  [index: string]: unknown
}

let isRefreshing: boolean = false
const requestQueue: {
  config: InternalAxiosRequestConfig<any>
  resolve: (value: unknown) => void
  reject: (reason?: any) => void
}[] = []

const request = axios.create({
  timeout: 60 * 3 * 1000,
})

const formDataUrl = [
  '/vulnerabilities/cve/advisory/upload',
  '/vulnerabilities/cve/unaffected/upload',
  '/distribute/conftrace/management/uploadManagementConf',
  '/conftrace/management/uploadManagementConf',
]

request.interceptors.request.use(
  (
    config: InternalAxiosRequestConfig<any>,
  ): InternalAxiosRequestConfig<any> | Promise<InternalAxiosRequestConfig<any>> => {
    if (!config.headers['Content-Type']) {
      if (config.url && formDataUrl.includes(config.url))
        config.headers['Content-Type'] = 'application/x-www-form-urlencoded'
      else config.headers['Content-Type'] = 'application/json; charset=UTF-8'
    }

    const { lang } = useLangStore()
    config.headers['Accept-Language'] = lang === 'zh_cn' ? 'zh' : 'en'

    const aopsInfo = localStorage.getItem('aops')
    if (aopsInfo) {
      const { userInfo } = JSON.parse(aopsInfo)
      if (userInfo) {
        const { token } = userInfo
        if (token) config.headers['Access-Token'] = token
      }
    }
    if (config.method === 'get') {
      const { params } = config
      if (!params) return config

      Object.keys(params).forEach(key => {
        if (isArrayOrObject(params[key])) {
          params[key] = encodeURI(JSON.stringify(params[key]))
        }
      })

      return config
    }

    return config
  },
  (error: AxiosError) => {
    Message.error(error.message)
    return Promise.reject(error)
  },
)

let isAuthing = false

/**
 * Downloads a Blob object as a file.
 *
 * @param {Blob} blobData - The Blob object to download.
 * @param {string} fileName - The name of the file to be downloaded.
 */
export function downloadBlobFile(blobData: Blob, fileName: string) {
  const blob = new Blob([blobData])
  const downloadElement = document.createElement('a')
  const href = window.URL.createObjectURL(blob)
  downloadElement.href = href
  downloadElement.download = fileName
  document.body.appendChild(downloadElement)
  downloadElement.click()
  document.body.removeChild(downloadElement)
  window.URL.revokeObjectURL(href)
}

function dealBlobResponse(resp: AxiosResponse<any, any>) {
  const disposition = resp.headers['content-disposition']
  let filename = 'default-filename.extension'

  if (disposition && disposition.includes('attachment')) {
    const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
    const matches = filenameRegex.exec(disposition)
    if (matches != null && matches[1]) filename = matches[1].replace(/['"]/g, '')
  }
  downloadBlobFile(resp.data, filename)
}

request.interceptors.response.use(
  async (response: AxiosResponse<any, any>): Promise<any> => {
    if (response.headers['content-type'] === 'application/octet-stream') {
      dealBlobResponse(response)
      return
    }

    const result: Result = {
      code: response.data.code,
      data: response.data.data || response.data.result,
      message: response.data.message,
    }

    const { code, data } = result

    if (!code.toString().match(/^2\d{2}$/)) {
      switch (Number(code)) {
        case 1201:
          notification.error({
            message: `${t('account.sentence.validationFailed')}`,
            description: response.data.message,
          })
          setTimeout(async () => {
            const { clearInfo } = useAccountStore()
            const { getAuthRedirectUrl } = useAccountStore()
            const url = await getAuthRedirectUrl()
            if (url) {
              clearInfo()
              window.location.href = url
            }
          }, 1000)
          break
        case 1207:
          if (response.config.url !== `/accounts/refreshtoken`) {
            if (!isRefreshing) {
              isRefreshing = true

              const { refreshAuthToken } = useAccountStore()
              try {
                const newToken = await refreshAuthToken()

                if (newToken) {
                  requestQueue.forEach(({ config, resolve }) => {
                    config.headers['Access-Token'] = newToken
                    resolve(request(config))
                  })
                  requestQueue.length = 0
                  return await request(response.config)
                }
              } catch (error) {
                requestQueue.forEach(({ reject }) => reject(error))
                const { clearInfo } = useAccountStore()
                clearInfo()
                window.location.reload()
                return Promise.reject(error)
              } finally {
                isRefreshing = false
              }
            }
            return new Promise((resolve, reject) => {
              requestQueue.push({ config: response.config, resolve, reject })
            })
          } else {
            notification.error({
              message: `${t('account.sentence.validationFailed')}`,
              description: response.data.message,
            })
            setTimeout(() => {
              const { clearInfo } = useAccountStore()
              clearInfo()
              window.location.reload()
            }, 1000)
          }
          break
        default:
          notification.error({
            message: response.data.label,
            description: response.data.message,
          })
      }
      return Promise.reject(result)
    }

    return data
  },
  async (error: AxiosError) => {
    if (error.status === 401) {
      if (!isAuthing) {
        isAuthing = true
        const [, authObj] = await userApi.queryAuthUrl()
        if (!authObj) return
        const authUrl = `${authObj.url}&redirect_index=${location.href}`
        window.location.href = authUrl
      }
    }
    return Promise.reject(error)
  },
)

export const http = {
  get: async <T>(url: string, params?: AxiosRequestConfig): Promise<[any, T | undefined]> => {
    try {
      const result = await request.get(url, params)
      return [null, result as T]
    } catch (error) {
      return [error, undefined]
    }
  },

  post: async <T>(url: string, data?: object, params?: AxiosRequestConfig): Promise<[any, T | undefined]> => {
    try {
      const result = await request.post(url, data, params)
      return [null, result as T]
    } catch (error) {
      return [error, undefined]
    }
  },

  put: async <T>(url: string, data?: object, params?: object): Promise<[any, T | undefined]> => {
    try {
      const result = await request.put(url, data, { params })
      return [null, result as T]
    } catch (error) {
      return [error, undefined]
    }
  },

  delete: async <T>(url: string, data?: object, params?: object): Promise<[any, T | undefined]> => {
    try {
      const result = await request.delete(url, { data, params })
      return [null, result as T]
    } catch (error) {
      return [error, undefined]
    }
  },
  patch: async <T>(url: string, data?: object, params?: object): Promise<[any, T | undefined]> => {
    try {
      const result = await request.patch(url, data, { params })
      return [null, result as T]
    } catch (error) {
      return [error, undefined]
    }
  },
}
