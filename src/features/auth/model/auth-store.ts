import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '@/features/auth/api/auth-service'
import { useUserStore } from '@/entities/user'
import type { LoginDto, RegisterDto, AuthResponse } from '@/features/auth/types/auth'

export const useAuthStore = defineStore('auth', () => {
  // State
  const accessToken = ref<string | null>(localStorage.getItem('accessToken'))
  const refreshToken = ref<string | null>(localStorage.getItem('refreshToken'))
  const isLoading = ref(false)

  // Getters
  const isAuthenticated = computed(() => !!accessToken.value)

  // Actions
  const login = async (credentials: LoginDto) => {
    isLoading.value = true
    try {
      const response = await authService.login(credentials)
      setTokens(response)
      return response
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const register = async (data: RegisterDto) => {
    isLoading.value = true
    try {
      const response = await authService.register(data)
      setTokens(response)
      return response
    } catch (error) {
      console.error('Registration failed:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const logout = async () => {
    try {
      await authService.logout()
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      clearTokens()
      const userStore = useUserStore()
      userStore.clearUser()
    }
  }

  const refresh = async () => {
    if (!refreshToken.value) {
      throw new Error('No refresh token')
    }

    try {
      const response = await authService.refresh(refreshToken.value)
      setTokens(response)
      return response
    } catch (error) {
      clearTokens()
      throw error
    }
  }

  const setTokens = (response: AuthResponse) => {
    accessToken.value = response.accessToken
    refreshToken.value = response.refreshToken

    localStorage.setItem('accessToken', response.accessToken)
    localStorage.setItem('refreshToken', response.refreshToken)
  }

  const clearTokens = () => {
    accessToken.value = null
    refreshToken.value = null

    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
  }

  return {
    // State
    accessToken,
    refreshToken,
    isLoading,

    // Getters
    isAuthenticated,

    // Actions
    login,
    register,
    logout,
    refresh,
    setTokens,
    clearTokens,
  }
})
