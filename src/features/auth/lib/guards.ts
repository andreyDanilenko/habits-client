import type { NavigationGuardNext, RouteLocationNormalized, Router } from 'vue-router'
import { useAuthStore } from '@/features/auth'
import { useUserStore } from '@/entities/user'
import { useWorkspaceStore } from '@/entities/workspace'

export const handleUnauthorized = async (router: Router) => {
  const authStore = useAuthStore()
  const userStore = useUserStore()

  authStore.clearTokens()
  userStore.clearUser()

  const currentRoute = router.currentRoute.value
  const isPublicRoute = currentRoute.meta.public === true

  if (!isPublicRoute) {
    try {
      await router.push({ name: 'Login' })
    } catch (error) {
      console.error('Failed to redirect via router:', error)
      window.location.href = '/login'
    }
  }
}

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
    console.log('authGuard: not authenticated, redirecting to login')
    return next({ name: 'Login' })
  }

  if (!userStore.currentUser) {
    try {
      await userStore.fetchCurrentUser()
    } catch (error) {
      console.error('authGuard: failed to fetch currentUser', error)
      await authStore.logout()
      return next({ name: 'Login' })
    }
  }

  const workspaceStore = useWorkspaceStore()
  if (workspaceStore.workspaces.length === 0) {
    await workspaceStore.fetchWorkspaces()
  }

  next()
}
