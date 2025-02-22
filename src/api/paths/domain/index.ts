// Copyright (c) Huawei Technologies Co., Ltd. 2023-2024. All rights reserved.
// licensed under the Mulan PSL v2.
// You can use this software according to the terms and conditions of the Mulan PSL v2.
// You may obtain a copy of Mulan PSL v2 at:
//      http://license.coscl.org.cn/MulanPSL2
// THIS SOFTWARE IS PROVIDED ON AN 'AS IS' BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT, MERCHANTABILITY OR FIT FOR A PARTICULAR
// PURPOSE.
// See the Mulan PSL v2 for more details.
import type { HostsTableItem } from '../assests'
import type { DistributionParams, DistributionResponse, PageNation, Sort } from '../types'
import type { ConfBaseInfo, ConfChangeRecord, ConfFile, ConfTrace, Domain, DomainConf, HostInDomain } from './types'
import { http } from '@/api/request'

function getDomains(params: Partial<PageNation & Sort>) {
  return http.post<{
    domain_infos: Domain[]
    total_count: number
    total_page: number
  }>('/conftrace/domain/queryDomain', params)
}

function getHostsInDomain(params: {
  domainName: string
  hostIp?: string
  sync_status?: number
  page?: number
  per_page?: number
}) {
  return http.post<{
    hostlist: HostInDomain[]
    total_page: number
    total_count: number
  }>('/conftrace/host/getHost', params)
}

function getDomainManagementConf(domainName: string) {
  return http.post<{
    domainName: string
    confFiles: ConfFile[]
  }>('/conftrace/management/getManagementConf', { domainName })
}

function getDomainSyncStatus(params: { domainName: string }) {
  return http.post<
    {
      host_id: string
      host_ip: string
      sync_status: number
    }[]
  >('/conftrace/host/sync/status/get', params)
}

function getNotExitedHostList(params: { clusterId: string }) {
  return http.post<HostsTableItem[]>('/conftrace/host/getNonexistentHost', params)
}

// #region ------------------------------------ < distribution > ------------------------------------
function getDomainSupportConfs(params: DistributionParams<{ domainName: string }>) {
  return http.post<DistributionResponse<string[]>>('/distribute/conftrace/confs/querySupportedConfs', params)
}

function createDomain(
  params: DistributionParams<{
    domainName: string
    conf_change_flag: boolean
    report_flag: boolean
    priority?: number
    clusterId?: string
  }>,
) {
  return http.post<DistributionResponse>('/distribute/conftrace/domain/createDomain', params)
}

function deleteDomain(params: DistributionParams<{ domainId: string; domainName: string }>) {
  return http.delete<DistributionResponse>('/distribute/conftrace/domain/deleteDomain', params)
}

function addHost(
  params: DistributionParams<{ domainName: string; hostInfos: { ipv6: string; ip: string; hostId: string }[] }>,
) {
  return http.post<DistributionResponse>('/distribute/conftrace/host/addHost', params)
}

function deleteDomainHosts(params: DistributionParams<{ domainName: string; hostInfos: { hostId: string }[] }>) {
  return http.delete<DistributionResponse>('/distribute/conftrace/host/deleteHost', params)
}

function addDomainConfig(
  params: DistributionParams<{
    domainName: string
    confFiles: { filePath?: string; contents?: string; hostId?: number }[]
  }>,
) {
  return http.post<DistributionResponse>('/distribute/conftrace/management/addManagementConf', params)
}

function deleteDomainConfig(params: DistributionParams<{ domainName: string; confFiles: { filePath: string }[] }>) {
  return http.delete('/distribute/conftrace/management/deleteManagementConf', params)
}

function uploadDomainConfig(params: FormData) {
  return http.post('/distribute/conftrace/management/uploadManagementConf', params)
}

function queryConfsOperationTrace(
  params: Partial<PageNation & Sort & { domain_name: string; host_id: string; conf_name: string }>,
) {
  return http.post<{
    conf_trace_infos: ConfTrace[]
    total_count: number
    total_page: number
  }>('/conftrace/query', params)
}

function syncConfs(
  params: DistributionParams<{
    domainName: string
    syncList: { hostId: string; syncConfigs: { hostId: string; syncConfigs: string[] }[] }[]
  }>,
) {
  return http.post<DistributionResponse>('/distribute/conftrace/confs/syncConf', params)
}

function syncConfsBatchly(params: DistributionParams<{ domainName: string; hostIds: string[] }>) {
  return http.post<DistributionResponse>('/distribute/conftrace/confs/batch/syncConf', params)
}

function getDomainRealConf(params: DistributionParams<{ domainName: string; hostIds: { hostId: string }[] }>) {
  return http.post<DistributionResponse<DomainConf[]>>('/distribute/conftrace/confs/queryRealConfs', params)
}

function getDomainConfLog(params: DistributionParams<{ domainName: string; confFiles: { filePath: string }[] }>) {
  return http.post<
    DistributionResponse<{
      domainName: string
      confBaseInfos: ConfBaseInfo[]
    }>
  >('/distribute/conftrace/management/queryManageConfChange', params)
}

function getDomainStatus(params: DistributionParams<{ domainName: string; ip: string }>) {
  return http.post<
    DistributionResponse<{
      domainName: string
      hostStatus: {
        hostId: string
        syncStatus: {
          file_path: string
          isSynced: string
        }[]
      }[]
    }>
  >('/distribute/conftrace/confs/getDomainStatus', params)
}

function queryDomainStatistics() {
  return http.get<{
    domain_sync_rate: number
    no_sync_domain_count: number
  }>('/conftrace/domain/statistics')
}

function queryChangeRecord(params: Partial<PageNation & Sort & { domain_name: string; host_ip: string }>) {
  return http.get<{
    conf_change_records: ConfChangeRecord[]
    total_count: number
    total_page: number
  }>('/conftrace/conf/change/record', { params })
}

function batchSyncConfs(params: { aiReqParams: { domainName: string; hostIds: string[] }[] }) {
  return http.post('/conftrace/ai/confs/batch/syncConf', params)
}
// #endregion

export * from './types'

export const domainApi = {
  getDomains,
  getHostsInDomain,
  getDomainManagementConf,
  getDomainConfLog,
  addDomainConfig,
  deleteDomainConfig,
  getDomainSupportConfs,
  createDomain,
  deleteDomain,
  addHost,
  deleteDomainHosts,
  getDomainRealConf,
  uploadDomainConfig,
  getDomainStatus,
  syncConfs,
  getDomainSyncStatus,
  syncConfsBatchly,
  getNotExitedHostList,
  queryConfsOperationTrace,
  queryDomainStatistics,
  queryChangeRecord,
  batchSyncConfs,
}
