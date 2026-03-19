<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <div>
      <h1 class="text-text-primary">Настройки</h1>
      <p class="mt-2 text-text-secondary">Управляйте настройками своего аккаунта</p>
    </div>

    <Card class="p-6">
      <h2 class="text-text-primary mb-4">Язык</h2>

      <div class="space-y-4">
        <p class="text-sm text-text-secondary">Выберите язык интерфейса</p>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="loc in supportedLocales"
            :key="loc"
            type="button"
            class="px-4 py-2 text-sm rounded-(--radius-md) font-medium transition-colors"
            :class="
              currentLocale === loc
                ? 'bg-primary-default text-white'
                : 'bg-bg-tertiary text-text-primary hover:bg-border-light'
            "
            @click="setLocale(loc)"
          >
            {{ localeLabels[loc] }}
          </button>
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
  import { ref, reactive, computed } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { Card, Button, Input } from '@/shared/ui'
  import { useUserStore } from '@/entities/user'
  import { authService } from '@/features/auth'
  import { getPasswordError } from '@/shared/lib/validation'
  import {
    SUPPORTED_LOCALES,
    LOCALE_LABELS,
    setLocale as setAppLocale,
    type SupportedLocale,
  } from '@/shared/lib/i18n'

  const userStore = useUserStore()
  const { locale } = useI18n()

  const supportedLocales = SUPPORTED_LOCALES
  const localeLabels = LOCALE_LABELS
  const currentLocale = computed(() => locale.value as SupportedLocale)
  const setLocale = (loc: SupportedLocale) => setAppLocale(loc)
  const isAdmin = computed(() => {
    const role = userStore.currentUser?.role
    return role === 'ADMIN' || (typeof role === 'string' && role.toUpperCase() === 'ADMIN')
  })

  const isChangingPassword = ref(false)
  const passwordSuccess = ref(false)
  const showDeleteConfirm = ref(false)

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
</script>
