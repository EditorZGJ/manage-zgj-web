<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { importUsers, getImportProgress, downloadTemplate, downloadBlob } from '@/api/user'
import type { ImportProgress } from '@/types/user'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  success: []
}>()

const dialogVisible = ref(false)
watch(() => props.visible, (v) => { dialogVisible.value = v })
watch(dialogVisible, (v) => emit('update:visible', v))

// 文件上传状态
const uploading = ref(false)
const taskId = ref('')
const polling = ref(false)
const progress = ref<ImportProgress | null>(null)
let pollTimer: ReturnType<typeof setInterval> | null = null

// 上传成功回调
function handleUploadSuccess(response: { data: string }) {
  taskId.value = response.data
  polling.value = true
  startPolling()
}

// 上传失败回调
function handleUploadError() {
  uploading.value = false
  ElMessage.error('文件上传失败')
}

// 轮询进度
function startPolling() {
  pollTimer = setInterval(async () => {
    try {
      const res = await getImportProgress(taskId.value)
      progress.value = res.data.data
      if (res.data.data.done) {
        stopPolling()
        ElMessage.success(`导入完成：成功 ${res.data.data.success} 条，失败 ${res.data.data.failed} 条`)
        // 关闭弹窗并刷新列表
        setTimeout(() => {
          dialogVisible.value = false
          emit('success')
        }, 1500)
      }
    } catch {
      stopPolling()
    }
  }, 2000)
}

function stopPolling() {
  polling.value = false
  uploading.value = false
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
}

// 关闭弹窗时清理
watch(dialogVisible, (v) => {
  if (!v) {
    stopPolling()
    progress.value = null
    taskId.value = ''
  }
})

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

// 自定义上传
const uploadRef = ref()
const selectedFile = ref<File | null>(null)

function handleFileChange(uploadFile: { raw: File; status?: string }) {
  if (uploadFile.status === 'removed') {
    selectedFile.value = null
  } else {
    selectedFile.value = uploadFile.raw
  }
}

async function handleStartImport() {
  if (!selectedFile.value) {
    ElMessage.warning('请先选择文件')
    return
  }
  uploading.value = true
  try {
    const res = await importUsers(selectedFile.value)
    handleUploadSuccess(res.data)
  } catch {
    handleUploadError()
  }
}
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    title="导入用户"
    width="500px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="!polling"
  >
    <!-- 未开始导入：显示上传区域 -->
    <template v-if="!taskId">
      <el-upload
        ref="uploadRef"
        drag
        accept=".xlsx"
        :auto-upload="false"
        :show-file-list="true"
        :limit="1"
        @change="handleFileChange"
      >
        <el-icon class="el-icon--upload" :size="48">
          <upload-filled />
        </el-icon>
        <div class="el-upload__text">
          将文件拖到此处，或<em>点击选择</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            仅支持 .xlsx 格式，表头：姓名、年龄、邮箱
          </div>
        </template>
      </el-upload>
      <div style="margin-top: 12px; display: flex; justify-content: center; gap: 8px">
        <el-button size="small" @click="handleDownloadTemplate">
          下载导入模板
        </el-button>
        <el-button
          type="primary"
          size="small"
          :disabled="!selectedFile"
          @click="handleStartImport"
        >
          开始导入
        </el-button>
      </div>
    </template>

    <!-- 导入中 / 已完成：显示进度 -->
    <template v-else>
      <div v-if="progress" style="text-align: center; padding: 24px 0">
        <el-progress
          type="circle"
          :percentage="Math.round((progress.processed / progress.total) * 100) || 0"
          :status="progress.done ? 'success' : undefined"
        />
        <div style="margin-top: 16px; font-size: 14px; color: #606266">
          <p>总条数：{{ progress.total }}</p>
          <p>已处理：{{ progress.processed }}</p>
          <p>成功：<span style="color: #67c23a">{{ progress.success }}</span> 条，
            失败：<span style="color: #f56c6c">{{ progress.failed }}</span> 条</p>
        </div>
      </div>
      <div v-else style="text-align: center; padding: 24px 0">
        <el-icon class="is-loading" :size="32">
          <loading />
        </el-icon>
        <p style="margin-top: 12px; color: #909399">正在上传文件...</p>
      </div>
    </template>

    <template #footer>
      <el-button :disabled="uploading || polling" @click="dialogVisible = false">
        关闭
      </el-button>
    </template>
  </el-dialog>
</template>