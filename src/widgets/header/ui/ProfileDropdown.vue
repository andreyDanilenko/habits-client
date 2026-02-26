<template>
  <div class="relative">
    <Tooltip trigger="hover" placement="bottom" variant="dropdown">
      <template #trigger>
        <Button variant="ghost" size="sm" class="!p-1 rounded-full">
          <div
            class="w-8 h-8 bg-primary-default rounded-full flex items-center justify-center text-white text-sm font-medium"
          >
            {{ userInitials }}
          </div>
        </Button>
      </template>

      <div class="w-56 bg-bg-primary rounded-lg shadow-card border border-border-default">
        <div class="px-3 pt-3 pb-2 border-b border-border-light">
          <p class="text-xs font-semibold text-text-muted uppercase tracking-wide">Аккаунт</p>
          <p class="mt-1 text-sm font-medium text-text-primary truncate">
            {{ userEmail }}
          </p>
        </div>

        <div class="py-2">
          <Button
            variant="ghost"
            size="sm"
            custom-class="w-full justify-start !px-4 !py-2 text-text-primary hover:bg-bg-tertiary"
            @click="
              () => {
                router.push('/profile')
                closeDropdown()
              }
            "
          >
            Профиль
          </Button>
          <Button
            variant="ghost"
            size="sm"
            custom-class="w-full justify-start !px-4 !py-2 text-text-primary hover:bg-bg-tertiary"
            @click="
              () => {
                router.push('/settings')
                closeDropdown()
              }
            "
          >
            Настройки
          </Button>
          <Button
            variant="ghost"
            size="sm"
            custom-class="w-full justify-start !px-4 !py-2 text-error-default hover:bg-error-light"
            @click="handleLogout"
          >
            Выйти
          </Button>
        </div>
      </div>
    </Tooltip>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  import { useRouter } from 'vue-router'
  import { useUserStore } from '@/entities/user'
  import { useAuthStore } from '@/features/auth'
  import { Tooltip, Button } from '@/shared/ui'

  const router = useRouter()
  const userStore = useUserStore()
  const authStore = useAuthStore()
  const showDropdown = ref(false)

  const userInitials = computed(() => userStore.userInitials || 'U')
  const userEmail = computed(() => userStore.currentUser?.email || 'Пользователь')

  const toggleDropdown = () => {
    showDropdown.value = !showDropdown.value
  }

  const closeDropdown = () => {
    showDropdown.value = false
  }

  const handleLogout = async () => {
    await authStore.logout()
    closeDropdown()
    router.push('/login')
  }
</script>
