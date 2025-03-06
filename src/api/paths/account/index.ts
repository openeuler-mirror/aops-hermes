// Copyright (c) Huawei Technologies Co., Ltd. 2023-2024. All rights reserved.
// licensed under the Mulan PSL v2.
// You can use this software according to the terms and conditions of the Mulan PSL v2.
// You may obtain a copy of Mulan PSL v2 at:
//      http://license.coscl.org.cn/MulanPSL2
// THIS SOFTWARE IS PROVIDED ON AN 'AS IS' BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT, MERCHANTABILITY OR FIT FOR A PARTICULAR
// PURPOSE.
// See the Mulan PSL v2 for more details.
import type { LoginParams, RefreshTokenParams, RegisterParams, Role } from './types'
import { http } from '@/api/request'

/**
 * account login
 * @param params
 * {
 *   username: string
 *   password: string
 * }
 */
export function login(params: LoginParams) {
  return http.post<{
    username: string
    type: Role
    token: string
    refresh_token: string
  }>('/accounts/login', params)
}
/**
 * account register
 * @param params
 * {
 *   username: string
 *   password: string
 *   email: string
 * }
 */
function register(params: RegisterParams) {
  return http.post('/accounts/register', params)
}
function LoginInGitee() {
  return http.get<{
    gitee: string
  }>('/accounts/auth/redirecturl')
}

function giteeAuthorize(code: string) {
  return http.get<{
    username: string
    type?: Role
    token: string
    refresh_token: string
  }>('/accounts/gitee/login', { params: { code } })
}

function bindAccount(params: { auth_account: string; username: string; password: string }) {
  return http.post<{
    username: string
    type?: Role
    token: string
    refresh_token: string
  }>('/accounts/auth/bind', params)
}

/**
 * Account logout
 *
 * Logout the currently logged in account.
 *
 * @returns A Promise that resolves when the logout is complete.
 */
export function logout() {
  return http.get('/accounts/logout')
}

/**
 * Refresh the access token.
 *
 * @param params The parameters for refreshing the token.
 * @returns A Promise that resolves to an object containing the new
 * access token and refresh token.
 */
export function refreshToken(params: RefreshTokenParams) {
  return http.post<{
    token: string
    refresh_token: string
  }>('/accounts/refreshtoken', params)
}

function resetPassword(username: string) {
  return http.post('/accounts/password', { username })
}

function changePassword(username: string, oldPassword: string, password: string) {
  return http.put('/accounts/password', { username, password, old_password: oldPassword })
}

function queryTokenByAuthCode(code: string) {
  return http.post<{
    token: string
    username: string
    type: string
  }>('/accounts/login', { code })
}

function logoutAssistant() {
  return http.get('/api/auth/logout')
}

function refreshAuthToken() {
  return http.get<{
    token: string
  }>('/accounts/refreshtoken')
}

function queryAuthRedirectUrl() {
  return http.get<string>('/accounts/authorize-uri')
}

export * from './types'
export const accountApi = {
  login,
  register,
  LoginInGitee,
  logout,
  refreshToken,
  resetPassword,
  changePassword,
  giteeAuthorize,
  bindAccount,
  queryTokenByAuthCode,
  refreshAuthToken,
  queryAuthRedirectUrl,
  logoutAssistant,
}
