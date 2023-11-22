/**
 * @file vuex仓库，用户信息模块
 */

// import storage from 'store';
// import cookie from 'js-cookie';
import {login, refreshTokenFn} from '@/api/login';
import {ACCESS_TOKEN, REFRESH_TOKIN} from '@/vendor/ant-design-pro/store/mutation-types';

const user = {
  state: {
    token: '',
    refreshToken: '',
    name: '',
    welcome: '',
    avatar: '',
    roles: [],
    info: {}
  },

  mutations: {
    SET_TOKEN: (state, token) => {
      state.token = token;
    },
    SET_RETOKEN: (state, refreshToken) => {
      state.refreshToken = refreshToken;
    },
    SET_NAME: (state, {name, welcome}) => {
      state.name = name;
      state.welcome = welcome;
    },
    SET_AVATAR: (state, avatar) => {
      state.avatar = avatar;
    },
    SET_ROLES: (state, roles) => {
      state.roles = roles;
    },
    SET_INFO: (state, info) => {
      state.info = info;
    }
  },

  actions: {
    // 用本地账号登
    Login({commit}, userInfo) {
      return new Promise((resolve, reject) => {
        login(userInfo)
          .then((response) => {
            if (response.code !== '200') {
              reject(response.message);
            }
            const result = response;
            localStorage.setItem(ACCESS_TOKEN, result.data.token);
            localStorage.setItem(REFRESH_TOKIN, result.data.refresh_token);
            localStorage.setItem('user_name', userInfo.username);
            commit('SET_TOKEN', result.data.token);
            commit('SET_RETOKEN', result.data.refresh_token);
            commit('SET_NAME', {name: userInfo.username});
            resolve();
          })
          .catch((error) => {
            reject(error);
          });
      });
    },

    // 用gitee账号登陆
    LoginInGitee({commit}, params) {
      localStorage.setItem(ACCESS_TOKEN, params.token);
      localStorage.setItem(REFRESH_TOKIN, params.refresh_token);
      localStorage.setItem('user_name', params.username);
      commit('SET_TOKEN', params.token);
      commit('SET_RETOKEN', params.refresh_token);
      commit('SET_NAME', {name: params.username});
    },

    // 获取用户信息
    GetInfo({commit}) {
      return new Promise((resolve, reject) => {
        try {
          // 暂时还没有userInfo的接口，跳过，使用空数据
          const userInfo = {};
          // role
          const roleObj = {};

          userInfo.role = roleObj;
          const response = {result: userInfo};
          const result = response.result;

          commit('SET_ROLES', [1]);
          commit('SET_INFO', result);

          resolve(response);
        } catch (err) {
          reject(err);
        }
      });
    },

    // 此action设置登录返回的用户名
    setUserName({commit}, userName) {
      commit('SET_NAME', {name: userName});
    },

    // 登出
    Logout({commit, state}) {
      // return new Promise((resolve, reject) => {
      //   logout()
      //     .then(() => {
      commit('SET_TOKEN', '');
      commit('SET_ROLES', []);
      commit('SET_RETOKEN', '');
      localStorage.removeItem(ACCESS_TOKEN);
      localStorage.removeItem(REFRESH_TOKIN);
      localStorage.removeItem('user_name');
      //       resolve();
      //     })
      //     .catch(error => {
      //       reject(error);
      //     })
      //     .finally(() => { });
      // });
    },

    // 刷新token
    RefreshToken({commit, state}) {
      return new Promise((resolve, reject) => {
        const refreshToken = localStorage.getItem('Refresh-Token');
        refreshTokenFn(refreshToken)
          .then((res) => {
            if (res.code === '200') {
              localStorage.removeItem(ACCESS_TOKEN);
              localStorage.removeItem(REFRESH_TOKIN);
              console.log(res.data.token);
              console.log(res.data.refresh_token);
              localStorage.setItem(ACCESS_TOKEN, res.data.token);
              localStorage.setItem(REFRESH_TOKIN, res.data.refresh_token);
              commit('SET_TOKEN', res.data.token);
              commit('SET_RETOKEN', res.data.refresh_token);
              resolve();
            } else if (res.code === '1207') {
              // 若返回1207则refresh_token也过期，直接退出到登录页
              // return new Promise((resolve, reject) => {
              //   logout()
              //     .then(() => {
              commit('SET_TOKEN', '');
              commit('SET_ROLES', []);
              commit('SET_RETOKEN', '');
              localStorage.removeItem(ACCESS_TOKEN);
              localStorage.removeItem(REFRESH_TOKIN);
              localStorage.removeItem('user_name');
              //       resolve();
              //     })
              //     .catch(error => {
              //       reject(error);
              //     })
              //     .finally(() => { });
              // });
            }
          })
          .catch((err) => {
            reject(err);
          })
          .finally(() => {});
      });
    }
  }
};

export default user;
