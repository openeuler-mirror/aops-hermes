/**
 * @file 缺陷管理模块-api请求对象.缺陷模块的所有请求通过本文件中的各个封装函数进行调用，函数运行后返回promise对象
 */

import request from '@/vendor/ant-design-pro/utils/request';
// import { getNotEmptyObjectOrNull } from '@/vendor/ant-design-pro/utils/util';

const api = {
  getCveOverview: '/vulnerability/cve/overview',
  getCveList: '/vulnerability/cve/list/get',
  getCveInfo: '/vulnerability/cve/info/get',
  setCveStatus: '/vulnerability/cve/status/set',
  getHostUnderCVE: '/vulnerability/cve/host/get',
  getHostUnderMultipleCVE: '/vulnerability/cve/task/host/get',
  getHostLeakList: '/vulnerability/host/list/get',
  getHostInfo: '/vulnerability/host/info/get',
  scanHost: '/vulnerability/host/scan',
  getHostScanStatus: '/vulnerability/host/status/get',
  getCveUnderHost: '/vulnerability/host/cve/get',
  addRepo: '/vulnerability/repo/import',
  getRepo: '/vulnerability/repo/get',
  deleteRepo: '/vulnerability/repo/delete',
  generateTask: '/vulnerability/task/cve-fix/generate',
  executeTask: '/vulnerability/task/execute',
  rollbackCveTask: '/vulnerability/task/cve/rollback', // 简单测试
  generateRepoTask: '/vulnerability/task/repo/generate',
  deleteTask: '/vulnerability/task/delete', // 因数据少未调试
  getTaskList: '/vulnerability/task/list/get',
  getTaskProgress: '/vulnerability/task/progress/get',
  getTaskInfo: '/vulnerability/task/info/get',
  getCveUnderCveTask: '/vulnerability/task/cve/info/get',
  getCveProgressUnderCveTask: '/vulnerability/task/cve/progress/get', // 文档里写的是GET方法
  getCveTaskResult: '/vulnerability/task/cve/result/get', // 不同cveid好像没什么区别
  getHostOfCveInCveTask: '/vulnerability/task/cve/status/get',
  getHostUnderRepoTask: '/vulnerability/task/repo/info/get',
  getRepoTaskResult: '/vulnerability/task/repo/result/get',
  getPlaybook: '/vulnerability/task/playbook/get',
  getRepoTemplate: '/vulnerability/repo/template/get',
  upload: '/vulnerability/cve/advisory/upload',
  reupload: '/vulnerability/cve/unaffected/upload',
  getCveExport: '/vulnerability/cve/info/export',
  generateRollbackTask: '/vulnerability/task/cve-rollback/generate',
  getCveUnfixRpm: '/vulnerability/cve/unfixed/packages/get', // 查询cve未修复的rpm包
  getCveFixRpm: '/vulnerability/cve/fixed/packages/get', // 查询cve已修复的rpm包
  getRpmUnderCve: '/vulnerability/cve/packages/host/get', // 查询cve影响的rpm包的主机列表
  getCvefixLeakRpm: '/vulnerability/task/cve/rpm/get', // 修复任务详情中cve列表的二级package
  getCveRpmHostUnderLeak: '/vulnerability/task/cve/rpm/host/get' // 查询修复任务下的cve影响的rpm包的主机列表
};

const sorterMap = {
  descend: 'desc',
  ascend: 'asc'
};

export default api;

export function getCveRpmHostUnderLeak(parameters) {
  return request({
    url: api.getCveRpmHostUnderLeak,
    method: 'post',
    data: {
      task_id: parameters.task_id,
      cve_id: parameters.cve_id,
      installed_rpm: parameters.installed_rpm,
      available_rpm: parameters.available_rpm
    }
  });
}

export function getCvefixLeakRpm(parameters) {
  return request({
    url: api.getCvefixLeakRpm,
    method: 'post',
    data: {
      task_id: parameters.task_id,
      cve_id: parameters.cve_id
    }
  });
}

export function getRpmUnderCve(parameters) {
  return request({
    url: api.getRpmUnderCve,
    method: 'post',
    data: {
      page: parameters.page,
      per_page: parameters.per_page,
      cve_id: parameters.cve_id,
      available_rpm: parameters.available_rpm === null ? undefined : parameters.available_rpm,
      installed_rpm: parameters.installed_rpm === null ? undefined : parameters.installed_rpm,
      direction: parameters.direction
    }
  });
}

export function getCveUnfixRpm(parameters) {
  return request({
    url: api.getCveUnfixRpm,
    method: 'post',
    data: {
      cve_id: parameters.cve_id,
      host_ids: parameters.host_ids
    }
  });
}

export function getCveFixRpm(parameters) {
  return request({
    url: api.getCveFixRpm,
    method: 'post',
    data: {
      cve_id: parameters.cve_id,
      host_ids: parameters.host_ids
    }
  });
}

