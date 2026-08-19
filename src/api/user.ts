import request from './request'
import type { ApiResponse, PageResult, User, UserQueryParams, ImportProgress } from '@/types/user'

/** 分页查询用户 */
export function getUsers(params: UserQueryParams) {
  return request.get<ApiResponse<PageResult<User>>>('/users', { params })
}

/** 添加用户 */
export function addUser(data: { name: string; age: number; email: string }) {
  return request.post<ApiResponse<string>>('/users/add', data)
}

/** 修改用户 */
export function updateUser(data: { id: number; name: string; age: number; email: string }) {
  return request.put<ApiResponse<string>>('/users/update', data)
}

/** 删除用户（逻辑删除） */
export function deleteUser(id: number) {
  return request.delete<ApiResponse<string>>(`/users/delete/${id}`)
}

/** 恢复用户 */
export function recoverUser(id: number) {
  return request.put<ApiResponse<null>>(`/users/recover/${id}`)
}

/** 导入用户（Excel），返回 taskId */
export function importUsers(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  return request.post<ApiResponse<string>>('/users/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

/** 查询导入进度 */
export function getImportProgress(taskId: string) {
  return request.get<ApiResponse<ImportProgress>>(`/users/import/progress/${taskId}`)
}

/** 导出用户（Excel） */
export function exportUsers(name?: string) {
  return request.get<Blob>('/users/export', {
    params: name ? { name } : undefined,
    responseType: 'blob',
  })
}

/** 下载导入模板 */
export function downloadTemplate() {
  return request.get<Blob>('/users/export/template', {
    responseType: 'blob',
  })
}

/** 触发文件下载 */
export function downloadBlob(data: Blob, filename: string) {
  const url = URL.createObjectURL(data)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}