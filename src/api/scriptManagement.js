
import request from '@/vendor/ant-design-pro/utils/request'

const api = {
  scriptList: '/cobbler/queryScript', // 查询脚本列表
  deleteScript: '/cobbler/deleteScript', // 删除脚本
  uploadScript: '/cobbler/uploadScript' // 上传脚本
};
export function scriptList(param) {
  return request({
    url: api.scriptList,
    method: 'post',
    data: {
      script_name: param.script_name
    }
  });
}

export function uploadScript(file) {
  return request({
    url: api.uploadScript,
    method: 'post',
    data: file,
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    timeout: 1800000
  });
}

export function deleteScript(scriptName) {
  return request({
    url: api.deleteScript,
    method: 'post',
    data: {
      script_name: scriptName
    }
  });
}
