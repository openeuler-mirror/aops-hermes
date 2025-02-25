import Cves from '../pages/display/Cves.vue'
import TaskDetail from '../pages/display/TaskDetail.vue'
import Domain from '../pages/display/Domain.vue'
import ConfRecord from '../pages/display/ConfRecord.vue'

const FLOW_COMPONENT_MAP = {
  query_cve_recommend: {
    key: 'query_cve_recommend',
    plugin_id: 'aops-apollo',
    description: '查看推荐修复的CVE安全漏洞',
    label: '漏洞',
    params: {
      min_score: 9,
      fixed: 'false',
    },
    componentKey: 'cves',
    component: Cves,
    nextFlow: 'fix_cve',
  },
  query_cve_hotpatch: {
    key: 'query_cve_hotpatch',
    plugin_id: 'aops-apollo',
    description: '查看推荐修复的热补丁',
    label: '漏洞',
    params: {
      hot_patch: 'true',
      fixed: 'false',
    },
    componentKey: 'cves',
    component: Cves,
    nextFlow: 'fix_cve',
  },
  query_cve_topscore: {
    key: 'query_cve_topscore',
    plugin_id: 'aops-apollo',
    description: '查看高分cve',
    label: '漏洞',
    params: {
      min_score: 9,
      fixed: 'false',
    },
    componentKey: 'cves',
    component: Cves,
    nextFlow: 'fix_cve',
  },
  query_cve_unfix: {
    key: 'query_cve_unfix',
    plugin_id: 'aops-apollo',
    description: '查看未修复的cve',
    label: '漏洞',
    params: {
      fixed: 'false',
    },
    componentKey: 'cves',
    component: Cves,
    nextFlow: 'fix_cve',
  },
  fix_cve: {
    key: 'fix_cve',
    plugin_id: 'aops-apollo',
    label: '任务详情',
    componentKey: 'taskDetail',
    component: TaskDetail,
  },
  query_conf_unsync_host: {
    key: 'query_conf_unsync_host',
    plugin_id: 'aops-apollo',
    label: '业务域',
    componentKey: 'domain',
    component: Domain,
    params: {
      sync_status: 0,
    },
    nextFlow: 'host_batch_sync_conf',
  },
  host_batch_sync_conf: {
    key: 'host_batch_sync_conf',
    plugin_id: 'aops-apollo',
    label: '业务域同步结果',
    componentKey: 'syncResult',
    component: Domain,
  },
  query_conf_record: {
    key: 'query_conf_record',
    plugin_id: 'aops-apollo',
    label: '配置变更记录',
    componentKey: 'confRecord',
    component: ConfRecord,
    params: {
      page: 1,
      per_page: 40,
    },
  },
}

const FLOW_CUSTOM_CONTENT = {
  query_cve_recommend: `<div class="step">
                          <div class="step-item">
                            <span class="step-num">1</span>
                            使用热补丁修复CVE
                          </div>
                          <div class="step-item">
                            <span class="step-num">2</span>
                            使用冷补丁修复CVSS分数高于9分的CVE
                          </div>
                        </div>
                        <button operate="execute" desc="创建并执行cve修复任务" class="execute-button">
                          执行
                        </button>
                        `,
  query_cve_hotpatch: `<div class="step">
                          <div class="step-item">
                            <span class="step-num">1</span>
                            使用热补丁修复CVE
                          </div>
                        </div>
                        <button operate="execute" desc="创建并执行cve修复任务" class="execute-button">
                          执行
                        </button>`,
  query_cve_topscore: `<div class="step">
                          <div class="step-item">
                            <span class="step-num">1</span>
                            使用热补丁修复CVE
                          </div>
                          <div class="step-item">
                            <span class="step-num">2</span>
                            使用冷补丁修复CVSS分数高于9分的CVE
                          </div>
                        </div>
                        <button operate="execute" desc="创建并执行cve修复任务" class="execute-button">
                          执行
                        </button>`,
  query_cve_unfix: `<div class="step">
                          <div class="step-item">
                            <span class="step-num">1</span>
                            使用热补丁修复CVE
                          </div>
                          <div class="step-item">
                            <span class="step-num">2</span>
                            使用冷补丁修复CVE
                          </div>
                        </div>
                        <button operate="execute" desc="创建并执行cve修复任务" class="execute-button">
                          执行
                        </button>
                        `,
  query_conf_unsync_host: `
                        <button operate="execute" desc="同步主机配置" class="execute-button">
                          同步
                        </button>
                        `,
}

export { FLOW_COMPONENT_MAP, FLOW_CUSTOM_CONTENT }
