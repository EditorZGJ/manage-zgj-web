/** 用户信息 */
export interface User {
  id: number
  name: string
  age: number
  email: string
  createTime?: string
  updateTime?: string
}

/** 分页结果 */
export interface PageResult<T> {
  records: T[]
  total: number
  size: number
  current: number
  pages: number
}

/** 统一 API 响应格式 */
export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

/** 导入进度 */
export interface ImportProgress {
  total: number
  processed: number
  success: number
  failed: number
  done: boolean
}

/** 用户查询参数 */
export interface UserQueryParams {
  page: number
  size: number
  name?: string
}