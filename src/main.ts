import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from '@/app/App.vue'
import router from '@/app/router'
import { api } from '@/shared/api'
import { handleUnauthorized } from '@/features/auth'
import '@/styles/main.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)

// Настраиваем обработчик неавторизованных запросов API
// Логика обработки вынесена в handleUnauthorized для переиспользования
api.setUnauthorizedHandler(async () => {
  await handleUnauthorized(router)
})

const initApp = async () => {
  const { useAuthStore } = await import('@/features/auth')
  const authStore = useAuthStore()
  
  await authStore.initAuth()
  app.use(router)
  await router.isReady()
  app.mount('#app')
}

initApp()
