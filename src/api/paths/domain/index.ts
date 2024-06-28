// Copyright (c) Huawei Technologies Co., Ltd. 2023-2024. All rights reserved.
// licensed under the Mulan PSL v2.
// You can use this software according to the terms and conditions of the Mulan PSL v2.
// You may obtain a copy of Mulan PSL v2 at:
//      http://license.coscl.org.cn/MulanPSL2
// THIS SOFTWARE IS PROVIDED ON AN 'AS IS' BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT, MERCHANTABILITY OR FIT FOR A PARTICULAR
// PURPOSE.
// See the Mulan PSL v2 for more details.
import type { ConfBaseInfo, ConfFile, Domain, HostInDomain } from './types'
import { http } from '@/api/request'

function getDomains() {
  return http.post<Domain[]>('/domain/queryDomain')
}

function getHostsInDomain(domainName: string) {
  return http.post<HostInDomain[]>('/host/getHost', { domainName })
}

function getDomainConf(domainName: string) {
  return http.post<{
    domainName: string
    confFiles: ConfFile[]
  }>('/management/getManagementConf', { domainName })
}

function getDomainConfLog(domainName: string, confFiles: { filePath: string }[]) {
  return http.post<{
    domainName: string
    confBaseInfos: ConfBaseInfo[]
  }>('/management/queryManageConfChange', { domainName, confFiles })
}

function addDomainConfig(domainName: string, confFiles: { filePath: string, contents?: string, hostId?: number }[]) {
  return http.post('/management/addManagementConf', { domainName, confFiles })
}

function deleteDomainConfig(domainName: string, confFiles: { filePath: string }[]) {
  return http.delete('/management/deleteManagementConf', { domainName, confFiles })
}

function getDomainSupportConfs(domainName: string) {
  return http.post<string[]>('/confs/querySupportedConfs', { domainName })
}

export * from './types'
export const domainApi = {
  getDomains,
  getHostsInDomain,
  getDomainConf,
  getDomainConfLog,
  addDomainConfig,
  deleteDomainConfig,
  getDomainSupportConfs,
}
