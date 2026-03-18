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
  BellIcon,
  CheckCircleIcon,
  IconDeals,
  IconContacts,
  IconCompanies,
  IconFunnel,
  IconProjects,
  IconInventory,
  IconFinance,
  IconHr,
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
        component: () => import('@/pages/habits/dashboard'),
        permissions: [WorkspacePermission.HABITS_VIEW],
      },
      {
        path: '/habits/list',
        name: 'HabitsList',
        label: 'Список',
        icon: ListIcon,
        component: () => import('@/pages/habits/list'),
        permissions: [WorkspacePermission.HABITS_VIEW],
      },
      {
        path: '/habits/calendar',
        name: 'HabitsCalendar',
        label: 'Календарь',
        icon: CalendarIcon,
        component: () => import('@/pages/habits/calendar'),
        permissions: [WorkspacePermission.HABITS_VIEW],
      },
      {
        path: '/habits/journal',
        name: 'HabitsJournal',
        label: 'Дневник',
        icon: BookIcon,
        component: () => import('@/pages/habits/journal'),
        permissions: [WorkspacePermission.JOURNAL_VIEW],
      },
      {
        path: '/habits/activity',
        name: 'HabitsActivity',
        label: 'Активность',
        icon: BellIcon,
        component: () => import('@/pages/habits/activity'),
        permissions: [WorkspacePermission.HABITS_VIEW],
      },
    ],
  },
  {
    id: 'crm',
    label: 'CRM',
    icon: CrmIcon,
    basePath: '/crm',
    permissions: [
      WorkspacePermission.CRM_CONTACT_VIEW,
      WorkspacePermission.CRM_COMPANY_VIEW,
      WorkspacePermission.CRM_DEAL_VIEW,
      WorkspacePermission.CRM_PIPELINE_MANAGE,
    ],
    routes: [
      {
        path: '/crm/contacts',
        name: 'CrmContacts',
        label: 'Контакты',
        icon: IconContacts,
        component: () => import('@/pages/crm'),
        permissions: [WorkspacePermission.CRM_CONTACT_VIEW],
      },
      {
        path: '/crm/contacts/:id',
        name: 'CrmContactDetail',
        label: 'Контакт',
        icon: IconContacts,
        component: () => import('@/pages/crm/contact-detail'),
        permissions: [WorkspacePermission.CRM_CONTACT_VIEW],
        meta: { hideFromMenu: true },
      },
      {
        path: '/crm/companies',
        name: 'CrmCompanies',
        label: 'Компании',
        icon: IconCompanies,
        component: () => import('@/pages/crm/companies'),
        permissions: [WorkspacePermission.CRM_COMPANY_VIEW],
      },
      {
        path: '/crm/companies/:id',
        name: 'CrmCompanyDetail',
        label: 'Компания',
        icon: IconCompanies,
        component: () => import('@/pages/crm/company-detail'),
        permissions: [WorkspacePermission.CRM_COMPANY_VIEW],
        meta: { hideFromMenu: true },
      },
      {
        path: '/crm/deals',
        name: 'CrmDeals',
        label: 'Сделки',
        icon: IconDeals,
        component: () => import('@/pages/crm/deals'),
        permissions: [WorkspacePermission.CRM_DEAL_VIEW],
      },
      {
        path: '/crm/deals/:id',
        name: 'CrmDealDetail',
        label: 'Карточка сделки',
        icon: IconDeals,
        component: () => import('@/pages/crm/deal-detail'),
        permissions: [WorkspacePermission.CRM_DEAL_VIEW],
        meta: { hideFromMenu: true },
      },
      {
        path: '/crm/pipelines',
        name: 'CrmPipelines',
        label: 'Воронки продаж',
        icon: IconFunnel,
        component: () => import('@/pages/crm/pipelines'),
        permissions: [WorkspacePermission.CRM_PIPELINE_MANAGE],
      },
    ],
  },
  {
    id: 'projects',
    label: 'Проекты',
    icon: IconProjects,
    basePath: '/projects',
    permissions: [WorkspacePermission.PROJECT_VIEW],
    routes: [
      {
        path: '/projects',
        name: 'ProjectsList',
        label: 'Проекты',
        icon: IconProjects,
        component: () => import('@/pages/projects'),
        permissions: [WorkspacePermission.PROJECT_VIEW],
      },
      {
        path: '/projects/:id',
        name: 'ProjectDetail',
        label: 'Проект',
        icon: IconProjects,
        component: () => import('@/pages/projects/detail'),
        permissions: [WorkspacePermission.PROJECT_VIEW],
        meta: { hideFromMenu: true },
      },
      {
        path: '/projects/:id/crm',
        name: 'ProjectCrm',
        label: 'CRM в проекте',
        icon: CrmIcon,
        component: () => import('@/pages/projects/crm'),
        permissions: [WorkspacePermission.PROJECT_VIEW],
        meta: { hideFromMenu: true },
      },
    ],
  },
  {
    id: 'tasks',
    label: 'Задачи',
    icon: CheckCircleIcon,
    basePath: '/tasks',
    routes: [
      {
        path: '/tasks',
        name: 'TasksList',
        label: 'Мои задачи',
        icon: ListIcon,
        component: () => import('@/pages/tasks'),
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
    icon: IconInventory,
    basePath: '/inventory',
    routes: [
      {
        path: '/inventory',
        name: 'InventoryStub',
        label: 'Склад',
        icon: IconInventory,
        component: () => import('@/pages/module-stub'),
        meta: { stubLabel: 'Склад' },
      },
    ],
  },
  {
    id: 'finance',
    label: 'Финансы',
    icon: IconFinance,
    basePath: '/finance',
    routes: [
      {
        path: '/finance',
        name: 'FinanceStub',
        label: 'Финансы',
        icon: IconFinance,
        component: () => import('@/pages/module-stub'),
        meta: { stubLabel: 'Финансы' },
      },
    ],
  },
  {
    id: 'hr',
    label: 'HR',
    icon: IconHr,
    basePath: '/hr',
    routes: [
      {
        path: '/hr',
        name: 'HrStub',
        label: 'HR',
        icon: IconHr,
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
