import request from './request'
import type { ApiResponse } from '@/types/user'

export interface LoginResult {
  token: string
  username: string
}

/** 注册 */
export function register(data: { username: string; password: string }) {
  return request.post<ApiResponse<null>>('/auth/register', data)
}

/** 登录 */
export function login(data: { username: string; password: string }) {
  return request.post<ApiResponse<LoginResult>>('/auth/login', data)
}

/** 退出登录 */

export function logout() {
  return request.post<ApiResponse<null>>('/auth/logout')
}