export function generateRollbackTask(parameters) {
  return request({
    url: api.generateRollbackTask,
    method: 'post',
    data: {
      task_name: parameters.task_name,
      description: parameters.description,
      info: parameters.info || []
    }
  });
}

export function getCveExport(parameter) {
  return request({
    url: api.getCveExport,
    method: 'post',
    responseType: 'blob',
    data: {
      host_list: parameter
    },
    headers: { 'Content-Type': 'application/json;charset=utf-8' }
  });
}

export function upload(file) {
  return request({
    url: api.upload,
    method: 'post',
    data: file,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
}

export function reupload(file) {
  return request({
    url: api.reupload,
    method: 'post',
    data: file,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
}

export function getCveOverview(parameter) {
  return request({
    url: api.getCveOverview,
    method: 'get'
  });
}

export function getCveList({ tableInfo, ...parameter }) {
  return request({
    url: api.getCveList,
    method: 'post',
    data: {
      sort: sorterMap[tableInfo.sorter.order] ? tableInfo.sorter.field : undefined,
      direction: sorterMap[tableInfo.sorter.order],
      filter: {
        affected: tableInfo.affected,
        cve_id: tableInfo.filters.cveId,
        package: tableInfo.filters.package,
        severity: tableInfo.filters.severity || [],
        fixed: tableInfo.fixed
      },
      page: tableInfo.pagination.current,
      per_page: tableInfo.pagination.pageSize
    }
  });
}

export function getCveInfo(parameter) {
  return request({
    url: api.getCveInfo,
    method: 'get',
    params: {
      cve_id: parameter.cve_id
    }
  });
}

export function setCveStatus({ cveList, status }) {
  return request({
    url: api.setCveStatus,
    method: 'post',
    data: {
      cve_list: cveList || [],
      status: status
    }
  });
}

export function getHostUnderCVE({ tableInfo, ...parameter }) {
  return request({
    url: api.getHostUnderCVE,
    method: 'post',
    data: {
      cve_id: parameter.cve_id,
      sort: tableInfo.sorter.field,
      direction: sorterMap[tableInfo.sorter.order],
      filter: {
        fixed: tableInfo.fixed,
        host_name: tableInfo.filters.host_name === null ? undefined : tableInfo.filters.host_name,
        host_group: tableInfo.filters.host_group === null ? undefined : tableInfo.filters.host_group,
        repo: tableInfo.filters.repo === null ? undefined : tableInfo.filters.repo,
        last_scan: tableInfo.filters.last_scan
      },
      page: tableInfo.pagination.current,
      per_page: tableInfo.pagination.pageSize
    }
  });
}

export function getHostUnderMultipleCVE({ tableInfo, ...parameter }) {
  return request({
    url: api.getHostUnderMultipleCVE,
    method: 'post',
    data: {
      cve_list: parameter.cveList,
      fixed: parameter.fixed
    }
  });
}

export function getHostLeakList({ tableInfo, ...parameter }) {
  return request({
    url: api.getHostLeakList,
    method: 'post',
    data: {
      sort: tableInfo.sorter.field,
      direction: sorterMap[tableInfo.sorter.order],
      filter: {
        host_name: tableInfo.filters.host_name,
        host_group: tableInfo.filters.host_group,
        repo: tableInfo.filters.repo
      },
      page: tableInfo.pagination.current,
      per_page: tableInfo.pagination.pageSize
    }
  });
}

export function getHostInfo(parameter) {
  return request({
    url: api.getHostInfo,
    method: 'get',
    params: {
      host_id: parameter.host_id
    }
  });
}

export function scanHost(parameter) {
  return request({
    url: api.scanHost,
    method: 'post',
    data: {
      host_list: parameter.hostList,
      filter: parameter.filter === null ? {} : {
        host_name: parameter.filter.host_name === null ? undefined : parameter.filter.host_name,
        host_group: parameter.filter.host_group.length === 0 ? undefined : parameter.filter.host_group,
        repo: parameter.filter.repo.length === 0 ? undefined : parameter.filter.repo,
        last_scan: parameter.filter.last_scan
      }
    }
  });
}

export function getHostScanStatus(parameter) {
  return request({
    url: api.getHostScanStatus,
    method: 'post',
    data: {
      host_list: parameter.hostList
    }
  });
}

export function getCveUnderHost({ tableInfo, ...parameter }) {
  return request({
    url: api.getCveUnderHost,
    method: 'post',
    data: {
      host_id: parameter.host_id,
      sort: tableInfo.sorter.field,
      direction: sorterMap[tableInfo.sorter.order],
      filter: {
        cve_id: tableInfo.filters.cveId,
        affected: tableInfo.affected,
        fixed: tableInfo.fixed,
        severity: tableInfo.filters.severity || []
      },
      page: tableInfo.pagination.current,
      per_page: tableInfo.pagination.pageSize
    }
  });
}

export function addRepo({ repoName, repoData }) {
  return request({
    url: api.addRepo,
    method: 'post',
    data: {
      repo_name: repoName,
      repo_data: repoData
    }
  });
}

export function deleteRepo(parameters) {
  return request({
    url: api.deleteRepo,
    method: 'delete',
    data: {
      repo_name_list: parameters.repoNameList
    }
  });
}

export function getRepoList(repoIdList = []) {
  return request({
    url: api.getRepo,
    method: 'post',
    data: {
      repo_name_list: repoIdList
    }
  });
}

export function generateTask(parameters) {
  return request({
    url: api.generateTask,
    method: 'post',
    data: {
      task_name: parameters.task_name,
      description: parameters.task_desc,
      accepted: parameters.accepted,
      check_items: parameters.check_items,
      takeover: parameters.takeover,
      info: parameters.info || []
    }
  });
}

export function executeTask(parameters) {
  return request({
    url: api.executeTask,
    method: 'post',
    data: {
      task_id: parameters
    }
  });
}

export function generateRepoTask(parameters) {
  return request({
    url: api.generateRepoTask,
    method: 'post',
    data: {
      repo_name: parameters.repo,
      task_name: parameters.task_name,
      description: parameters.task_desc,
      info: parameters.info || []
    }
  });
}

export function deleteTask(parameters) {
  return request({
    url: api.deleteTask,
    method: 'delete',
    data: {
      task_list: parameters.taskList
    }
  });
}

export function getTaskList({ tableInfo, ...parameter }) {
  return request({
    url: api.getTaskList,
    method: 'post',
    data: {
      sort: tableInfo.sorter.field,
      direction: sorterMap[tableInfo.sorter.order],
      filter: {
        task_name: tableInfo.filters.taskName,
        task_type: tableInfo.filters.task_type
      },
      page: tableInfo.pagination.current,
      per_page: tableInfo.pagination.pageSize
    }
  });
}

export function getTaskProgress(parameters) {
  return request({
    url: api.getTaskProgress,
    method: 'post',
    data: {
      task_list: parameters.taskList
    }
  });
}

export function getTaskInfo(parameters) {
  return request({
    url: api.getTaskInfo,
    method: 'get',
    params: {
      task_id: parameters.taskId
    }
  });
}

export function getCveUnderCveTask({ tableInfo, ...parameters }) {
  const reboot = tableInfo.filters.reboot && tableInfo.filters.reboot[0];
  return request({
    url: api.getCveUnderCveTask,
    method: 'post',
    data: {
      task_id: parameters.taskId,
      sort: tableInfo.sorter.field,
      direction: sorterMap[tableInfo.sorter.order],
      filter: {
        cve_id: tableInfo.filters.cveId,
        reboot: reboot === 'true' ? true : reboot === 'false' ? false : undefined,
        status: tableInfo.filters.status
      },
      page: tableInfo.pagination.current,
      per_page: tableInfo.pagination.pageSize
    }
  });
}

export function getCveProgressUnderCveTask(parameters) {
  return request({
    url: api.getCveProgressUnderCveTask,
    method: 'post',
    data: {
      task_id: parameters.taskId,
      cve_list: parameters.cveList
    }
  });
}

export function getCveTaskResult(parameters) {
  return request({
    url: api.getCveTaskResult,
    method: 'post',
    data: {
      task_id: parameters.taskId,
      cve_list: parameters.cveList
    }
  });
}

export function rollbackCveTask(parameters) {
  return request({
    url: api.rollbackCveTask,
    method: 'post',
    data: {
      task_id: parameters.taskId,
      cve_list: parameters.cveList
    }
  });
}

export function getHostOfCveInCveTask({ tableInfo, ...parameters }) {
  return request({
    url: api.getHostOfCveInCveTask,
    method: 'post',
    data: {
      task_id: parameters.taskId,
      cve_list: parameters.cveList
    }
  });
}

export function getHostUnderRepoTask({ tableInfo, ...parameters }) {
  return request({
    url: api.getHostUnderRepoTask,
    method: 'post',
    data: {
      task_id: parameters.taskId,
      filter: {
        host_name: tableInfo.filters.host_name,
        status: tableInfo.filters.status
      },
      page: tableInfo.pagination.current,
      per_page: tableInfo.pagination.pageSize
    }
  });
}

export function getRepoTaskResult(parameters) {
  return request({
    url: api.getRepoTaskResult,
    method: 'post',
    data: {
      task_id: parameters.taskId,
      host_list: parameters.hostList
    }
  });
}

export function getPlaybook({ tableInfo, ...parameters }) {
  return request({
    url: api.getPlaybook,
    method: 'get',
    params: {
      task_id: parameters.taskId,
      task_type: parameters.taskType
    },
    responseType: 'blob'
  });
}

export function getRepoTemplate(parameters) {
  return request({
    url: api.getRepoTemplate,
    method: 'get'
  });
}
