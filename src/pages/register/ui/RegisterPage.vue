<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
    <div class="max-w-md w-full space-y-8">
      <!-- Логотип -->
      <div class="text-center">
        <div class="mx-auto flex justify-center">
          <Logo :size="48" />
        </div>
        <h1 class="mt-6">Регистрация в HabitFlow</h1>
        <p class="mt-2 text-gray-600">Создайте аккаунт и начните отслеживать свои привычки</p>
      </div>

      <Card class="p-8">
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <Input v-model="form.name" label="Имя" name="name" placeholder="Введите ваше имя" />

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
            placeholder="Не менее 6 символов"
            :error="errors.password"
          />

          <Input
            v-model="form.confirmPassword"
            label="Подтвердите пароль"
            type="password"
            name="confirmPassword"
            required
            placeholder="Повторите пароль"
            :error="errors.confirmPassword"
          />

          <Checkbox
            v-model="form.acceptTerms"
            label="Я принимаю условия пользовательского соглашения"
            name="acceptTerms"
            required
            size="md"
            container-class="items-center"
          />

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
  import { Card, Button, Input, Checkbox } from '@/shared/ui'
  import { Logo } from '@/shared/ui/icon'
  import { useAuthStore } from '@/features/auth'
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
    acceptTerms: false,
  })

  const errors = reactive({
    email: '',
    password: '',
    confirmPassword: '',
  })

  const handleSubmit = async () => {
    errors.email = ''
    errors.password = ''
    errors.confirmPassword = ''

    if (!form.acceptTerms) {
      alert('Необходимо принять условия соглашения')
      return
    }

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
