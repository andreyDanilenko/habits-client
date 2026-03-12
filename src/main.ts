import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from '@/app/App.vue'
import router from '@/app/router'
import { api } from '@/shared/api'
import { handleUnauthorized } from '@/features/auth'
import { initTheme } from '@/shared/lib/use-theme'
import '@/styles/main.css'

initTheme()

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

  const path = window.location.pathname
  // Страницы, где пользователь точно не авторизован — initAuth не нужен
  const isUnauthenticatedPage =
    path === '/login' || path === '/register' || path.startsWith('/auth/verify-email')
  // Для /invite/ initAuth обязателен: если пользователь авторизован, нужно обновить сессию
  // до принятия приглашения, иначе accept может вернуть requires_auth из-за истёкшего токена
  if (!isUnauthenticatedPage) {
    await authStore.initAuth()
  }

  app.use(router)
  await router.isReady()
  app.mount('#app')
}

initApp()
