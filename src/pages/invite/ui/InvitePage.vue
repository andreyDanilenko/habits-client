<template>
  <div
    class="min-h-screen flex items-center justify-center bg-bg-secondary py-(--spacing-12) px-(--spacing-4)"
  >
    <div class="max-w-md w-full">
      <div v-if="status === 'loading'" class="text-center space-y-4">
        <div
          class="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary-default border-t-transparent"
        />
        <p class="text-text-secondary">Загрузка приглашения...</p>
      </div>
      <div v-else-if="status === 'error'" class="text-center space-y-4">
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
        <h1 class="text-lg font-medium text-text-primary">Приглашение недействительно</h1>
        <p class="text-(--text-sm) text-text-secondary">{{ errorMessage }}</p>
      </div>
      <div v-else-if="info" class="space-y-6">
        <Card class="p-6">
          <div class="text-center space-y-4">
            <h1 class="text-lg font-medium text-text-primary">Приглашение в workspace</h1>
            <p class="text-text-secondary">
              <strong>{{ info.invitedByName }}</strong> приглашает вас в workspace
              <strong>«{{ info.workspaceName }}»</strong>
            </p>
            <p class="text-text-secondary">Роль: {{ info.systemRole }}</p>
            <p class="text-(--text-sm) text-text-secondary">
              Ссылка действительна до {{ formatDate(info.expiresAt) }}
            </p>

            <div v-if="info.isAuthenticated" class="space-y-3">
              <Button class="w-full" :loading="accepting" @click="handleAccept">
                Принять приглашение
              </Button>
            </div>
            <div v-else class="space-y-3">
              <Button v-if="info.userExists" class="w-full" @click="goToLogin"> Войти </Button>
              <Button v-else class="w-full" variant="outline" @click="goToRegister">
                Зарегистрироваться
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, computed } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { Card, Button } from '@/shared/ui'
  import { publicInvitationService, type PublicInvitationInfo } from '@/entities/workspace'

  const route = useRoute()
  const router = useRouter()
  const token = computed(() => route.params.token as string)
  const status = ref<'loading' | 'success' | 'error'>('loading')
  const errorMessage = ref('')
  const info = ref<PublicInvitationInfo | null>(null)
  const accepting = ref(false)

  const formatDate = (s: string) => {
    try {
      const d = new Date(s)
      return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
    } catch {
      return s
    }
  }

  const goToLogin = () => {
    if (!info.value) return
    router.push({
      path: '/login',
      query: { email: info.value.email, inviteToken: token.value },
    })
  }

  const goToRegister = () => {
    if (!info.value) return
    router.push({
      path: '/register',
      query: { email: info.value.email, inviteToken: token.value },
    })
  }

  const handleAccept = async () => {
    if (!token.value) return
    accepting.value = true
    try {
      const res = await publicInvitationService.accept(token.value)
      if (res.status === 'accepted' && res.redirectTo) {
        window.location.href = res.redirectTo
      } else if (res.status === 'requires_auth' && res.redirectTo) {
        window.location.href = res.redirectTo
      } else if (res.status === 'expired') {
        status.value = 'error'
        errorMessage.value = res.message ?? 'Приглашение истекло'
      } else if (res.status === 'wrong_email') {
        status.value = 'error'
        errorMessage.value = res.message ?? 'Приглашение предназначено для другого email'
      }
    } catch (err: any) {
      status.value = 'error'
      errorMessage.value = err?.response?.data?.message ?? 'Не удалось принять приглашение'
    } finally {
      accepting.value = false
    }
  }

  onMounted(async () => {
    if (!token.value) {
      status.value = 'error'
      errorMessage.value = 'Ссылка недействительна'
      return
    }

    try {
      info.value = await publicInvitationService.getByToken(token.value)
      status.value = 'success'
    } catch (err: any) {
      status.value = 'error'
      errorMessage.value = err?.response?.data?.message ?? 'Приглашение недействительно или истекло'
    }
  })
</script>
