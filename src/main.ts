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
app.use(router)

api.setTokenProvider(() => {
  const authStore = useAuthStore()
  return authStore.accessToken
})

api.setUnauthorizedHandler(async () => {
  const authStore = useAuthStore()
  await authStore.logout()
  window.location.href = '/login'
})

app.mount('#app')
