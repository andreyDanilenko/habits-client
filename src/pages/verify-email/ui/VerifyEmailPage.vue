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
  import { useUserStore } from '@/entities/user'

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
      await api.get(`${API_ENDPOINTS.AUTH.VERIFY_EMAIL}?token=${encodeURIComponent(token)}`)
      status.value = 'success'
      const userStore = useUserStore()
      await userStore.fetchCurrentUser()
      setTimeout(() => router.push('/'), 1500)
    } catch (err: any) {
      status.value = 'error'
      errorMessage.value =
        err.response?.data?.message ||
        'Ссылка недействительна или истекла. Зарегистрируйтесь снова.'
    }
  })
</script>
