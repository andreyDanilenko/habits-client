<template>
  <div class="relative">
    <Tooltip trigger="hover" placement="bottom">
      <template #trigger>
        <Button variant="ghost" size="sm" class="!p-1 rounded-full" @click="toggleDropdown">
          <div
            class="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-medium"
          >
            {{ userInitials }}
          </div>
        </Button>
      </template>

      <div class="w-56">
        <div class="px-3 pt-3 pb-2 border-b border-gray-300">
          <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Аккаунт</p>
          <p class="mt-1 text-sm font-medium text-gray-900 truncate">
            {{ userEmail }}
          </p>
        </div>

        <div class="py-2">
          <Button
            variant="ghost"
            size="sm"
            custom-class="w-full justify-start !px-4 !py-2"
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
            custom-class="w-full justify-start !px-4 !py-2"
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
            custom-class="w-full justify-start !px-4 !py-2 text-red-600"
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
