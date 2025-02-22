// Copyright (c) Huawei Technologies Co., Ltd. 2023-2024. All rights reserved.
// licensed under the Mulan PSL v2.
// You can use this software according to the terms and conditions of the Mulan PSL v2.
// You may obtain a copy of Mulan PSL v2 at:
//      http://license.coscl.org.cn/MulanPSL2
// THIS SOFTWARE IS PROVIDED ON AN 'AS IS' BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT, MERCHANTABILITY OR FIT FOR A PARTICULAR
// PURPOSE.
// See the Mulan PSL v2 for more details.
export interface Domain {
  cluster_id: string
  cluster_name: string
  domain_id: string
  domain_name: string
  priority: number
}

export interface SyncStatus {
  notSyncCount: number
  status: string
  syncInfo: {
    file_path: string
    isSynced: string
  }[]
}
export interface HostInDomain {
  domain_name: string
  hostId: string
  ip: string
  ipv6: string
  syncStatus: string
}

export interface ConfTrace {
  UUID: string
  domain_name: string
  host_id: string
  conf_name: string
  info: string
  create_time: string
  ptrace: string
}

export interface ConfFile {
  contents: string
  filePath: string
}

export interface RealConfFile {
  filePath: string
  path: string
  fileOwner: string
  fileAttr: string
  confContents: string
}
export interface ChangeLog {
  author: string
  changeId: string
  changeReason: string
  date: string
  postValue: string
  preValue: string
}
export interface ConfBaseInfo {
  expectedContents: string
  filePath: string
  changeLog: ChangeLog[]
}

export interface DomainConf {
  confBaseInfos: RealConfFile[]
  domainName: string
  hostID: string
}

export interface ConfChangeRecord {
  UUID: string
  cluster_id: string
  cluster_name: string
  conf_change_record: string
  conf_name: string
  create_time: string
  domain_name: string
  host_id: string
  host_ip: string
}
