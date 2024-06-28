// Copyright (c) Huawei Technologies Co., Ltd. 2023-2024. All rights reserved.
// licensed under the Mulan PSL v2.
// You can use this software according to the terms and conditions of the Mulan PSL v2.
// You may obtain a copy of Mulan PSL v2 at:
//      http://license.coscl.org.cn/MulanPSL2
// THIS SOFTWARE IS PROVIDED ON AN 'AS IS' BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT, MERCHANTABILITY OR FIT FOR A PARTICULAR
// PURPOSE.
// See the Mulan PSL v2 for more details.
import type { DistributionParams, DistributionResponse, PageNation } from '../types'
import type {
  HostGroupInfo,
  HostInfo,
  HostPluginInfoOrigin,
  HostsTableItem,
  QueryHostsParams,
  Sort,
} from './types'
import { http } from '@/api/request'

// #region ------------------------------------ < distribution > ------------------------------------
/**
 * add a new host with host group name, host ip, host name, management,ssh port, ssh user, password or ssh pkey
 * @param params
 */
export function createNewHost(params: Record<
    string,
    {
      host_name: string
      host_group_id: string
      host_ip: string
      management: boolean
      ssh_user: string
      ssh_port: number
      ssh_pkey?: string
      password?: string
    }
  >) {
  return http.post<Record<string, { data: any, label: string }>>('/distribute/hosts', params)
}
/**
 * update host info with host id
 * @param hostId
 * @param params
 */
export function updateHost(hostId: string, params: Record<
    string,
    {
      host_name: string
      host_group_id: string
      host_ip: string
      management: boolean
      ssh_user: string
      ssh_port: number
      ssh_pkey?: string
      password?: string
    }
  >) {
  return http.put(`/distribute/hosts/${hostId}`, params)
}
/**
 * add a new host group with description and name
 * @param params
 */
export function addNewGroup(params: Record<string, { host_group_name: string, description: string, cluster_id: string }>) {
  return http.post<DistributionResponse>('/distribute/hosts/group', params)
}
/**
 * delete host group
 * @param hostGroupId
 * @param params
 */
export function deleteHostGroup(hostGroupId: string, params: Record<string, { group_id: string }>) {
  return http.delete(`/distribute/hosts/group/${hostGroupId}`, params)
}
/**
 * delete host with host id
 * @param hostId
 * @param params
 */
export function deleteHost(hostId: string, params: DistributionParams<{ host_id: string }>) {
  return http.delete<Record<string, { data: any, label: string }>>(`/distribute/hosts/${hostId}`, params)
}
/**
 * delete hosts with host ids
 * @param params
 */
export function deleteHosts(params: DistributionParams<{ host_ids: string[] }>) {
  return http.delete<Record<string, { data: any, label: string }>>(`/distribute/hosts`, params)
}
// #endregion

/**
 * get host list with page、per_page、search_key、management、host_group_name、
 * @param params
 */
export function getHosts(params: QueryHostsParams) {
  return http.get<{
    host_infos: HostsTableItem[]
    total_count: number
    total_page: number
  }>('/hosts', { params })
}
/**
 * get host info by host id
 * @param hostId
 */
export function getHostById<T>(hostId: string, basic: boolean = true, refresh?: boolean) {
  return http.get<T>(`/hosts/${hostId}`, { params: { basic, refresh } })
}
/**
 * query host Running status with host ids
 * @param hostIds
 */
export function getHostsStatus(hostIds: string[]) {
  return http.get<
    {
      host_id: string
      status: number
    }[]
  >('/hosts/status', { params: { host_ids: hostIds } })
}

/**
 * query host groups
 */
export function getHostGroups(params?: {
  cluster_ids?: string[]
} & PageNation &
Partial<Sort>) {
  return http.get<{
    host_group_infos: HostGroupInfo[]
    total_count: number
    total_page: number
  }>('/hosts/group', { params })
}

/**
 * query host info with host id
 */
export function getHostInfo(params: { host_id: number }) {
  return http.get<HostInfo>('/hosts', { params })
}
/**
 *
 * @param hostId
 */
export function queryHostPluginInfo(hostId: number) {
  return http.get<{
    info: HostPluginInfoOrigin[]
  }>('/manage/agent/plugin/info', { params: { host_id: hostId } })
}

export function getScene(hostId: number) {
  return http.get<{
    collect_items: string[]
    scene: string
  }>('/manage/host/scene/get', { params: { host_id: hostId } })
}

export * from './types'
export const assestsApi = {
  getHosts,
  addNewGroup,
  getHostInfo,
  updateHost,
  deleteHost,
  deleteHosts,
  getHostsStatus,
  getHostGroups,
  deleteHostGroup,
  queryHostPluginInfo,
  getScene,
  createNewHost,
  getHostById,
}
