import { ref, reactive } from 'vue'
import { defineStore } from 'pinia'
import { getUsers } from '@/api/user'
import type { User, UserQueryParams } from '@/types/user'

export const useUserStore = defineStore('user', () => {
  const users = ref<User[]>([])
  const total = ref(0)
  const loading = ref(false)
  const queryParams = reactive<UserQueryParams>({
    page: 1,
    size: 10,
  })

  async function fetchUsers() {
    loading.value = true
    try {
      const res = await getUsers(queryParams)
      const data = res.data.data
      users.value = data.records
      total.value = data.total
    } finally {
      loading.value = false
    }
  }

  function setQueryParams(params: Partial<UserQueryParams>) {
    Object.assign(queryParams, params)
  }

  function resetPage() {
    queryParams.page = 1
  }

  return {
    users,
    total,
    loading,
    queryParams,
    fetchUsers,
    setQueryParams,
    resetPage,
  }
})