import request from '@/vendor/ant-design-pro/utils/request';

const api = {
  domainList: '/domain/queryDomain', // 获取域信息列表
  createDomain: '/domain/createDomain', // 新建业务域
  deleteDomain: '/domain/deleteDomain', // 删除业务域
  domainHostList: '/host/getHost', // 获取业务域主机列表
  deleteHost: '/host/deleteHost', // 删除业务域主机
  addHost: '/host/addHost', // 添加业务域主机
  domainStatus: '/confs/getDomainStatus', // 获取业务域主机同步状态
  syncConf: '/confs/syncConf', // 获取业务域主机同步状态
  batchSyncConf: '/confs/batch/syncConf', // 将当前业务域的配置批量同步到各主机
  queryRealConfs: '/confs/queryRealConfs', // 获取主机当前配置
  queryExpectedConfs: '/confs/queryExpectedConfs', // 获取主机配置日志
  queryHostAndStatus: '/manage/host/sync/status/get', // 获取业务域下的主机及其同步状态
  queryConfTraceInfos: '/conftrace/query' // 获取业务域下单个主机的单个配置文件监控记录
};

export default api;

// 主机管理
export function domainList(parameter) {
  return request({
    url: api.domainList,
    method: 'post',
    parameter
  });
}

// 业务域主机列表
export function domainHostList(domainName, ...parameter) {
  return request({
    url: api.domainHostList,
    method: 'post',
    data: {
      ...parameter,
      domainName: domainName
    }
  });
}
export function addHost(domainName, hostInfos, ...parameter) {
  return request({
    url: api.addHost,
    method: 'post',
    data: {
      ...parameter,
      domainName: domainName,
      hostInfos: hostInfos
    }
  });
}
// 获取业务域主机同步状态
export function domainStatus(domainName, hostIp) {
  return request({
    url: api.domainStatus,
    method: 'post',
    data: {
      domainName: domainName,
      ip: hostIp
    }
  });
}
// 新建业务域
export function createDomain(domainInfo, ...parameter) {
  return request({
    url: api.createDomain,
    method: 'post',
    data: domainInfo
  });
}
// 删除业务域
export function deleteDomain({domainName, ...parameter}) {
  return request({
    url: api.deleteDomain,
    method: 'delete',
    data: {
      domainName: domainName
    }
  });
}
// 删除业务域主机
export function deleteHost({domainName, hostInfos, ...parameter}) {
  return request({
    url: api.deleteHost,
    method: 'delete',
    data: {
      domainName: domainName,
      hostInfos: hostInfos
    }
  });
}
// 同步
export function syncConf(parameter) {
  return request({
    url: api.syncConf,
    method: 'put',
    data: {
      domainName: parameter.domainName,
      syncList: parameter.syncList
    },
    timeout: 900000
  });
}
// 获取主机当前配置
export function queryRealConfs({domainName, hostIds, ...parameter}) {
  return request({
    url: api.queryRealConfs,
    method: 'post',
    data: {
      domainName: domainName,
      hostIds: hostIds
    }
  });
}
// 获取主机配置日志
export function queryExpectedConfs(domainName, hostIds, ...parameter) {
  return request({
    url: api.queryExpectedConfs,
    method: 'get',
    data: {
      ...parameter,
      domainName: domainName,
      hostIds: hostIds
    }
  });
}

// 获取业务域下的主机及其同步状态
export function queryHostAndStatus(domainName) {
  return request({
    url: api.queryHostAndStatus,
    method: 'post',
    data: {
      domain_name: domainName
    }
  });
}

// 将当前业务域的配置批量同步到各主机
export function batchSyncConf(domainName, hostIds) {
  return request({
    url: api.batchSyncConf,
    method: 'put',
    data: {
      domainName: domainName,
      hostIds: hostIds
    }
  });
}

// 获取业务域下单个hostId的单个文件监控记录
export function queryConfTraceInfos(parameter) {
  return request({
    url: api.queryConfTraceInfos,
    method: 'post',
    data: {
      domain_name: parameter.domainName,
      host_id: parameter.hostId,
      conf_name: parameter.confName,
      sort: 'create_time',
      direction: 'desc',
      page: parameter.page || 1,
      per_page: parameter.per_page || 10
    }
  });
}
