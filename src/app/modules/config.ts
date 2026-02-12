import { WorkspacePermission } from '@/entities/workspace'
import { WorkspaceRole } from '@/entities/user'
import type { Component } from 'vue'
import {
  DashboardIcon,
  ListIcon,
  CalendarIcon,
  BookIcon,
  HabitsIcon,
  CrmIcon,
} from '@/shared/ui/icon'

export interface ModuleRoute {
  path: string
  name: string
  label: string
  icon: Component | { template: string }
  component: () => Promise<any>
  permissions?: WorkspacePermission[]
  roles?: WorkspaceRole[]
  meta?: Record<string, any>
}

export interface Module {
  id: string
  label: string
  icon: Component | { template: string }
  basePath: string
  routes: ModuleRoute[]
  permissions?: WorkspacePermission[]
  roles?: WorkspaceRole[]
}

export const modules: Module[] = [
  {
    id: 'habits',
    label: 'Привычки',
    icon: HabitsIcon,
    basePath: '/habits',
    permissions: [WorkspacePermission.HABITS_VIEW],
    routes: [
      {
        path: '/habits/dashboard',
        name: 'HabitsDashboard',
        label: 'Дашборд',
        icon: DashboardIcon,
        component: () => import('@/pages/dashboard'),
        permissions: [WorkspacePermission.HABITS_VIEW],
      },
      {
        path: '/habits/list',
        name: 'HabitsList',
        label: 'Список',
        icon: ListIcon,
        component: () => import('@/pages/habits'),
        permissions: [WorkspacePermission.HABITS_VIEW],
      },
      {
        path: '/habits/calendar',
        name: 'HabitsCalendar',
        label: 'Календарь',
        icon: CalendarIcon,
        component: () => import('@/pages/calendar'),
        permissions: [WorkspacePermission.HABITS_VIEW],
      },
      {
        path: '/habits/journal',
        name: 'HabitsJournal',
        label: 'Дневник',
        icon: BookIcon,
        component: () => import('@/pages/journal'),
        permissions: [WorkspacePermission.JOURNAL_VIEW],
      },
    ],
  },
  {
    id: 'crm',
    label: 'CRM',
    icon: CrmIcon,
    basePath: '/crm',
    permissions: [WorkspacePermission.CRM_VIEW],
    routes: [
      {
        path: '/crm/contacts',
        name: 'CrmContacts',
        label: 'Контакты',
        icon: ListIcon,
        component: () => import('@/pages/crm'),
        permissions: [WorkspacePermission.CRM_VIEW],
      },
    ],
  },
]

/**
 * Получить модули, доступные в текущем workspace и по правам пользователя.
 * @param enabledModuleCodes — коды модулей, включённых в workspace (из API workspace_modules).
 * @param hasPermission — проверка права (роль в workspace).
 */
export function getAvailableModules(
  enabledModuleCodes: string[],
  hasPermission: (permission: WorkspacePermission) => boolean,
): Module[] {
  return modules.filter((module) => {
    if (!enabledModuleCodes.includes(module.id)) {
      return false
    }
    if (!module.permissions || module.permissions.length === 0) {
      return true
    }
    return module.permissions.some((permission) => hasPermission(permission))
  })
}

/**
 * Получить доступные роуты модуля для текущего пользователя
 */
export function getAvailableModuleRoutes(
  module: Module,
  hasPermission: (permission: WorkspacePermission) => boolean,
): ModuleRoute[] {
  return module.routes.filter((route) => {
    if (route.meta?.hideFromMenu) {
      return false
    }
    if (!route.permissions || route.permissions.length === 0) {
      return true
    }
    return route.permissions.some((permission) => hasPermission(permission))
  })
}
