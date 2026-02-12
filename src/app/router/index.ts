import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { authGuard, requireAdmin } from '@/features/auth'
import { requireOwner, requirePermission, requireModuleEnabled } from '@/entities/workspace'
import { modules, getAvailableModules } from '@/app/modules/config'

const routes: RouteRecordRaw[] = [
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
    redirect: '/habits/dashboard',
  },
  // Редирект с /habits на дашборд
  {
    path: '/habits',
    redirect: '/habits/dashboard',
  },
  // Редирект с /crm на контакты
  {
    path: '/crm',
    redirect: '/crm/contacts',
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
    redirect: (to: any) => `/habits/journal/${to.params.id}`,
  },
  {
    path: '/journal/:id/edit',
    redirect: (to: any) => `/habits/journal/${to.params.id}/edit`,
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
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('@/pages/admin'),
    meta: { requiresAuth: true },
    beforeEnter: requireAdmin(),
  },
]

// Добавляем роуты из модулей (доступ к роуту = модуль включён в workspace + право)
modules.forEach((module) => {
  module.routes.forEach((route) => {
    const record: RouteRecordRaw = {
      path: route.path,
      name: route.name,
      component: route.component,
      meta: {
        requiresAuth: true,
        module: module.id,
        ...route.meta,
      },
      beforeEnter: (to, _from, next) => {
        const moduleGuard = requireModuleEnabled(getAvailableModules)
        const moduleResult = moduleGuard(to)
        if (moduleResult !== true) {
          next(moduleResult)
          return
        }
        if (route.permissions && route.permissions.length > 0) {
          const permResult = requirePermission(route.permissions[0])()
          if (permResult !== true) {
            next(permResult)
            return
          }
        }
        next()
      },
    }
    routes.push(record)
  })
})

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(authGuard)

export default router
