<script setup lang="ts">
import { ref, computed } from 'vue'
import VirtualList from '../components/VirtualList.vue'

const allData = Array.from({ length: 100000 }, (_, i) => ({
  id: i + 1,
  name: `Item ${i + 1}`,
  email: `user${i + 1}@example.com`,
  role: ['管理员', '编辑', '访客'][i % 3],
  status: i % 5 === 0 ? '禁用' : '启用',
}))

const selectedNums = computed(() => {
  void refreshKey.value
  return selectedIds.size
})

const selectedIds = new Set<number>()
const refreshKey = ref(0)

function triggerUI() {
  refreshKey.value++
}

function isChecked(id: number) {
  void refreshKey.value
  return selectedIds.has(id)
}

function toggleSelect(id: number) {
  if (selectedIds.has(id)) {
    selectedIds.delete(id)
  } else {
    selectedIds.add(id)
  }
  triggerUI()
}

function handleSelectAll() {
  selectedIds.clear()
  for (let i = 0; i < allData.length; i++) {
    selectedIds.add(allData[i].id)
  }
  triggerUI()
}

function handleClearAll() {
  selectedIds.clear()
  triggerUI()
}
</script>

<template>
  <div class="home">
    <div class="toolbar">
      <h1>用户列表（10万条）</h1>
      <div class="actions">
        <button @click="handleSelectAll">全选</button>
        <button @click="handleClearAll">清空</button>
        <span class="count">已选中: {{ selectedNums }} 条</span>
      </div>
    </div>

    <div class="table-header">
      <span class="col-check"></span>
      <span class="col-id">ID</span>
      <span class="col-name">姓名</span>
      <span class="col-email">邮箱</span>
      <span class="col-role">角色</span>
      <span class="col-status">状态</span>
    </div>

    <VirtualList :data="allData" :item-height="48">
      <template #default="{ row }">
        <div class="table-row" :class="{ selected: isChecked(row.id) }">
          <span class="col-check">
            <input
              type="checkbox"
              :checked="isChecked(row.id)"
              @change="toggleSelect(row.id)"
            />
          </span>
          <span class="col-id">{{ row.id }}</span>
          <span class="col-name">{{ row.name }}</span>
          <span class="col-email">{{ row.email }}</span>
          <span class="col-role">{{ row.role }}</span>
          <span class="col-status">
            <span class="tag" :class="row.status === '启用' ? 'tag--on' : 'tag--off'">
              {{ row.status }}
            </span>
          </span>
        </div>
      </template>
    </VirtualList>
  </div>
</template>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  height: 100%;
  box-sizing: border-box;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  flex-shrink: 0;
  border-bottom: 1px solid #ebeef5;
}

.toolbar h1 {
  font-size: 1.25rem;
  margin: 0;
}

.actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.actions button {
  padding: 6px 16px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
  font-size: 14px;
}

.actions button:hover {
  color: #409eff;
  border-color: #c6e2ff;
  background: #ecf5ff;
}

.count {
  color: #606266;
  font-size: 14px;
}

.table-header {
  display: flex;
  align-items: center;
  padding: 0 16px;
  height: 40px;
  flex-shrink: 0;
  background: #f5f7fa;
  border-bottom: 1px solid #ebeef5;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.table-row {
  display: flex;
  align-items: center;
  padding: 0 16px;
  border-bottom: 1px solid #ebeef5;
  font-size: 14px;
  height: 48px;
  box-sizing: border-box;
  background: #fff;
}

.table-row:hover {
  background: #f5f7fa;
}

.table-row.selected {
  background: #ecf5ff;
}

.col-check { width: 40px; flex-shrink: 0; }
.col-id { width: 80px; flex-shrink: 0; }
.col-name { width: 160px; flex-shrink: 0; }
.col-email { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.col-role { width: 100px; flex-shrink: 0; }
.col-status { width: 80px; flex-shrink: 0; }

.tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.tag--on {
  color: #67c23a;
  background: #f0f9eb;
}

.tag--off {
  color: #f56c6c;
  background: #fef0f0;
}
</style>