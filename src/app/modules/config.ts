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
  headerComponent?: () => Promise<{ default: Component } | Component>
}

export const modules: Module[] = [
  {
    id: 'habits',
    label: 'Привычки',
    icon: HabitsIcon,
    basePath: '/habits',
    permissions: [WorkspacePermission.HABITS_VIEW],
    headerComponent: () => import('@/widgets/header/ui/TodayStats.vue'),
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
  {
    id: 'notes',
    label: 'Заметки',
    icon: BookIcon,
    basePath: '/notes',
    permissions: [WorkspacePermission.NOTES_VIEW],
    routes: [
      {
        path: '/notes/list',
        name: 'NotesList',
        label: 'Список',
        icon: ListIcon,
        component: () => import('@/pages/notes'),
        permissions: [WorkspacePermission.NOTES_VIEW],
      },
    ],
  },
  {
    id: 'inventory',
    label: 'Склад',
    icon: ListIcon,
    basePath: '/inventory',
    routes: [
      {
        path: '/inventory',
        name: 'InventoryStub',
        label: 'Склад',
        icon: ListIcon,
        component: () => import('@/pages/module-stub'),
        meta: { stubLabel: 'Склад' },
      },
    ],
  },
  {
    id: 'finance',
    label: 'Финансы',
    icon: ListIcon,
    basePath: '/finance',
    routes: [
      {
        path: '/finance',
        name: 'FinanceStub',
        label: 'Финансы',
        icon: ListIcon,
        component: () => import('@/pages/module-stub'),
        meta: { stubLabel: 'Финансы' },
      },
    ],
  },
  {
    id: 'hr',
    label: 'HR',
    icon: ListIcon,
    basePath: '/hr',
    routes: [
      {
        path: '/hr',
        name: 'HrStub',
        label: 'HR',
        icon: ListIcon,
        component: () => import('@/pages/module-stub'),
        meta: { stubLabel: 'HR' },
      },
    ],
  },
]

/**
 * Определить модуль по текущему пути (для шапки, сайдбара и т.д.).
 * Выбирается модуль с самым длинным basePath, подходящим под path.
 */
export function getModuleByPath(path: string): Module | undefined {
  let best: Module | undefined
  for (const m of modules) {
    if (path === m.basePath || path.startsWith(m.basePath + '/')) {
      if (!best || m.basePath.length > best.basePath.length) {
        best = m
      }
    }
  }
  return best
}

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
