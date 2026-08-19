import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { ElMessage } from 'element-plus'
import { login as loginApi, register as registerApi, logout as logoutApi } from '@/api/auth'
import type { LoginResult } from '@/api/auth'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || '')
  const username = ref(localStorage.getItem('username') || '')

  const isLoggedIn = computed(() => !!token.value)

  /** 登录 */
  async function login(loginUsername: string, password: string) {
    const res = await loginApi({ username: loginUsername, password })
    const data = res.data.data as LoginResult
    token.value = data.token
    username.value = data.username
    localStorage.setItem('token', data.token)
    localStorage.setItem('username', data.username)
    ElMessage.success('登录成功')
  }

  /** 注册 */
  async function register(regUsername: string, password: string) {
    await registerApi({ username: regUsername, password })
    ElMessage.success('注册成功')
  }

  /** 退出登录 */
  async function logout() {
    try {
      await logoutApi()
    } catch {
      // 即使 API 失败也清除本地状态
    }
    token.value = ''
    username.value = ''
    localStorage.removeItem('token')
    localStorage.removeItem('username')
  }

  return {
    token,
    username,
    isLoggedIn,
    login,
    register,
    logout,
  }
})