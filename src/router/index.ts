import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/users',
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
    },
    {
      path: '/users',
      name: 'users',
      component: () => import('../views/UserList.vue'),
      meta: { requiresAuth: true },
    },
  ],
})

// 路由守卫：未登录跳转登录页
router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()
  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    next('/login')
  } else if (to.path === '/login' && authStore.isLoggedIn) {
    next('/users')
  } else {
    next()
  }
})

export default router