<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
    <div class="max-w-md w-full space-y-8">
      <!-- Логотип -->
      <div class="text-center">
        <div
          class="mx-auto w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center"
        >
          <span class="text-white font-bold text-lg">HF</span>
        </div>
        <h2 class="mt-6 text-3xl font-bold text-gray-900">Вход в HabitFlow</h2>
        <p class="mt-2 text-gray-600">Начните отслеживать свои привычки сегодня</p>
      </div>

      <!-- Форма -->
      <Card class="p-8">
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-1"> Email </label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              :class="{ 'border-red-300': errors.email }"
            />
            <p v-if="errors.email" class="mt-1 text-sm text-red-600">
              {{ errors.email }}
            </p>
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
              Пароль
            </label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              :class="{ 'border-red-300': errors.password }"
            />
            <p v-if="errors.password" class="mt-1 text-sm text-red-600">
              {{ errors.password }}
            </p>
          </div>

          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <input
                id="remember"
                v-model="form.remember"
                type="checkbox"
                class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label for="remember" class="ml-2 block text-sm text-gray-700">
                Запомнить меня
              </label>
            </div>

            <router-link
              to="/forgot-password"
              class="text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              Забыли пароль?
            </router-link>
          </div>

          <div>
            <Button type="submit" :loading="isLoading" class="w-full"> Войти </Button>
          </div>

          <div class="text-center">
            <p class="text-sm text-gray-600">
              Нет аккаунта?
              <router-link to="/register" class="font-medium text-indigo-600 hover:text-indigo-500">
                Зарегистрироваться
              </router-link>
            </p>
          </div>
        </form>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { reactive, ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { Card, Button } from '@/shared/ui'
  import { useAuthStore } from '@/features/auth'
  import { useUserStore } from '@/entities/user'

  const router = useRouter()
  const authStore = useAuthStore()
  const userStore = useUserStore()

  const isLoading = ref(false)

  const form = reactive({
    email: '',
    password: '',
    remember: false,
  })

  const errors = reactive({
    email: '',
    password: '',
  })

  const handleSubmit = async () => {
    isLoading.value = true

    try {
      await authStore.login({
        email: form.email,
        password: form.password,
      })

      if (authStore.isAuthenticated && userStore.currentUser) {
        router.push('/')
      } else {
        errors.email = 'Ошибка аутентификации'
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        errors.email = 'Неверный email или пароль'
      } else {
        errors.email = 'Произошла ошибка при входе'
      }
    } finally {
      isLoading.value = false
    }
  }
</script>
