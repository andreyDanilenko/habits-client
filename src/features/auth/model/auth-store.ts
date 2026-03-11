import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '@/features/auth'
import { useUserStore } from '@/entities/user'
import { useWorkspaceStore } from '@/entities/workspace'
import type { LoginDto, RegisterDto, AuthResponse, EffectivePermissions } from '@/features/auth'

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref<string | null>(null)
  const refreshToken = ref<string | null>(null)
  const isLoading = ref(false)
  const effectivePermissions = ref<EffectivePermissions | null>(null)

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
      await authService.login(credentials)

      const userStore = useUserStore()
      await userStore.fetchCurrentUser()

      accessToken.value = 'cookie-based'
      refreshToken.value = 'cookie-based'

      // Очищаем workspace store, чтобы при следующей навигации загрузились актуальные данные
      useWorkspaceStore().clearWorkspaces()

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
      const result = await authService.register(data)

      if (result.pendingVerification) {
        return { success: true, pendingVerification: true, message: result.message }
      }

      const userStore = useUserStore()
      await userStore.fetchCurrentUser()

      accessToken.value = 'cookie-based'
      refreshToken.value = 'cookie-based'

      useWorkspaceStore().clearWorkspaces()

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
      effectivePermissions.value = null
      useUserStore().clearUser()
      useWorkspaceStore().clearWorkspaces()
    }
  }

  const refresh = async () => {
    try {
      // Сервер обновляет токены в HttpOnly куках (refresh_token передаётся автоматически)
      await authService.refresh()

      const userStore = useUserStore()
      await userStore.fetchCurrentUser()

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

  const loadEffectivePermissions = async () => {
    const workspaceStore = useWorkspaceStore()
    const currentWorkspace = workspaceStore.currentWorkspace
    if (!currentWorkspace) {
      effectivePermissions.value = null
      return
    }
    try {
      effectivePermissions.value = await authService.getEffectivePermissions(currentWorkspace.id)
    } catch (error) {
      console.error('Failed to load effective permissions:', error)
      effectivePermissions.value = null
    }
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
        await loadEffectivePermissions()
      }
    } catch (error: any) {
      // Очищаем токены только если получили 401 (неавторизован)
      // Другие ошибки могут быть временными (сеть, сервер и т.д.)
      if (error?.response?.status === 401) {
        clearTokens()
        effectivePermissions.value = null
      }
    }
  }

  return {
    // State
    accessToken,
    refreshToken,
    isLoading,
    effectivePermissions,

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
    loadEffectivePermissions,
  }
})
