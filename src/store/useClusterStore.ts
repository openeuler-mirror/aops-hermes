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
import type { Cluster, HostGroupInfo } from '@/api'
import { api } from '@/api'

export const useClusterStore = defineStore('clusterStore', () => {
  const clusters = ref<Cluster[]>([])
  const hostGroups = ref<HostGroupInfo[]>([])

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

  onMounted(() => {
    queryClusters()
  })
  return { clusters, hostGroups, queryClusters, queryHostGroups }
})
