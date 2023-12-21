/**
 * @file: 将axios对象封装为request对象供全局调用。同时配置拦截器功能
 */

import axios from 'axios';
import store from '@/store';
import notification from 'ant-design-vue/es/notification';
import {VueAxios} from './axios';

// 全局声明缓存变量
var timestamp1;
var isRefreshing = false;

let subscribers = [];
// 刷新 token 后, 将缓存的接口重新请求一次
function onAccessTokenFetched(newToken) {
  subscribers.forEach((callback) => {
    callback(newToken);
  });
  // 清空缓存接口
  subscribers = [];
}
// 添加缓存接口
function addSubscriber(callback) {
  subscribers.push(callback);
}

const errorMsgs = {
  noResponse: 'request failed, no response'
};

// 创建 axios 实例
const request = axios.create({
  // API 请求的默认前缀
  baseURL: process.env.VUE_APP_API_BASE_URL,
  timeout: 600000 // 请求超时时间
});

// 异常拦截处理器
const errorHandler = (error) => {
  if (error.response) {
    const data = error.response.data;
    // 从 localstorage 获取 token
    const token = localStorage.getItem('Access-Token');
    if (error.response.status === '403') {
      notification.error({
        message: 'Forbidden',
        description: data.message
      });
    }
    if (error.response.status === '401' && !(data.result && data.result.isLogin)) {
      notification.error({
        message: 'Unauthorized',
        description: 'Authorization verification failed'
      });
      if (token) {
        store.dispatch('Logout').then(() => {
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        });
      }
    }
  } else {
    // 请求失败没有返回体时（如请求超时），添加默认错误信息
    error.response = {
      data: {
        msg: errorMsgs.noResponse
      }
    };
  }
  return Promise.reject(error);
};

// request interceptor
request.interceptors.request.use((config) => {
  // 如果 token 存在
  // 让每个请求携带自定义 token 请根据实际情况自行修改
  if (localStorage.getItem('Access-Token')) {
    const token = localStorage.getItem('Access-Token');
    config.headers['Access-Token'] = token;
    localStorage.setItem('aops_token', token);
    const userName = localStorage.getItem('user_name');
    userName && localStorage.setItem('user_name', userName);
  }
  if (
    config.url === '/vulnerability/cve/advisory/upload' ||
    config.url === '/vulnerability/cve/unaffected/upload' ||
    config.url === '/management/uploadManagementConf'
  ) {
    config.headers['Content-Type'] = 'application/x-www-form-urlencoded';
  } else {
    config.headers['Content-Type'] = 'application/json';
  }
  return config;
}, errorHandler);

// response interceptor
request.interceptors.response.use((response) => {
  // 这对业务域相关接口返回体做特殊处理，后续需要统一
  const code = response.data.code || response.status;
  // 不处理所有2xx的状态码
  if (!code.toString().match(/^2[0-9]{2,2}$/)) {
    // let err = null;
    switch (code) {
      case '1201':
        if (!timestamp1 || timestamp1 + 1632252465 < new Date().getTime()) {
          timestamp1 = new Date().getTime();
          notification.error({
            message: '用户校验失败',
            description: response.data.message
          });
          setTimeout(() => {
            store
              .dispatch('Logout')
              .then(() => {
                window.location.reload();
              })
              .catch((err) => {
                this.$message.error(err.response.message);
              });
          }, 1000);
        }
        break;
      case '1207':
        if (response.config.url === '/manage/account/refreshtoken') {
          // 当refreshtokne也过期，直接跳转到登录页面
          notification.error({
            message: '用户校验失败',
            description: response.data.message
          });
          setTimeout(() => {
            store
              .dispatch('Logout')
              .then(() => {
                isRefreshing = false;
                window.location.reload();
              })
              .catch((err) => {
                isRefreshing = false;
                this.$message.error(err.response.message);
              });
          }, 1000);
        } else {
          if (!isRefreshing) {
            isRefreshing = true;
            store
              .dispatch('RefreshToken')
              .then(() => {
                // 再发请求
                isRefreshing = false;
                onAccessTokenFetched(localStorage.getItem('Access-Token'));
              })
              .catch(() => {
                isRefreshing = false;
                window.location.reload();
              });
          }
        }
        const retryRequest = new Promise((resolve) => {
          addSubscriber((newToken) => {
            response.config.headers['Access-Token'] = newToken;
            response.config.url = response.config.url.replace(response.config.baseURL, '');
            resolve(request(response.config));
          });
        });
        return retryRequest;
      case '1108':
        notification.error({
          message: '暂无指标数据！',
          description: response.data.message
        });
        break;
      default:
        notification.error({
          message: response.data.label,
          description: response.data.message
        });
        return new Promise((resolve) => {
          resolve(null);
        });
      // err = new Error(response.data.message);
      // err.data = response.data.data;
      // err.response = response.data;
      // throw err;
    }
  }
  if (response.headers['content-type'] === 'application/octet-stream') {
    const fileName = response.headers['content-disposition']
      .split(';')[1]
      .split('=')[1]
      .replace(/^'/, '')
      .replace(/'$/, '');
    const downloadResponse = {
      data: response.data,
      fileName
    };
    return downloadResponse;
  }
  return response.data;
}, errorHandler);

const installer = {
  vm: {},
  install(Vue) {
    Vue.use(VueAxios, request);
  }
};

export default request;

export {installer as VueAxios, request as axios};
