// Copyright (c) Huawei Technologies Co., Ltd. 2023-2024. All rights reserved.
// licensed under the Mulan PSL v2.
// You can use this software according to the terms and conditions of the Mulan PSL v2.
// You may obtain a copy of Mulan PSL v2 at:
//      http://license.coscl.org.cn/MulanPSL2
// THIS SOFTWARE IS PROVIDED ON AN 'AS IS' BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT, MERCHANTABILITY OR FIT FOR A PARTICULAR
// PURPOSE.
// See the Mulan PSL v2 for more details.
import type { DistributionParams } from '../types'
import type { HostItem, HostParams } from './types'
import { http } from '@/api/request'

/**
 * query host count
 */
function getHostCount() {
  return http.get<{
    host_count: number
  }>('/hosts/count')
}
/**
 * query host alarm count
 */
function getHostAlarms() {
  return http.get<{
    count: number
  }>('check/result/total/count')
}

function getDomainRate() {
  return http.get('/check/result/domain/count')
}

function downLoadHostTemplate(lang: 'zh' | 'en') {
  return http.get(`/hosts/template/file`, { params: { lang }, responseType: 'blob' })
}

function addHostsBatch(params: DistributionParams<{
  host_list: HostParams[]
}>) {
  return http.post<Record<string, { data: HostItem[], label: string }>>(
    '/distribute/hosts/batch',
    params,
  )
}

function queryHostInfobyHostIps(hostIps: string[]) {
  return http.get<{
    hosts: {
      host_id: string
      host_ip: string
      cluster_id: string
      cluster_name: string
      host_group_name: string
    }[]
    not_found_ips: string[]
  }>('/hosts/ips', { params: { host_ips: hostIps } })
}

export * from './types'
export const hostApi = {
  getHostCount,
  getHostAlarms,
  getDomainRate,
  downLoadHostTemplate,
  addHostsBatch,
  queryHostInfobyHostIps
}
