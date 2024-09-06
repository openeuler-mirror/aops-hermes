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

  /**
   * Queries the clusters by making an API call to the server and updates the state
   * with the response if successful.
   *
   * @return {Promise<void>} A promise that resolves when the API call is complete.
   */
  async function queryClusters(): Promise<void> {
    const [_, res] = await api.getClusters()
    if (res)
      clusters.value = res
  }

  /**
   * Asynchronously queries the host groups by making an API call to the server and updates the state
   * with the response if successful.
   *
   * @return {Promise<void>} A promise that resolves when the API call is complete.
   */
  async function queryHostGroups(): Promise<void> {
    const [_, res] = await api.getHostGroups()
    if (res)
      hostGroups.value = res.host_group_infos
  }

  /**
   * Asynchronously queries the user's permission by making an API call to the server and updates the state
   * with the response if successful.
   *
   * @return {Promise<void>} A promise that resolves when the API call is complete.
   */
  async function queryPermission(): Promise<void> {
    const { userInfo } = useAccountStore()
    const [_, res] = await api.getAccountPermission(userInfo?.username)
    if (res)
      permissions.value = res
  }

  /**
   * Registers a new cluster with the given parameters.
   *
   * @param {object} params - The parameters for registering the cluster.
   * @param {string} params.cluster_name - The name of the cluster.
   * @param {string} params.description - The description of the cluster.
   * @param {string} params.cluster_ip - The IP address of the cluster.
   * @param {string} params.cluster_username - The username for accessing the cluster.
   * @param {string} params.cluster_password - The password for accessing the cluster.
   * @return {Promise<boolean>} A promise that resolves to true if the cluster was registered successfully, false otherwise.
   */
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

  /**
   * Updates a cluster with the given parameters.
   *
   * @param {object} params - The parameters for updating the cluster.
   * @param {string} params.cluster_id - The ID of the cluster.
   * @param {string} params.cluster_name - The new name of the cluster.
   * @param {string} params.description - The new description of the cluster.
   * @param {string} params.cluster_ip - The new IP address of the cluster.
   * @return {Promise<boolean>} A promise that resolves to true if the cluster was updated successfully, false otherwise.
   */
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
    queryHostGroups()
    queryPermission()
  })

  return { clusters, hostGroups, permissions, queryClusters, queryHostGroups, registerCluster, updateCluster, queryPermission }
})
