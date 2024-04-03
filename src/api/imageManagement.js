// 镜像管理
import request from '@/vendor/ant-design-pro/utils/request'

const api = {
  imageList: '/cobbler/queryISO', // 查询镜像列表
  deleteImage: '/cobbler/deleteISO', // 删除镜像
  uploadImage: '/cobbler/uploadISO' // 上传镜像
};
export default api;

export function imageList() {
  return request({
    url: api.imageList,
    method: 'get',
    data: {}
  });
}

export function uploadImage(file) {
  return request({
    url: api.uploadImage,
    method: 'post',
    data: file,
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    timeout: 1800000
  });
}

export function deleteImage(parameter) {
  return request({
    url: api.deleteImage,
    method: 'post',
    data: {
      iso_name: parameter.iso_name,
      arch: parameter.arch
    }
  });
}
