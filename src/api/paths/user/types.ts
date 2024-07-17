// Copyright (c) Huawei Technologies Co., Ltd. 2023-2024. All rights reserved.
// licensed under the Mulan PSL v2.
// You can use this software according to the terms and conditions of the Mulan PSL v2.
// You may obtain a copy of Mulan PSL v2 at:
//      http://license.coscl.org.cn/MulanPSL2
// THIS SOFTWARE IS PROVIDED ON AN 'AS IS' BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT, MERCHANTABILITY OR FIT FOR A PARTICULAR
// PURPOSE.
// See the Mulan PSL v2 for more details.
// #region ---------------------------------------------< user request params >---------------------------------------------
export type AccountRole = 'normal' | 'administrator'
export interface Cluster {
  cluster_id: string
  cluster_name: string
  cluster_ip?: string
  description?: string
  subcluster?: boolean
  host_groups?: string[]
  synchronous_state?: string

}
export interface Account {
  username: string
  email: string
  role_type: AccountRole
  clusters_num: number
  clusters?: ClusterPermission[]
}
export interface HostGroup {
  host_group_id: string
  host_group_name: string
}
export interface ClusterPermission {
  cluster_id: string
  cluster_name: string
  host_groups: HostGroup[]
}
