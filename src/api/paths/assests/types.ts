// Copyright (c) Huawei Technologies Co., Ltd. 2023-2024. All rights reserved.
// licensed under the Mulan PSL v2.
// You can use this software according to the terms and conditions of the Mulan PSL v2.
// You may obtain a copy of Mulan PSL v2 at:
//      http://license.coscl.org.cn/MulanPSL2
// THIS SOFTWARE IS PROVIDED ON AN 'AS IS' BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT, MERCHANTABILITY OR FIT FOR A PARTICULAR
// PURPOSE.
// See the Mulan PSL v2 for more details.
export type Direction = 'asc' | 'desc'
export interface PageNation {
  page: number
  per_page: number
}
export interface Sort {
  direction: Direction
  sort: string
}
export interface Search {
  search_key: string
}
export interface HostsParams {
  host_group_list: string[]
  management?: boolean
  cluster_list?: string[]
}
export type QueryHostsParams = HostsParams & Partial<PageNation> & Partial<Sort> & Partial<Search>
export interface HostsTableItem {
  host_id: string
  host_ip: string
  host_name: string
  host_group_name: string
  management: boolean
  ssh_port: number
  cluster_id: string
  cluster_name: string
  os_version: string | null
  scene: string | null
  status?: number
}

export type extraHostInfo = 'scene' | 'os_version'
export type HostToken = 'password' | 'ssh_pkey'
export interface HostInfo {
  host_id: number
  host_ip: string
  host_name: string
  host_group_id: string
  host_group_name: string
  management: boolean
  cluster_id: string
  cluster_name: string
  last_scan: number
  scene: string | null
  os_version: string | null
  password: string
  ssh_pkey?: string
  ssh_port: number
  ssh_user: string
  status?: number
  repo_name: string
  reboot: boolean
  repo_id: string

}
export interface CpuInfo {
  architecture: string
  core_count: string | number
  l1d_cache: string | null
  l1i_cache: string | null
  l2_cache: string | null
  l3_cache: string | null
  model_name: string
  vendor_id: string
}
export interface DiskInfo {
  capacity: string
  model: string
}
export interface Memory {
  info: {
    manufacturer: string
    size: string
    speed: string
    type: string
  }[]
  size: string
  total: number
}
export interface OsInfo {
  bios_version: string
  kernel: string
  os_version: string
}
export type HostBasicInfo = Required<Omit<HostInfo, HostToken>>
export interface HostDetailInfo extends HostBasicInfo {
  cpu: CpuInfo
  disk: DiskInfo[]
  memory: Memory
  os: OsInfo
}
export interface HostWithPassword {
  host_id: number
  password: string
}
export interface HostWithSshPkey {
  host_id: number
  ssh_pkey: string
}

export interface Scene {
  [key: string]: string
}
export interface HostGroupInfo {
  host_group_id: string
  host_group_name: string
  host_count: number
  description: string
  cluster_id: string
  cluster_name: string
}
export type HostGroupTableItem = HostGroupInfo
export interface ProbeInfo {
  probe_name: string
  probe_status: string
  support_auto: boolean
}
export interface HostPluginResource {
  current_value: string
  limit_value: string | number | null
  name: string
}
export interface HostPluginInfo {
  plugin_name: string
  collect_items: ProbeInfo[]
  is_installed: boolean
  status: boolean
  resource: HostPluginResource[]
}
export interface HostPluginInfoOrigin {
  plugin_name: string
  collect_items: ProbeInfo[]
  is_installed: boolean
  status: string
  resource: HostPluginResource[]
}
