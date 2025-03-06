// Copyright (c) Huawei Technologies Co., Ltd. 2023-2024. All rights reserved.
// licensed under the Mulan PSL v2.
// You can use this software according to the terms and conditions of the Mulan PSL v2.
// You may obtain a copy of Mulan PSL v2 at:
//      http://license.coscl.org.cn/MulanPSL2
// THIS SOFTWARE IS PROVIDED ON AN 'AS IS' BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT, MERCHANTABILITY OR FIT FOR A PARTICULAR
// PURPOSE.
// See the Mulan PSL v2 for more details.
import { http } from './request'
import type {
  HostSummary,
  Cve,
  RecommendedData,
  UnfixedRpm,
  TaskDetail,
  CveTaskReport,
  HostInCve,
  ConfFile,
  DomainConf,
  PageNation,
  Sort,
  ConfChangeRecord,
  ConfTrace,
} from './types'

export async function queryHostSummaryInfo() {
  return http.get<HostSummary>('/vulnerabilities/cves/summary')
}

export async function queryCves(
  page: number,
  pageSize: number,
  filter: {
    fixed: boolean
    cluster_id?: string
    severity?: string
    min_score?: number
    max_score?: number
    hot_patch?: boolean
  },
) {
  return http.get<{
    cve_info: Cve[]
    total_count: number
    total_page: number
  }>('/vulnerabilities/cves', {
    params: { page, per_page: pageSize, filter },
  })
}

export async function queryHighRiskCves() {
  return http.get<RecommendedData>('/vulnerabilities/cves/recommended')
}

export async function queryUnfixedRpm(params: { cve_id: string; host_ids: string[] }) {
  return http.post<UnfixedRpm[]>('/vulnerabilities/cve/unfixed/packages/get', params)
}

export async function queryTaskDetail(taskId: string) {
  return http.get<TaskDetail>('vulnerabilities/task/info/get', { params: { task_id: taskId } })
}

export async function queryTaskExecuteStatus(taskId: string) {
  return http.post<{
    result: Record<string, { succeed: number; fail: number; unknown: number; running: number }>
  }>('/vulnerabilities/task/progress/get', { task_list: [taskId] })
}

export async function queryCveFixInfo(taskId: string, page?: number, pageSize?: number) {
  return http.post<{
    result: {
      host_id: string
      host_ip: string
      host_name: string
      cve_num: number
      status: string
    }[]
    total: number
    total_page: number
  }>('/vulnerabilities/task/cve-fix/info/get', { page, per_page: pageSize, task_id: taskId })
}

export async function queryTaskResult(taskId: string) {
  return http.post<CveTaskReport[]>('/vulnerabilities/task/cve-fix/result/get', { task_id: taskId })
}

export async function queryHostsInCves(params: {
  cve_list: {
    cve_id: string
    rpms: { available_rpm: string; fix_way: string; installed_rpm: string }[]
  }[]
  fixed: boolean
  host_list?: string[]
}) {
  return http.post<Record<string, HostInCve>>('/vulnerabilities/cve/task/host/get', params)
}

export async function generateCveFixTask(params: {
  task_name: string
  accepted: boolean
  takeover: boolean
  description: string
  check_items: string[]
  info: {
    cve_id: string
    host_info: {
      host_id: string
    }[]
    rpms: any[]
  }[]
}) {
  return http.post<{ fix_way: 'coldpatch' | 'hotpatch'; task_id: string }[]>(
    '/vulnerabilities/task/cve-fix/generate',
    params,
  )
}

export async function executeTask(taskId: string) {
  return http.post('/vulnerabilities/task/execute', { task_id: taskId })
}

export async function queryRealConf(params: { domainName: string; hostIds: { hostId: string }[] }) {
  return http.post<DomainConf[]>(`/conftrace/confs/queryRealConfs`, params)
}

export async function queryBaseConf(domainName: string) {
  return http.post<{
    domainName: string
    confFiles: ConfFile[]
  }>(`/conftrace/management/getManagementConf`, { domainName })
}

export async function queryDomainSyncStatus() {
  return http.get<{
    domain_sync_rate: number
    no_sync_domain_count: number
    sync_domain_count: number
  }>('/conftrace/domain/statistics')
}

export function queryChangeRecord(params: Partial<PageNation & Sort & { domain_name: string; host_ip: string }>) {
  return http.get<{
    conf_change_records: ConfChangeRecord[]
    total_count: number
    total_page: number
  }>('/conftrace/conf/change/record', { params })
}

export function queryConfsOperationTrace(
  params: Partial<PageNation & Sort & { domain_name: string; host_id: string; conf_name: string }>,
) {
  return http.post<{
    conf_trace_infos: ConfTrace[]
    total_count: number
    total_page: number
  }>('/conftrace/query', params)
}
