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
        <h2 class="mt-6 text-3xl font-bold text-gray-900">Регистрация в HabitFlow</h2>
        <p class="mt-2 text-gray-600">Создайте аккаунт и начните отслеживать свои привычки</p>
      </div>

      <!-- Форма -->
      <Card class="p-8">
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700 mb-1"> Имя </label>
            <input
              id="name"
              v-model="form.name"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

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

          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1">
              Подтвердите пароль
            </label>
            <input
              id="confirmPassword"
              v-model="form.confirmPassword"
              type="password"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              :class="{ 'border-red-300': errors.confirmPassword }"
            />
            <p v-if="errors.confirmPassword" class="mt-1 text-sm text-red-600">
              {{ errors.confirmPassword }}
            </p>
          </div>

          <div>
            <Button type="submit" :loading="isLoading" class="w-full"> Зарегистрироваться </Button>
          </div>

          <div class="text-center">
            <p class="text-sm text-gray-600">
              Уже есть аккаунт?
              <router-link to="/login" class="font-medium text-indigo-600 hover:text-indigo-500">
                Войти
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
  import { useAuthStore } from '@/features/auth/model/auth-store'
  import { useUserStore } from '@/entities/user'

  const router = useRouter()
  const authStore = useAuthStore()
  const userStore = useUserStore()

  const isLoading = ref(false)

  const form = reactive({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const errors = reactive({
    email: '',
    password: '',
    confirmPassword: '',
  })

  const handleSubmit = async () => {
    // Валидация
    errors.email = ''
    errors.password = ''
    errors.confirmPassword = ''

    if (form.password !== form.confirmPassword) {
      errors.confirmPassword = 'Пароли не совпадают'
      return
    }

    if (form.password.length < 6) {
      errors.password = 'Пароль должен быть не менее 6 символов'
      return
    }

    isLoading.value = true

    try {
      await authStore.register({
        email: form.email,
        password: form.password,
        name: form.name || undefined,
      })

      await userStore.fetchCurrentUser()

      router.push('/')
    } catch (error: any) {
      if (error.response?.data?.message) {
        errors.email = error.response.data.message
      } else {
        errors.email = 'Ошибка при регистрации'
      }
    } finally {
      isLoading.value = false
    }
  }
</script>
