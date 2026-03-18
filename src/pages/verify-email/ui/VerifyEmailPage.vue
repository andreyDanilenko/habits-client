<template>
  <div
    class="min-h-screen flex items-center justify-center bg-bg-secondary py-(--spacing-12) px-(--spacing-4)"
  >
    <div class="max-w-md w-full text-center">
      <div v-if="status === 'loading'" class="space-y-4">
        <div
          class="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary-default border-t-transparent"
        />
        <p class="text-text-secondary">Подтверждение регистрации...</p>
      </div>
      <div v-else-if="status === 'success'" class="space-y-4">
        <div
          class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30"
        >
          <svg
            class="h-6 w-6 text-green-600 dark:text-green-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h1 class="text-lg font-medium text-text-primary">Email подтверждён</h1>
        <p class="text-text-secondary">Регистрация завершена. Перенаправляем...</p>
      </div>
      <div v-else class="space-y-4">
        <div
          class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30"
        >
          <svg
            class="h-6 w-6 text-red-600 dark:text-red-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>
        <h1 class="text-lg font-medium text-text-primary">Ошибка подтверждения</h1>
        <p class="text-(--text-sm) text-text-secondary">{{ errorMessage }}</p>
        <router-link
          to="/register"
          class="block font-medium text-primary-default hover:text-primary-dark"
        >
          Зарегистрироваться снова
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { api, API_ENDPOINTS } from '@/shared/api'
  import type { User } from '@/entities/user'
  import { useUserStore } from '@/entities/user'
  import { useWorkspaceStore } from '@/entities/workspace'
  import { useAuthStore } from '@/features/auth'

  const route = useRoute()
  const router = useRouter()
  const status = ref<'loading' | 'success' | 'error'>('loading')
  const errorMessage = ref('')

  onMounted(async () => {
    const token = route.query.token as string
    if (!token) {
      status.value = 'error'
      errorMessage.value = 'Ссылка недействительна. Токен отсутствует.'
      return
    }

    try {
      const data = await api.get<{ user: User }>(
        `${API_ENDPOINTS.AUTH.VERIFY_EMAIL}?token=${encodeURIComponent(token)}`,
      )
      status.value = 'success'
      const userStore = useUserStore()
      const authStore = useAuthStore()
      const workspaceStore = useWorkspaceStore()
      // Используем данные из ответа — cookies уже установлены бэкендом.
      userStore.setUser(data.user)
      authStore.setCookieBasedAuth()
      workspaceStore.clearWorkspaces()
      // Загружаем workspaces до редиректа — проверяем, что cookies применились.
      // Иначе после редиректа authGuard вызовет fetchWorkspaces и может получить 401.
      try {
        await workspaceStore.fetchWorkspaces()
      } catch (wsErr) {
        console.error('Failed to fetch workspaces after verify:', wsErr)
        await new Promise((r) => setTimeout(r, 500))
        try {
          await workspaceStore.fetchWorkspaces()
        } catch {
          // Cookies не применились — редирект всё равно, authGuard попробует снова
        }
      }
      setTimeout(() => router.push('/'), 800)
    } catch (err: any) {
      status.value = 'error'
      errorMessage.value =
        err.response?.data?.message ||
        'Ссылка недействительна или истекла. Зарегистрируйтесь снова.'
    }
  })
</script>
