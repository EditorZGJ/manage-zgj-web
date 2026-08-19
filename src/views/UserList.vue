<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { useAuthStore } from '@/stores/auth'
import { deleteUser, recoverUser, exportUsers, downloadTemplate, downloadBlob } from '@/api/user'
import UserDialog from '@/components/UserDialog.vue'
import UserImportDialog from '@/components/UserImportDialog.vue'
import type { User } from '@/types/user'

const userStore = useUserStore()
const authStore = useAuthStore()

// 搜索
const searchName = ref('')
function handleSearch() {
  userStore.setQueryParams({ name: searchName.value || undefined })
  userStore.resetPage()
  userStore.fetchUsers()
}

function handleReset() {
  searchName.value = ''
  userStore.setQueryParams({ name: undefined })
  userStore.resetPage()
  userStore.fetchUsers()
}

// 分页
function handlePageChange(page: number) {
  userStore.setQueryParams({ page })
  userStore.fetchUsers()
}

function handleSizeChange(size: number) {
  userStore.setQueryParams({ page: 1, size })
  userStore.fetchUsers()
}

// 新增 / 编辑弹窗
const dialogVisible = ref(false)
const editingUser = ref<User | null>(null)

function openAddDialog() {
  editingUser.value = null
  dialogVisible.value = true
}

function openEditDialog(user: User) {
  editingUser.value = user
  dialogVisible.value = true
}

function handleDialogSuccess() {
  userStore.fetchUsers()
}

// 删除
async function handleDelete(id: number) {
  try {
    await ElMessageBox.confirm('确定要删除该用户吗？（逻辑删除，可恢复）', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await deleteUser(id)
    ElMessage.success('删除成功')
    userStore.fetchUsers()
  } catch {
    // 取消则不操作
  }
}

// 恢复
async function handleRecover(id: number) {
  try {
    await recoverUser(id)
    ElMessage.success('恢复成功')
    userStore.fetchUsers()
  } catch {
    // 错误已在拦截器中处理
  }
}

// 显示已删除（开关）
const showDeleted = ref(false)
watch(showDeleted, () => {
  // 此处仅做 UI 展示，实际过滤由后端控制
  // 可根据 showDeleted 传递 extra 参数，API 暂未支持，预留
  userStore.fetchUsers()
})

// 导出
async function handleExport() {
  try {
    const now = new Date()
    const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`
    const res = await exportUsers(searchName.value || undefined)
    downloadBlob(res.data, `用户数据_${dateStr}.xlsx`)
    ElMessage.success('导出成功')
  } catch {
    // 错误已在拦截器中处理
  }
}

// 下载模板
async function handleDownloadTemplate() {
  try {
    const res = await downloadTemplate()
    downloadBlob(res.data, '导入模板.xlsx')
    ElMessage.success('模板下载成功')
  } catch {
    // 错误已在拦截器中处理
  }
}

// 导入弹窗
const importDialogVisible = ref(false)

function handleImportSuccess() {
  userStore.fetchUsers()
}

// 退出登录
async function handleLogout() {
  try {
    await authStore.logout()
    window.location.href = '/login'
  } catch {
    // 错误已在拦截器中提示，不退出
  }
}

// 格式化时间
function formatTime(time: string | undefined) {
  if (!time) return '-'
  return time.replace('T', ' ')
}

// 初始化
onMounted(() => {
  userStore.fetchUsers()
})
</script>

<template>
  <div class="user-list">
    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <el-input
          v-model="searchName"
          placeholder="按姓名搜索"
          clearable
          style="width: 220px"
          @keyup.enter="handleSearch"
        />
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>
      <div class="toolbar-right">
        <span class="user-info">欢迎，{{ authStore.username }}</span>
        <el-button type="primary" @click="openAddDialog">新增用户</el-button>
        <el-button @click="importDialogVisible = true">导入</el-button>
        <el-button @click="handleExport">导出</el-button>
        <el-button @click="handleDownloadTemplate">下载模板</el-button>
        <el-button type="danger" plain @click="handleLogout">退出登录</el-button>
      </div>
    </div>

    <!-- 表格 -->
    <el-table
      :data="userStore.users"
      v-loading="userStore.loading"
      border
      stripe
      style="width: 100%"
      height="calc(100vh - 200px)"
    >
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="姓名" width="150" />
      <el-table-column prop="age" label="年龄" width="80" />
      <el-table-column prop="email" label="邮箱" min-width="180" />
      <el-table-column label="创建时间" width="170">
        <template #default="{ row }">
          {{ formatTime(row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column label="更新时间" width="170">
        <template #default="{ row }">
          {{ formatTime(row.updateTime) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button size="small" type="primary" link @click="openEditDialog(row)">
            编辑
          </el-button>
          <el-button size="small" type="danger" link @click="handleDelete(row.id)">
            删除
          </el-button>
          <el-button size="small" type="success" link @click="handleRecover(row.id)">
            恢复
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-wrapper">
      <el-pagination
        v-model:current-page="userStore.queryParams.page"
        v-model:page-size="userStore.queryParams.size"
        :page-sizes="[10, 20, 50, 100]"
        :total="userStore.total"
        layout="total, sizes, prev, pager, next, jumper"
        background
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
      />
    </div>

    <!-- 新增 / 编辑弹窗 -->
    <UserDialog
      v-model:visible="dialogVisible"
      :user="editingUser"
      @success="handleDialogSuccess"
    />

    <!-- 导入弹窗 -->
    <UserImportDialog
      v-model:visible="importDialogVisible"
      @success="handleImportSuccess"
    />
  </div>
</template>

<style scoped>
.user-list {
  display: flex;
  flex-direction: column;
  height: 100%;
  box-sizing: border-box;
  padding: 16px;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  flex-shrink: 0;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-info {
  font-size: 14px;
  color: #606266;
  margin-right: 8px;
  white-space: nowrap;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  padding: 16px 0 0;
  flex-shrink: 0;
}
</style>