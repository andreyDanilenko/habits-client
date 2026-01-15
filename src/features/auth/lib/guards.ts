import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import { useAuthStore } from '@/features/auth/model/auth-store'
import { useUserStore } from '@/entities/user/model/user-store'
import { useWorkspaceStore } from '@/entities/workspace/model/workspace-store'

export const authGuard = async (
  to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext,
) => {
  const authStore = useAuthStore()
  const userStore = useUserStore()

  if (to.meta.public) {
    return next()
  }

  if (!authStore.isAuthenticated) {
    return next({ name: 'Login' })
  }

  if (!userStore.currentUser) {
    try {
      await userStore.fetchCurrentUser()
    } catch (error) {
      await authStore.logout()
      return next({ name: 'Login' })
    }
  }

  // Загружаем workspace после успешной авторизации
  const workspaceStore = useWorkspaceStore()
  if (workspaceStore.workspaces.length === 0) {
    await workspaceStore.fetchWorkspaces()
  }

  next()
}
