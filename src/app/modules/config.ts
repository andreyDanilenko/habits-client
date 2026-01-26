import { WorkspacePermission } from '@/entities/workspace'
import { WorkspaceRole } from '@/entities/user'
import type { Component } from 'vue'
import {
  DashboardIcon,
  ListIcon,
  CalendarIcon,
  BookIcon,
  HabitsIcon,
  PlusIcon,
  CheckIcon,
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
        path: '/habits',
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
      {
        path: '/habits/journal/new',
        name: 'HabitsJournalNew',
        label: 'Новая запись',
        icon: PlusIcon,
        component: () => import('@/pages/journal-editor'),
        permissions: [WorkspacePermission.JOURNAL_CREATE],
      },
      {
        path: '/habits/journal/:id',
        name: 'HabitsJournalView',
        label: 'Просмотр записи',
        icon: CheckIcon,
        component: () => import('@/pages/journal-view'),
        permissions: [WorkspacePermission.JOURNAL_VIEW],
        meta: { hideFromMenu: true },
      },
      {
        path: '/habits/journal/:id/edit',
        name: 'HabitsJournalEdit',
        label: 'Редактирование',
        icon: CheckIcon,
        component: () => import('@/pages/journal-editor'),
        permissions: [WorkspacePermission.JOURNAL_EDIT],
        meta: { hideFromMenu: true },
      },
    ],
  },
  // Здесь будут добавлены другие модули в будущем
  // {
  //   id: 'tasks',
  //   label: 'Задачи',
  //   icon: TaskIcon,
  //   basePath: '/tasks',
  //   routes: [...]
  // },
]

/**
 * Получить все доступные модули для текущего пользователя
 */
export function getAvailableModules(hasPermission: (permission: WorkspacePermission) => boolean): Module[] {
  return modules.filter((module) => {
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
  hasPermission: (permission: WorkspacePermission) => boolean
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
