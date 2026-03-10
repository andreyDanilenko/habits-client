import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw, RouteLocationNormalized, NavigationGuardNext } from 'vue-router'
import { authGuard, requireAdmin } from '@/features/auth'
import {
  requireOwnerOrAdmin,
  requirePermission,
  requireModuleEnabled,
  requireWorkspace,
  usePermissions,
  useWorkspaceStore,
} from '@/entities/workspace'
import { modules, getAvailableModules, getAvailableModuleRoutes } from '@/app/modules/config'

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
  {
    path: '/create-workspace',
    name: 'CreateWorkspace',
    component: () => import('@/pages/create-workspace'),
    meta: { requiresAuth: true, noWorkspaceAllowed: true },
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
  // Редирект с /crm на первый доступный роут CRM по правам
  {
    path: '/crm',
    redirect: () => {
      const workspaceStore = useWorkspaceStore()
      const { hasPermission } = usePermissions()
      const enabled = workspaceStore.enabledModules
      const available = getAvailableModules(enabled, hasPermission)
      const crmModule = available.find((m) => m.id === 'crm')
      if (crmModule) {
        const routes = getAvailableModuleRoutes(crmModule, hasPermission)
        if (routes.length > 0) {
          return { path: routes[0].path }
        }
      }
      return { path: '/habits/dashboard' }
    },
  },
  // Редирект с /notes на список
  {
    path: '/notes',
    redirect: '/notes/list',
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
    path: '/settings/members',
    name: 'SettingsMembers',
    component: () => import('@/pages/settings/members'),
    meta: { requiresAuth: true },
    beforeEnter: requireOwnerOrAdmin(),
  },
  {
    path: '/workspace-settings',
    name: 'WorkspaceSettings',
    component: () => import('@/pages/workspace-settings'),
    meta: { requiresAuth: true },
    beforeEnter: requireOwnerOrAdmin(),
  },
  {
    path: '/workspace-settings/roles',
    name: 'WorkspaceRoles',
    component: () => import('@/pages/workspace-settings/roles'),
    meta: { requiresAuth: true },
    beforeEnter: requireOwnerOrAdmin(),
  },
  {
    path: '/workspace-modules',
    name: 'WorkspaceModules',
    component: () => import('@/pages/workspace-modules'),
    meta: { requiresAuth: true },
    beforeEnter: requireWorkspace(),
  },
  {
    path: '/module-activation/:moduleCode',
    name: 'ModuleActivation',
    redirect: (to: RouteLocationNormalized) => ({
      path: '/billing',
      query: { module: to.params.moduleCode as string },
    }),
    meta: { requiresAuth: true },
  },
  {
    path: '/billing',
    name: 'Billing',
    component: () => import('@/pages/billing'),
    meta: { requiresAuth: true },
    beforeEnter: requireAdmin(),
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('@/pages/admin'),
    meta: { requiresAuth: true },
    beforeEnter: requireAdmin(),
  },
]

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
      beforeEnter: (
        to: RouteLocationNormalized,
        _from: RouteLocationNormalized,
        next: NavigationGuardNext,
      ) => {
        const moduleGuard = requireModuleEnabled(getAvailableModules)
        const moduleResult = moduleGuard(to)
        if (moduleResult !== true) {
          const redirectPath =
            typeof moduleResult === 'object' && 'path' in moduleResult ? moduleResult.path : null
          if (redirectPath && redirectPath === to.path) {
            next()
            return
          }
          next(moduleResult)
          return
        }
        if (route.permissions && route.permissions.length > 0) {
          const permResult = requirePermission(route.permissions[0])()
          if (permResult !== true) {
            const permRedirectPath =
              typeof permResult === 'object' && 'path' in permResult ? permResult.path : null
            if (permRedirectPath && permRedirectPath === to.path) {
              next()
              return
            }
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
