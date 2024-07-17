export interface LoginParams {
  username: string
  password: string
}
export interface RegisterParams {
  username: string
  password: string
  email: string
}
export interface RefreshTokenParams {
  refresh_token: string
}
export type Role = 'administrator' | 'normal'
