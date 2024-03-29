import request from '@/vendor/ant-design-pro/utils/request';

const api = {
  addManagementConf: '/management/addManagementConf', // 新增业务域配置
  getManagementConf: '/management/getManagementConf', // 读取业务域配置信息
  queryManageConfChange: '/management/queryManageConfChange', // 读取业务域配置日志信息
  deleteManagementConf: '/management/deleteManagementConf', // 删除业务域配置
  querySupportedConfs: '/confs/querySupportedConfs', // 查询可供选择的配置文件列表
  uploadManagementConf: '/management/uploadManagementConf' // 从本地导入文件 新增/更新配置
};

export default api;

// 新增配置
export function addManagementConf(data) {
  return request({
    url: api.addManagementConf,
    method: 'post',
    data: data
  });
}

// 配置管理
export function getManagementConf(data) {
  return request({
    url: api.getManagementConf,
    method: 'post',
    data: data
  });
}

// 配置管理日志
export function queryManageConfChange(data) {
  return request({
    url: api.queryManageConfChange,
    method: 'post',
    data: data
  });
}

// 删除配置
export function deleteManagementConf(parameter) {
  return request({
    url: api.deleteManagementConf,
    method: 'delete',
    data: {
      domainName: parameter.domainName,
      confFiles: parameter.confFiles
    }
  });
}

// 查询配置路径下拉列表
export function querySupportedConfs(parameter) {
  return request({
    url: api.querySupportedConfs,
    method: 'post',
    data: {
      domainName: parameter
    }
  });
}

export function uploadManagementConf(file) {
  return request({
    url: api.uploadManagementConf,
    method: 'post',
    data: file,
    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
  });
}
