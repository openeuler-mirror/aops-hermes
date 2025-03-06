export interface RecordItem {
  conversation_id: string
  title: string
  created_time: string
  doc_count: number
}

export interface RecordConversationItem {
  id: string
  content: {
    question: string
    answer: string
    data: unknown
  }
  conversation_id: string
  created_at: number
  group_id: string
  question: string
  task_id: string
  metadata: unknown
}

export interface Plugin {
  id: string
  name: string
  description: string
  auth: any
}

export interface CveSummary {
  critical_num: number
  high_num: number
  medium_num: number
  low_num: number
  unknown_num: number
}

export interface ClusterCveStatus {
  cluster_id: string
  cluster_name: string
  fixed_cve_num: number
  unfixed_cve_num: number
}

export interface ClusterCve {
  cluster_id: string
  cluster_name: string
  cve_num: number
  hot_patch_num: number
}

export type Severity = 'Low' | 'Medium' | 'High' | 'Critical' | 'Unknown'
export interface RecommendSummary {
  cluster_cve_num: ClusterCve[]
  packages: string[]
  recommend_cve_num: number
  recommend_cves: string[]
  severity_proportion?: {
    num: number
    severity: Severity
  }[]
}
export interface HostSummary {
  cluster_summary: {
    cluster_num: number
    host_group_num: number
    host_num: number
    online_host_num: number
    offline_host_num: number
    cluster_cve_status: ClusterCveStatus[]
  }
  cve_summary: CveSummary
}

export interface Rpm {
  available_rpm: string
  installed_rpm: string
  support_way: string
  host_num: number
}

export interface Cve {
  cve_id: string
  cvss_score: string
  description: string
  package: string
  publish_time: string
  severity: string
  rpms?: Rpm[]
}

export interface RecommendedData {
  recommend_cves: string[]
  recommend_cve_num: number
  packages: string[]
  severity_proportion: { num: number; severity: string }[]
}

export interface UnfixedRpm {
  cve_id?: string
  available_rpm: string
  installed_rpm: string
  host_num: number
  support_way: string
  status?: string
}

export interface TaskDetail {
  accept: string
  cluster_id: string
  cluster_name: string
  description: string
  host_num: number
  latest_execute_time: string | null
  takeover: boolean
  task_name: string
  task_type: string
}

export interface TaskReport {
  task_id: string
  task_type: string
  host_id: string
  latest_execute_time: number
}

export interface CveTaskResult {
  check_items: { item: string; result: boolean }[]
  rpms: { available_rpm: string; result: string; log: string }[]
}

export interface CveTaskReport extends TaskReport {
  host_ip: string
  host_name: string
  status: string
  task_result: CveTaskResult
}

export interface HostInCve {
  package: string
  hosts: {
    host_id: string
    host_ip: string
    hotpatch?: boolean
    host_name: string
    cluster_id: string
    cluster_name: string
  }[]
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

export interface DomainConf {
  confBaseInfos: RealConfFile[]
  domainName: string
  hostID: string
}

export type Direction = 'asc' | 'desc'
export interface PageNation {
  page: number
  per_page: number
}
export interface Sort {
  direction: Direction
  sort: string
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

export interface ConfTrace {
  UUID: string
  domain_name: string
  host_id: string
  conf_name: string
  info: string
  create_time: string
  ptrace: string
}
