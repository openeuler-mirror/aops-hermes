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
import { onMounted, ref } from 'vue'
import { useAccountStore } from './useAccountStore'
import type { Cluster, HostGroup, HostGroupInfo } from '@/api'
import { api } from '@/api'

export const useClusterStore = defineStore('clusterStore', () => {
  const clusters = ref<Cluster[]>([])
  const hostGroups = ref<HostGroupInfo[]>([])
  const permissions = ref<{ cluster_id: string, cluster_name: string, host_groups: HostGroup[] }[]>([])

  async function queryClusters() {
    const [_, res] = await api.getClusters()
    if (res)
      clusters.value = res
  }

  async function queryHostGroups() {
    const [_, res] = await api.getHostGroups()
    if (res)
      hostGroups.value = res.host_group_infos
  }

  async function queryPermission() {
    const { userInfo } = useAccountStore()
    const [_, res] = await api.getAccountPermission(userInfo?.username)
    if (res)
      permissions.value = res
  }

  async function registerCluster(params: {
    cluster_name: string
    description: string
    cluster_ip: string
    cluster_username: string
    cluster_password: string
  }): Promise<boolean> {
    const [_] = await api.registerCluster(params)
    return !_
  }

  async function updateCluster(params: {
    cluster_id: string
    cluster_name: string
    description: string
    cluster_ip: string
  }): Promise<boolean> {
    const [_] = await api.updateCluster(params)
    return !_
  }

  onMounted(() => {
    queryClusters()
    queryPermission()
  })
  return { clusters, hostGroups, permissions, queryClusters, queryHostGroups, registerCluster, updateCluster, queryPermission }
})
