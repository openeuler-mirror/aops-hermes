import type { MockMethod } from 'vite-plugin-mock';

const USER = ['admin', 'normal'];
const PASSWORD = ['changeme'];

export const accountMock: Array<MockMethod> = [
  {
    url: '/api/accounts/login',
    timeout: 200,
    method: 'post',
    response: ({ body }) => {
      if (USER.includes(body.username) && PASSWORD.includes(body.password)) {
        return {
          code: 200,
          data: {
            username: body.username,
            type: body.username === 'admin' ? 'administrator' : 'normal',
            token:
              'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE3MTMyNjczNDUsImV4cCI6MTcxMzI2ODU0NSwia2V5IjoiYWRtaW4iLCJjcmVhdGVfdGltZSI6WzIwMjQsNCwxNiwxOSwzNSw0NSwxLDEwNywwXX0.s2YP92eiu6tX23MMN4fLbefs2-YqHsKUhIuwdooMtmE',
            refresh_token:
              'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE3MTMyNjczNDUsImV4cCI6MTcxMzM1Mzc0NSwia2V5IjoiYWRtaW4iLCJjcmVhdGVfdGltZSI6WzIwMjQsNCwxNiwxOSwzNSw0NSwxLDEwNywwXX0.semO_RSOksezsWI3htmdmgF15WwiCtKFX6oOBhw2XJY',
          },
          label: 'Succeed',
          message: 'operation succeed',
        };
      } else {
        return {
          code: 1201,
          data: {},
          label: 'Login.Error',
          message: 'incorrect username or password',
        };
      }
    },
  },
  {
    url: '/api/accounts/refreshtoken',
    timeout: 200,
    method: 'post',
    response: () => {
      return {
        code: 200,
        data: {
          token: '111',
          refresh_token: '222',
        },
        label: 'Succeed',
        message: 'operation succeed',
      };
    },
  },
  {
    url: '/api/accounts/logout',
    timeout: 200,
    method: 'post',
    response: () => {
      return {
        code: 200,
        data: {},
        message: 'OK',
      };
    },
  },
];
