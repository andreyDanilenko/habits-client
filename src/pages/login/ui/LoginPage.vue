<template>
  <div
    class="min-h-screen flex items-center justify-center bg-bg-secondary py-(--spacing-12) px-(--spacing-4)"
  >
    <div class="max-w-md w-full space-y-(--spacing-8)">
      <div class="text-center">
        <div class="mx-auto flex justify-center">
          <Logo :size="48" />
        </div>
        <h1 class="text-text-primary mt-(--spacing-6)">Вход в HabitFlow</h1>
        <p class="mt-(--spacing-2) text-(--text-sm) text-text-secondary">
          Начните отслеживать свои привычки сегодня
        </p>
      </div>

      <Card class="p-(--spacing-8)">
        <form @submit.prevent="handleSubmit" class="space-y-(--spacing-6)">
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
              container-class="items-center"
            />

            <router-link
              to="/forgot-password"
              class="text-(--text-sm) font-medium text-primary-default hover:text-primary-dark"
            >
              Забыли пароль?
            </router-link>
          </div>

          <div>
            <Button type="submit" :loading="isLoading" class="w-full"> Войти </Button>
          </div>

          <div class="text-center">
            <p class="text-(--text-sm) text-text-secondary">
              Нет аккаунта?
              <router-link
                to="/register"
                class="font-medium text-primary-default hover:text-primary-dark"
              >
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
  import { reactive, ref, onMounted } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import { Card, Button, Input, Checkbox } from '@/shared/ui'
  import { Logo } from '@/shared/ui/icon'
  import { useAuthStore } from '@/features/auth'
  import { useUserStore } from '@/entities/user'

  const router = useRouter()
  const route = useRoute()
  const authStore = useAuthStore()
  const userStore = useUserStore()

  onMounted(() => {
    const email = route.query.email as string
    if (email) form.email = email
  })

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
        const inviteToken = route.query.inviteToken as string
        if (inviteToken) {
          router.push(`/invite/${inviteToken}`)
        } else {
          router.push('/')
        }
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
