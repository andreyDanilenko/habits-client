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
    const u = currentUser.value
    if (!u?.email) return 'U'
    if (u.name) {
      const parts = u.name.trim().split(/\s+/)
      if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      }
      return u.name.slice(0, 2).toUpperCase()
    }
    return u.email[0].toUpperCase()
  })

  // Actions
  const fetchCurrentUser = async () => {
    isLoading.value = true
    try {
      const { userService } = await import('@/entities/user')
      const user = await userService.getCurrentUser()
      currentUser.value = user
      return user
    } catch (error) {
      console.error('Failed to fetch user:', error)
      currentUser.value = null
      throw error // Пробрасываем ошибку дальше, чтобы initAuth мог её обработать
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
