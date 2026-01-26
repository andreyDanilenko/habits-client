import { createRouter, createWebHistory } from 'vue-router'
import { authGuard } from '@/features/auth'
import { requireOwner, requirePermission } from '@/entities/workspace'
import { modules } from '@/app/modules/config'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/pages/login'),
    meta: { public: true },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/pages/register'),
    meta: { public: true },
  },
  // Редирект с корня на первый доступный модуль или dashboard
  {
    path: '/',
    redirect: '/habits',
  },
  // Редиректы для старых роутов (обратная совместимость)
  {
    path: '/calendar',
    redirect: '/habits/calendar',
  },
  {
    path: '/journal',
    redirect: '/habits/journal',
  },
  {
    path: '/journal/new',
    redirect: '/habits/journal/new',
  },
  {
    path: '/journal/:id',
    redirect: (to) => `/habits/journal/${to.params.id}`,
  },
  {
    path: '/journal/:id/edit',
    redirect: (to) => `/habits/journal/${to.params.id}/edit`,
  },
  // Настройки (общие, не модульные)
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/pages/settings'),
    meta: { requiresAuth: true },
  },
  {
    path: '/workspace-settings',
    name: 'WorkspaceSettings',
    component: () => import('@/pages/workspace-settings'),
    meta: { requiresAuth: true },
    beforeEnter: requireOwner(),
  },
]

// Добавляем роуты из модулей
modules.forEach((module) => {
  module.routes.forEach((route) => {
    routes.push({
      path: route.path,
      name: route.name,
      component: route.component,
      meta: {
        requiresAuth: true,
        module: module.id,
        ...route.meta,
      },
      beforeEnter:
        route.permissions && route.permissions.length > 0
          ? requirePermission(route.permissions[0])
          : undefined,
    })
  })
})

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(authGuard)

export default router
