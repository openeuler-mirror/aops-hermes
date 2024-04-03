// 裸机管理
import request from '@/vendor/ant-design-pro/utils/request'

const api = {
  downloadTemplate: '/cobbler/getHostTemplateFile', // 批量添加裸机模板下载
  batchAddHost: '/cobbler/batchAddHost', // 批量添加裸机
  queryHosts: '/cobbler/queryHosts', // 裸机列表查询
  addHost: '/cobbler/addHost', // 添加裸机
  updateHost: '/cobbler/updateHost', // 更新主机
  deleteHost: '/cobbler/deleteHost', // 删除主机
  autoInstall: '/cobbler/autoInstall', // 一键装机
  downloadLogFile: '/cobbler/downloadLogFile' // 系统安装日志下载
};
export default api;

// 添加裸机
export function addHost(param) {
  return request({
    url: api.addHost,
    method: 'post',
    data: {
      host_name: param.host_name,
      host_mac: param.host_mac,
      bmc_ip: param.bmc_ip,
      bmc_user_name: param.bmc_user_name,
      bmc_passwd: param.bmc_user_passwd
    }
  });
}

// 批量添加主机
export function batchAddHost(params) {
  return request({
    url: api.batchAddHost,
    method: 'post',
    data: {
      host_list: params
    }
  });
}

// 查询主机列表
export function queryHosts(params) {
  return request({
    url: api.queryHosts,
    method: 'post',
    data: {
      host_name: params.host_name || '',
      bmc_ip: params.bmc_ip || '',
      page_no: params.current,
      page_size: params.pageSize
    }
  });
}

// 更新主机
export function updateHost(params) {
  return request({
    url: api.updateHost,
    method: 'post',
    data: {
      host_id: params.hostId,
      host_name: params.host_name,
      host_mac: params.host_mac,
      bmc_ip: params.bmc_ip,
      bmc_user_name: params.bmc_user_name,
      bmc_passwd: params.bmc_user_passwd,
      status: params.status || 0
    }
  });
}

// 删除主机
export function deleteHost(params) {
  return request({
    url: api.deleteHost,
    method: 'post',
    data: {
      host_list: params
    }
  });
}

// 下载批量添加主机模板
export function downLoadTemplate() {
  return request({
    url: api.downloadTemplate,
    method: 'get',
    params: {
    }
  });
}

// 一键装机
export function autoInstall(param) {
  return request({
    url: api.autoInstall,
    method: 'post',
    data: {
      host_list: param.hostList,
      ks_name: param.ksName,
      iso_name: param.ISOName,
      arch: param.arch,
      script_name: param.scriptName,
      install_rpm: param.installRpm
    }
  });
}

// 系统安装日志下载
export function downLoadLogFile(param) {
  return request({
    url: api.downloadLogFile,
    method: 'post',
    responseType: 'blob',
    data: {
      log_file_name: param.log_file_name
    }
  });
}
