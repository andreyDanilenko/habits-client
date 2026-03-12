<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <div>
      <h1 class="text-text-primary">Настройки</h1>
      <p class="mt-2 text-text-secondary">Управляйте настройками своего аккаунта</p>
    </div>

    <Card class="p-6">
      <h2 class="text-text-primary mb-4">Профиль</h2>

      <div class="space-y-4">
        <Input
          v-model="profile.email"
          label="Email"
          type="email"
          name="email"
          disabled
          placeholder="Ваш email"
          hint="Email нельзя изменить"
        />

        <Input
          v-model="profile.name"
          label="Имя"
          type="text"
          name="name"
          placeholder="Введите ваше имя"
        />

        <div class="pt-4">
          <Button @click="saveProfile" :loading="isSaving"> Сохранить изменения </Button>
        </div>
      </div>
    </Card>

    <Card class="p-6">
      <h2 class="text-text-primary mb-4">Безопасность</h2>

      <div class="space-y-4">
        <Input
          v-model="passwordForm.currentPassword"
          label="Текущий пароль"
          type="password"
          name="current-password"
          placeholder="Введите текущий пароль"
          :error="passwordErrors.currentPassword"
        />

        <Input
          v-model="passwordForm.newPassword"
          label="Новый пароль"
          type="password"
          name="new-password"
          placeholder="Минимум 8 символов, буквы, цифры, спецсимволы"
          :error="passwordErrors.newPassword"
          hint="Минимум 8 символов, буквы, цифры, спецсимволы"
          @blur="validateNewPasswordField"
        />

        <Input
          v-model="passwordForm.confirmPassword"
          label="Подтвердите новый пароль"
          type="password"
          name="confirm-password"
          placeholder="Повторите новый пароль"
          :error="passwordErrors.confirmPassword"
        />

        <p v-if="passwordSuccess" class="text-sm text-green-600 dark:text-green-400">
          Пароль успешно изменён
        </p>
        <div class="pt-2">
          <Button
            :loading="isChangingPassword"
            :disabled="!canChangePassword"
            @click="changePassword"
          >
            Сменить пароль
          </Button>
        </div>
      </div>
    </Card>

    <Card class="p-6">
      <h2 class="text-text-primary mb-4">Уведомления</h2>

      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex-1">
            <p class="text-sm font-medium text-text-primary">Email уведомления</p>
            <p class="text-sm text-text-secondary">Получать уведомления на email</p>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input v-model="notifications.email" type="checkbox" class="sr-only peer" />
            <div
              class="w-11 h-6 bg-bg-tertiary peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-light rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border-default after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-default"
            ></div>
          </label>
        </div>

        <div class="flex items-center justify-between">
          <div class="flex-1">
            <p class="text-sm font-medium text-text-primary">Напоминания о привычках</p>
            <p class="text-sm text-text-secondary">Ежедневные напоминания о выполнении привычек</p>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input v-model="notifications.reminders" type="checkbox" class="sr-only peer" />
            <div
              class="w-11 h-6 bg-bg-tertiary peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-light rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border-default after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-default"
            ></div>
          </label>
        </div>
      </div>
    </Card>

    <Card v-if="isAdmin" class="p-6">
      <h2 class="text-text-primary mb-4">Биллинг и лицензии</h2>
      <p class="text-sm text-text-secondary mb-4">
        Покупка модулей на уровне аккаунта: подписка или вечная лицензия, для одного воркспейса или
        для всех. Оплата картой, СБП, QR и др.
      </p>
      <router-link
        to="/billing"
        class="inline-flex items-center text-primary-default hover:text-primary-dark font-medium"
      >
        Перейти к биллингу →
      </router-link>
    </Card>

    <Card class="p-6 border-red-200 dark:border-red-900">
      <h2 class="text-red-900 dark:text-red-400 mb-4">Опасная зона</h2>

      <div class="space-y-4">
        <div>
          <p class="text-sm text-text-secondary mb-2">
            Удаление аккаунта приведет к безвозвратному удалению всех ваших данных.
          </p>
          <Button variant="danger" @click="showDeleteConfirm = true"> Удалить аккаунт </Button>
        </div>
      </div>
    </Card>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, computed, onMounted } from 'vue'
  import { Card, Button, Input } from '@/shared/ui'
  import { useUserStore } from '@/entities/user'
  import { authService } from '@/features/auth'
  import { getPasswordError } from '@/shared/lib/validation'

  const userStore = useUserStore()
  const isAdmin = computed(() => {
    const role = userStore.currentUser?.role
    return role === 'ADMIN' || (typeof role === 'string' && role.toUpperCase() === 'ADMIN')
  })

  const isSaving = ref(false)
  const isChangingPassword = ref(false)
  const passwordSuccess = ref(false)
  const showDeleteConfirm = ref(false)

  const profile = reactive({
    email: '',
    name: '',
  })

  const passwordForm = reactive({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const passwordErrors = reactive({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const notifications = reactive({
    email: true,
    reminders: true,
  })

  const canChangePassword = computed(
    () =>
      passwordForm.currentPassword.trim() &&
      passwordForm.newPassword.trim() &&
      passwordForm.confirmPassword.trim() &&
      !getPasswordError(passwordForm.newPassword) &&
      passwordForm.newPassword === passwordForm.confirmPassword,
  )

  const validateNewPasswordField = () => {
    passwordErrors.newPassword = getPasswordError(passwordForm.newPassword)
  }

  const changePassword = async () => {
    passwordErrors.currentPassword = ''
    passwordErrors.newPassword = ''
    passwordErrors.confirmPassword = ''
    passwordSuccess.value = false

    const newErr = getPasswordError(passwordForm.newPassword)
    if (newErr) {
      passwordErrors.newPassword = newErr
      return
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      passwordErrors.confirmPassword = 'Пароли не совпадают'
      return
    }

    isChangingPassword.value = true
    try {
      await authService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      })
      passwordForm.currentPassword = ''
      passwordForm.newPassword = ''
      passwordForm.confirmPassword = ''
      passwordSuccess.value = true
    } catch (error: any) {
      const msg = error?.response?.data?.message
      if (msg?.toLowerCase?.().includes('current') || msg?.toLowerCase?.().includes('incorrect')) {
        passwordErrors.currentPassword = 'Неверный текущий пароль'
      } else {
        passwordErrors.currentPassword = msg || 'Не удалось сменить пароль'
      }
    } finally {
      isChangingPassword.value = false
    }
  }

  onMounted(() => {
    if (userStore.currentUser) {
      profile.email = userStore.currentUser.email
      profile.name = userStore.currentUser.name || ''
    }
  })

  const saveProfile = async () => {
    isSaving.value = true
    try {
      console.log('Save profile:', profile)
      await new Promise((resolve) => setTimeout(resolve, 1000))
    } catch (error) {
      console.error('Failed to save profile:', error)
    } finally {
      isSaving.value = false
    }
  }
</script>
