<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { addUser, updateUser } from '@/api/user'
import type { User } from '@/types/user'

const props = defineProps<{
  visible: boolean
  user: User | null
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  success: []
}>()

const dialogVisible = ref(false)
watch(() => props.visible, (v) => { dialogVisible.value = v })
watch(dialogVisible, (v) => emit('update:visible', v))

const title = ref('新增用户')
watch(() => props.user, (u) => {
  title.value = u ? '编辑用户' : '新增用户'
  if (u) {
    formData.value = { name: u.name, age: u.age, email: u.email }
  } else {
    formData.value = { name: '', age: undefined as unknown as number, email: '' }
  }
})

const formRef = ref()

const formData = ref({
  name: '',
  age: undefined as unknown as number,
  email: '',
})

const rules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  age: [
    { required: true, message: '请输入年龄', trigger: 'blur' },
    { type: 'number' as const, min: 1, max: 150, message: '年龄必须为正整数', trigger: 'blur' },
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email' as const, message: '邮箱格式不正确', trigger: 'blur' },
  ],
}

const submitting = ref(false)

async function handleSubmit() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    if (props.user) {
      await updateUser({ id: props.user.id, ...formData.value })
      ElMessage.success('修改成功')
    } else {
      await addUser(formData.value)
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    emit('success')
  } finally {
    submitting.value = false
  }
}

function handleCancel() {
  dialogVisible.value = false
}
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    :title="title"
    width="500px"
    :close-on-click-modal="false"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="80px"
      style="max-width: 380px"
    >
      <el-form-item label="姓名" prop="name">
        <el-input v-model="formData.name" placeholder="请输入姓名" />
      </el-form-item>
      <el-form-item label="年龄" prop="age">
        <el-input-number
          v-model="formData.age"
          :min="1"
          :max="150"
          :precision="0"
          placeholder="请输入年龄"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="formData.email" placeholder="请输入邮箱" />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">
        确定
      </el-button>
    </template>
  </el-dialog>
</template>