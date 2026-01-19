import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '@/features/auth'
import { useUserStore } from '@/entities/user'
import type { LoginDto, RegisterDto, AuthResponse } from '@/features/auth'

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref<string | null>(null)
  const refreshToken = ref<string | null>(null)
  const isLoading = ref(false)

  // Getters
  // Используем currentUser из userStore для проверки аутентификации,
  // так как токены хранятся в HttpOnly куках и недоступны из JavaScript
  const isAuthenticated = computed(() => {
    const userStore = useUserStore()
    return !!userStore.currentUser
  })

  // Actions
  const login = async (credentials: LoginDto) => {
    isLoading.value = true
    try {
      // Сервер устанавливает токены в HttpOnly куки, поэтому нам не нужно
      // сохранять их в store. Вместо этого проверяем успешность логина
      // через fetchCurrentUser
      await authService.login(credentials)
      
      // После успешного логина получаем информацию о пользователе
      // чтобы установить состояние аутентификации
      const userStore = useUserStore()
      await userStore.fetchCurrentUser()
      
      // Устанавливаем флаги для совместимости (токены в куках)
      accessToken.value = 'cookie-based'
      refreshToken.value = 'cookie-based'
      
      return { success: true }
    } catch (error) {
      console.error('Login failed:', error)
      clearTokens()
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const register = async (data: RegisterDto) => {
    isLoading.value = true
    try {
      // Сервер устанавливает токены в HttpOnly куки, поэтому нам не нужно
      // сохранять их в store. Вместо этого проверяем успешность регистрации
      // через fetchCurrentUser
      await authService.register(data)
      
      // После успешной регистрации получаем информацию о пользователе
      // чтобы установить состояние аутентификации
      const userStore = useUserStore()
      await userStore.fetchCurrentUser()
      
      // Устанавливаем флаги для совместимости (токены в куках)
      accessToken.value = 'cookie-based'
      refreshToken.value = 'cookie-based'
      
      return { success: true }
    } catch (error) {
      console.error('Registration failed:', error)
      clearTokens()
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
    // Проверяем, что пользователь аутентифицирован
    const userStore = useUserStore()
    if (!userStore.currentUser) {
      throw new Error('No authenticated user')
    }

    try {
      // Сервер обновляет токены в HttpOnly куках
      await authService.refresh('cookie-based')
      
      // После успешного обновления проверяем пользователя
      await userStore.fetchCurrentUser()
      
      // Устанавливаем флаги для совместимости
      accessToken.value = 'cookie-based'
      refreshToken.value = 'cookie-based'
      
      return { success: true }
    } catch (error) {
      clearTokens()
      throw error
    }
  }

  const setTokens = (response: AuthResponse) => {
    accessToken.value = response.accessToken
    refreshToken.value = response.refreshToken
  }

  const clearTokens = () => {
    accessToken.value = null
    refreshToken.value = null
  }

  const initAuth = async () => {
    try {
      const userStore = useUserStore()
      // Проверяем аутентификацию через /auth/me
      // Если запрос успешен, значит куки валидны и пользователь аутентифицирован
      await userStore.fetchCurrentUser()
      
      // Если fetchCurrentUser успешен, устанавливаем флаги для совместимости
      if (userStore.currentUser) {
        accessToken.value = 'cookie-based'
        refreshToken.value = 'cookie-based'
      }
    } catch (error: any) {
      // Очищаем токены только если получили 401 (неавторизован)
      // Другие ошибки могут быть временными (сеть, сервер и т.д.)
      if (error?.response?.status === 401) {
        clearTokens()
      }
      // Тихая обработка ошибки при инициализации - не логируем в консоль
      // так как это нормально для неавторизованных пользователей
    }
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
    initAuth,
  }
})
