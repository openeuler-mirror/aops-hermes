import request from '@/vendor/ant-design-pro/utils/request';

const userApi = {
  bindAccount: '/manage/account/bindaccount',
  codeCheck: '/manage/account/gitee/login?code=',
  LoginInGitee: '/manage/account/authredirecturl',
  register: '/manage/account/add',
  Login: '/manage/account/login',
  Logout: '/manage/logout',
  changePassword: '/manage/account/change',
  certificateKey: '/manage/account/certificate'
};

export function register(parameter) {
  return request({
    url: userApi.register,
    method: 'post',
    data: {
      username: parameter.username,
      password: parameter.password
    }
  });
}

export function bindAccount(parameter) {
  return request({
    url: userApi.bindAccount,
    method: 'post',
    data: {
      auth_account: parameter.auth_account,
      username: parameter.username,
      password: parameter.password
    }
  });
}

export function codeCheck(params) {
  return request({
    url: userApi.codeCheck + params,
    method: 'get',
    params: {
    }
  });
}

export function LoginInGitee() {
  return request({
    url: userApi.LoginInGitee,
    method: 'get',
    params: {
    }
  });
}

export function login(parameter) {
  return request({
    url: userApi.Login,
    method: 'post',
    data: {
      username: parameter.username,
      password: parameter.password
    }
  });
}

export function changePassword(parameter) {
  return request({
    url: userApi.changePassword,
    method: 'post',
    data: {
      password: parameter.password,
      old_password: parameter.old_password
    }
  });
}

export function certificateKey(parameter) {
  return request({
    url: userApi.certificateKey,
    method: 'post',
    data: {
      key: parameter.key
    }
  });
}

export function logout(parameter) {
  return request({
    url: userApi.Logout,
    method: 'post',
    data: parameter
  });
}
