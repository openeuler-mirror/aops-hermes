// ks文件管理
import request from '@/vendor/ant-design-pro/utils/request'

const api = {
  queryKickstartList: '/cobbler/queryKickstart', // 查询ks文件列表
  updateKickstart: '/cobbler/updateKickstart', // 更新ks文件列表
  addKickstart: '/cobbler/addKickstart', // 新增ks文件
  deleteKickstart: '/cobbler/deleteKickstart' // 删除ks文件
};
export default api;

export function queryKickstartList(param) {
  return request({
    url: api.queryKickstartList,
    method: 'post',
    data: {
      ks_name: param.ks_name
    }
  });
}

export function addKickstart(param) {
  return request({
    url: api.addKickstart,
    method: 'post',
    data: {
      ks_name: param.ksName,
      ks_content: param.ksContent
    }
  });
}

export function deleteKickstart(parameter) {
  return request({
    url: api.deleteKickstart,
    method: 'post',
    data: {
      ks_name: parameter.ks_name
    }
  });
}

export function updateKickstart(param) {
  return request({
    url: api.updateKickstart,
    method: 'post',
    data: {
      ks_name: param.ksName,
      ks_content: param.ksContent
    }
  });
}
