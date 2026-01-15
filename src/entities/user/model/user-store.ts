import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/entities/user'

export const useUserStore = defineStore('user', () => {
  // State
  const currentUser = ref<User | null>(null)
  const isLoading = ref(false)

  // Getters
  const isAuthenticated = computed(() => !!currentUser.value)

  const userInitials = computed(() => {
    if (!currentUser.value?.email) return 'U'
    return currentUser.value.email[0].toUpperCase()
  })

  // Actions
  const fetchCurrentUser = async () => {
    isLoading.value = true
    try {
      const { userService } = await import('@/entities/user')
      const user = await userService.getCurrentUser()
      currentUser.value = user
    } catch (error) {
      console.error('Failed to fetch user:', error)
      currentUser.value = null
    } finally {
      isLoading.value = false
    }
  }

  const setUser = (user: User) => {
    currentUser.value = user
  }

  const clearUser = () => {
    currentUser.value = null
  }

  // Return
  return {
    // State
    currentUser,
    isLoading,

    // Getters
    isAuthenticated,
    userInitials,

    // Actions
    fetchCurrentUser,
    setUser,
    clearUser,
  }
})
