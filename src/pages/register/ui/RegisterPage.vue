<template>
  <div
    class="min-h-screen flex items-center justify-center bg-bg-secondary py-(--spacing-12) px-(--spacing-4)"
  >
    <div class="max-w-md w-full space-y-(--spacing-8)">
      <div class="text-center">
        <div class="mx-auto flex justify-center">
          <Logo :size="48" />
        </div>
        <h1 class="text-text-primary mt-(--spacing-6)">Регистрация в HabitFlow</h1>
        <p class="mt-(--spacing-2) text-(--text-sm) text-text-secondary">
          Создайте аккаунт и начните отслеживать свои привычки
        </p>
      </div>

      <Card v-if="emailSent" class="p-(--spacing-8)">
        <div class="space-y-(--spacing-6) text-center">
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
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h2 class="text-lg font-medium text-text-primary">Письмо отправлено</h2>
          <p class="text-(--text-sm) text-text-secondary">
            {{ emailSentMessage }}
          </p>
          <p class="text-(--text-sm) text-text-secondary">
            Перейдите по ссылке из письма, чтобы подтвердить регистрацию.
          </p>
          <Button variant="outline" class="w-full" @click="resetForm">Зарегистрировать другой email</Button>
          <div class="text-center">
            <router-link
              to="/login"
              class="font-medium text-primary-default hover:text-primary-dark"
            >
              Вернуться к входу
            </router-link>
          </div>
        </div>
      </Card>

      <Card v-else class="p-(--spacing-8)">
        <form @submit.prevent="handleSubmit" class="space-y-(--spacing-6)">
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
            placeholder="Не менее 8 символов"
            :error="errors.password"
            @blur="validatePasswordField"
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
            container-class="items-center"
          />

          <div>
            <Button type="submit" :loading="isLoading" class="w-full"> Зарегистрироваться </Button>
          </div>

          <div class="text-center">
            <p class="text-(--text-sm) text-text-secondary">
              Уже есть аккаунт?
              <router-link
                to="/login"
                class="font-medium text-primary-default hover:text-primary-dark"
              >
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
  import { getPasswordError } from '@/shared/lib/validation'
  import { useAuthStore } from '@/features/auth'
  import { useUserStore } from '@/entities/user'

  const router = useRouter()
  const authStore = useAuthStore()
  const userStore = useUserStore()

  const isLoading = ref(false)
  const emailSent = ref(false)
  const emailSentMessage = ref('')

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

  const validatePasswordField = () => {
    errors.password = getPasswordError(form.password)
  }

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

    validatePasswordField()
    if (errors.password) return

    isLoading.value = true

    try {
      const result = await authStore.register({
        email: form.email,
        password: form.password,
        name: form.name || undefined,
      })

      if (result.pendingVerification) {
        emailSent.value = true
        emailSentMessage.value = result.message || 'На вашу почту отправлена ссылка для подтверждения регистрации.'
        return
      }

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

  const resetForm = () => {
    emailSent.value = false
    emailSentMessage.value = ''
    form.name = ''
    form.email = ''
    form.password = ''
    form.confirmPassword = ''
    form.acceptTerms = false
    errors.email = ''
    errors.password = ''
    errors.confirmPassword = ''
  }
</script>
