import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from '@/app/App.vue'
import router from '@/app/router'
import { api } from '@/shared/api'
import { useAuthStore } from '@/features/auth'
import '@/styles/main.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)

api.setUnauthorizedHandler(async () => {
  const authStore = useAuthStore()
  authStore.clearTokens()
  const userStore = await import('@/entities/user')
  userStore.useUserStore().clearUser()
  
  const currentPath = window.location.pathname
  const publicRoutes = ['/login', '/register', '/forgot-password']
  
  if (!publicRoutes.includes(currentPath)) {
    try {
      if (router.currentRoute) {
        await router.push('/login')
      } else {
        window.location.href = '/login'
      }
    } catch (error) {
      window.location.href = '/login'
    }
  }
})
const initApp = async () => {
  const authStore = useAuthStore()
  await authStore.initAuth()
  app.use(router)
  await router.isReady()
  app.mount('#app')
}

initApp()
