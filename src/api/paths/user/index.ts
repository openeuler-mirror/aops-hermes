// Copyright (c) Huawei Technologies Co., Ltd. 2023-2024. All rights reserved.
// licensed under the Mulan PSL v2.
// You can use this software according to the terms and conditions of the Mulan PSL v2.
// You may obtain a copy of Mulan PSL v2 at:
//      http://license.coscl.org.cn/MulanPSL2
// THIS SOFTWARE IS PROVIDED ON AN 'AS IS' BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT, MERCHANTABILITY OR FIT FOR A PARTICULAR
// PURPOSE.
// See the Mulan PSL v2 for more details.
import type { Account, Cluster, HostGroup } from '@/api'
import { http } from '@/api/request'

function getUserAccounts(params: { username?: string, page: number, per_page: number }) {
  return http.get<{
    result: Account[]
    total_count: number
    total_page: number
  }>('/accounts', { params })
}

function getClusters() {
  return http.get<Cluster[]>('/accounts/cluster')
}

function getClustersWithId(clusterIds: string[]) {
  return http.get<
    { cluster_id: string, cluster_name: string, cluster_ip: string, description: string }[]
  >('/hosts/cluster', { params: { cluster_ids: clusterIds } })
}

function deleteCluster(clusterId: string) {
  return http.delete('/accounts/cluster', { cluster_id: clusterId })
}

function registerCluster(params: {
  cluster_name: string
  description: string
  cluster_ip: string
  cluster_username: string
  cluster_password: string
}) {
  return http.post('/accounts/cluster/register', params)
}

function updateCluster(params: {
  cluster_id: string
  cluster_name: string
  description: string
  cluster_ip: string
}) {
  return http.put('/hosts/cluster', params)
}

/**
 * query account permission info
 * @param username
 * @param cluserId
 */
function getAccountPermission(username?: string, cluserId?: string) {
  return http.get<
    {
      cluster_id: string
      cluster_name: string
      host_groups: HostGroup[]
    }[]
  >('/accounts/permission', { params: { username, cluster_id: cluserId } })
}

function registerPermission(username: string, permission: { cluster_id: string, host_group: string[] }[]) {
  return http.post('/accounts/permission', { username, permission })
}

export * from './types'
export const userApi = {
  getUserAccounts,
  getClusters,
  getClustersWithId,
  deleteCluster,
  registerCluster,
  updateCluster,
  getAccountPermission,
  registerPermission,
}
