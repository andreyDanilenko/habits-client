<template>
  <div class="relative">
    <button
      class="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
      @click="toggleDropdown"
    >
      <div
        class="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-medium"
      >
        {{ userInitials }}
      </div>
    </button>

    <!-- Dropdown меню -->
    <div
      v-if="showDropdown"
      class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-50"
    >
      <div class="py-2">
        <div class="px-4 py-2 border-b">
          <p class="text-sm font-medium text-gray-900">{{ userEmail }}</p>
        </div>
        <router-link
          to="/profile"
          class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          @click="closeDropdown"
        >
          Профиль
        </router-link>
        <router-link
          to="/settings"
          class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          @click="closeDropdown"
        >
          Настройки
        </router-link>
        <button
          class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
          @click="handleLogout"
        >
          Выйти
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  import { useRouter } from 'vue-router'
  import { useUserStore } from '@/entities/user'
  import { useAuthStore } from '@/features/auth'

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
