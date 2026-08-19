import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(ElementPlus)

app.mount('#app')

// 全局捕获 chunk 加载失败，自动刷新
window.addEventListener('unhandledrejection', (event) => {
  const msg = event.reason?.message || ''
  if (msg.includes('Failed to fetch dynamically imported module') || msg.includes('Importing a module script failed')) {
    event.preventDefault()
    window.location.reload()
  }
})
