import axios from 'axios'
import { ElMessage } from 'element-plus'
import type { ApiResponse } from '@/types/user'

const request = axios.create({
  baseURL: 'https://web-production-36c2e.up.railway.app/api',
  timeout: 30000,
})

// 请求拦截器：注入 token
request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// 响应拦截器：统一解包 & 错误提示
request.interceptors.response.use(
  (response) => {
    // 二进制响应（导出/下载模板）直接返回，不做 JSON 解包
    if (response.config.responseType === 'blob') {
      return response
    }
    const res = response.data as ApiResponse
    if (res.code !== 200) {
      ElMessage.error(res.message || '请求失败')
      return Promise.reject(new Error(res.message))
    }
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('username')
      // 不在登录页才跳转，避免死循环
      if (window.location.hash !== '#/login' && window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
      return Promise.reject(error)
    }
    const msg = error.response?.data?.message || error.message || '网络错误'
    ElMessage.error(msg)
    return Promise.reject(error)
  },
)

export default request