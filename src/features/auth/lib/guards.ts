import type { NavigationGuardNext, RouteLocationNormalized, Router } from 'vue-router'
import { useAuthStore } from '@/features/auth'
import { useUserStore } from '@/entities/user'
import { useWorkspaceStore } from '@/entities/workspace'

/** Вызывается при 401 — редирект на /login */
export const handleUnauthorized = async (_router: Router) => {
  const authStore = useAuthStore()
  const userStore = useUserStore()

  authStore.clearTokens()
  userStore.clearUser()

  const path = window.location.pathname
  if (
    path === '/login' ||
    path === '/register' ||
    path.startsWith('/auth/verify-email') ||
    path.startsWith('/invite/')
  ) {
    return
  }
  window.location.href = '/login'
}

/**
 * Авторизованный → только приватные страницы (дашборд и т.д.)
 * Неавторизованный → только публичные (login, register, verify-email, invite)
 */
export const authGuard = async (
  to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext,
) => {
  const userStore = useUserStore()

  // verify-email — ВСЕГДА разрешаем без проверок (токен в URL, пользователь ещё не создан)
  if (to.path.startsWith('/auth/verify-email')) {
    return next()
  }

  const isPublicRoute = to.meta.public === true || to.path.startsWith('/invite/')
  const hasUser = !!userStore.currentUser

  // Публичные страницы: login, register, invite
  if (isPublicRoute) {
    if (to.path.startsWith('/invite/')) {
      return next()
    }

    // Иногда при прямом заходе `currentUser` ещё не подгружен.
    // Тогда редирект не срабатывает до следующей навигации.
    // Попробуем один раз подтянуть текущего пользователя.
    if (!hasUser) {
      try {
        await userStore.fetchCurrentUser()
      } catch {
        // не залогинен -> остаёмся на публичной странице
      }
    }

    const nowHasUser = !!userStore.currentUser
    // Авторизованный на login/register → редирект на дашборд
    if (nowHasUser) {
      // Чтобы не попасть в circular dependency (auth -> workspace permissions -> auth),
      // не рассчитываем здесь "первый доступный модуль". Достаточно увести на общий приватный роут.
      return next({ path: '/profile', replace: true })
    }
    return next()
  }

  // Приватные страницы — требуют авторизации
  if (!hasUser) {
    try {
      await userStore.fetchCurrentUser()
    } catch {
      return next({ name: 'Login', replace: true })
    }
  }

  if (!userStore.currentUser) {
    return next({ name: 'Login', replace: true })
  }

  const workspaceStore = useWorkspaceStore()
  if (workspaceStore.workspaces?.length === 0) {
    try {
      await workspaceStore.fetchWorkspaces()
    } catch {
      // Ошибка загрузки workspaces — всё равно пускаем (create-workspace и т.д.)
    }
  }

  next()
}

export const requireAdmin = () => {
  return () => {
    const userStore = useUserStore()
    const role = userStore.currentUser?.role
    const isAdmin = role === 'ADMIN' || (typeof role === 'string' && role.toUpperCase() === 'ADMIN')
    if (!isAdmin) {
      return { path: '/' }
    }
    return true
  }
}
