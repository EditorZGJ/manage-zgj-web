<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// 模式切换：login / register
const isLogin = ref(true)

const formData = ref({
  username: '',
  password: '',
  confirmPassword: '',
})

const formRef = ref()
const loading = ref(false)

const loginRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少 6 位', trigger: 'blur' },
  ],
}

const registerRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少 6 位', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (_rule: unknown, value: string, callback: (e?: Error) => void) => {
        if (value !== formData.value.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
}

function toggleMode() {
  isLogin.value = !isLogin.value
  formData.value.confirmPassword = ''
  formRef.value?.clearValidate()
}

async function handleSubmit() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    if (isLogin.value) {
      await authStore.login(formData.value.username, formData.value.password)
      router.push('/users')
    } else {
      await authStore.register(formData.value.username, formData.value.password)
      ElMessage.success('注册成功，请登录')
      isLogin.value = true
      formData.value.password = ''
      formData.value.confirmPassword = ''
    }
  } catch {
    // 错误已在拦截器中处理
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-card">
      <h2 class="login-title">{{ isLogin ? '用户登录' : '用户注册' }}</h2>

      <el-form
        ref="formRef"
        :model="formData"
        :rules="isLogin ? loginRules : registerRules"
        label-width="80px"
        class="login-form"
        @keyup.enter="handleSubmit"
      >
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="formData.username"
            placeholder="请输入用户名"
            :prefix-icon="'User'"
          />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input
            v-model="formData.password"
            type="password"
            placeholder="请输入密码"
            show-password
            :prefix-icon="'Lock'"
          />
        </el-form-item>

        <el-form-item v-if="!isLogin" label="确认密码" prop="confirmPassword">
          <el-input
            v-model="formData.confirmPassword"
            type="password"
            placeholder="请再次输入密码"
            show-password
            :prefix-icon="'Lock'"
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            :loading="loading"
            style="width: 100%"
            @click="handleSubmit"
          >
            {{ isLogin ? '登 录' : '注 册' }}
          </el-button>
        </el-form-item>
      </el-form>

      <div class="login-footer">
        <span v-if="isLogin">还没有账号？</span>
        <span v-else>已有账号？</span>
        <el-link type="primary" :underline="false" @click="toggleMode">
          {{ isLogin ? '立即注册' : '去登录' }}
        </el-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  width: 420px;
  padding: 40px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
}

.login-title {
  text-align: center;
  margin: 0 0 32px;
  font-size: 24px;
  color: #303133;
}

.login-form {
  :deep(.el-form-item) {
    margin-bottom: 22px;
  }
}

.login-footer {
  text-align: center;
  margin-top: 16px;
  font-size: 14px;
  color: #909399;
}
</style>