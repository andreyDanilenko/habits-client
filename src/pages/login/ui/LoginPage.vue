<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
    <div class="max-w-md w-full space-y-8">
      <div class="text-center">
        <div class="mx-auto flex justify-center">
          <Logo :size="48" />
        </div>
        <h2 class="mt-6 text-3xl font-bold text-gray-900">Вход в HabitFlow</h2>
        <p class="mt-2 text-gray-600">Начните отслеживать свои привычки сегодня</p>
      </div>

      <Card class="p-8">
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <Input
            v-model="form.email"
            label="Email"
            type="email"
            name="email"
            required
            placeholder="example@email.com"
            :error="errors.email"
          />

          <Input
            v-model="form.password"
            label="Пароль"
            type="password"
            name="password"
            required
            placeholder="Введите ваш пароль"
            :error="errors.password"
          />

          <div class="flex items-center justify-between">
            <Checkbox
              v-model="form.remember"
              label="Запомнить меня"
              name="remember"
              size="md"
              container-class="items-center"
            />

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
  import { Card, Button, Input, Checkbox } from '@/shared/ui'
  import { Logo } from '@/shared/ui/icon'
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
    errors.email = ''
    errors.password = ''

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
