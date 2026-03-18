import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { autoAnimatePlugin } from '@formkit/auto-animate/vue'
import App from '@/app/App.vue'
import router from '@/app/router'
import { api } from '@/shared/api'
import { handleUnauthorized } from '@/features/auth'
import { initTheme } from '@/shared/lib/use-theme'
import { i18n } from '@/shared/lib/i18n'
import '@/styles/main.css'

initTheme()

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(i18n)
app.use(autoAnimatePlugin)

api.setUnauthorizedHandler(async () => {
  await handleUnauthorized(router)
})

const initApp = async () => {
  const { useAuthStore } = await import('@/features/auth')
  const authStore = useAuthStore()

  app.use(router)

  // initAuth до router.isReady() — authGuard увидит пользователя при заходе на /login
  await authStore.initAuth()

  await router.isReady()
  app.mount('#app')
}

initApp()
