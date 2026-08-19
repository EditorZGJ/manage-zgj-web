import axios from 'axios'
import { ElMessage } from 'element-plus'
import type { ApiResponse } from '@/types/user'

const request = axios.create({
  baseURL: 'https://web-production-36c2e.up.railway.app',
  timeout: 30000,
})

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
    const msg = error.response?.data?.message || error.message || '网络错误'
    ElMessage.error(msg)
    return Promise.reject(error)
  },
)

export default request