import { useI18n } from 'vue-i18n'
import { setLocale } from '@/shared/lib/i18n'
import type { SidebarNavItem } from '../types'
import type { Module, ModuleRoute } from '@/app/modules/config'

const MODULE_LABEL_KEYS: Record<string, string> = {
  habits: 'sidebar.modules.habits',
  crm: 'sidebar.modules.crm',
  projects: 'sidebar.modules.projects',
  tasks: 'sidebar.modules.tasks',
  notes: 'sidebar.modules.notes',
  inventory: 'sidebar.modules.inventory',
  finance: 'sidebar.modules.finance',
  hr: 'sidebar.modules.hr',
}

const ROUTE_LABEL_KEYS: Record<string, Record<string, string>> = {
  habits: {
    HabitsDashboard: 'sidebar.routes.habits.dashboard',
    HabitsList: 'sidebar.routes.habits.list',
    HabitsCalendar: 'sidebar.routes.habits.calendar',
    HabitsJournal: 'sidebar.routes.habits.journal',
    HabitsActivity: 'sidebar.routes.habits.activity',
  },
  crm: {
    CrmContacts: 'sidebar.routes.crm.contacts',
    CrmCompanies: 'sidebar.routes.crm.companies',
    CrmDeals: 'sidebar.routes.crm.deals',
    CrmPipelines: 'sidebar.routes.crm.pipelines',
  },
  projects: {
    ProjectsList: 'sidebar.routes.projects.list',
  },
  tasks: {
    TasksList: 'sidebar.routes.tasks.list',
  },
  notes: {
    NotesList: 'sidebar.routes.notes.list',
  },
  inventory: {
    InventoryStub: 'sidebar.modules.inventory',
  },
  finance: {
    FinanceStub: 'sidebar.modules.finance',
  },
  hr: {
    HrStub: 'sidebar.modules.hr',
  },
}

/**
 * Централизованный хук для i18n сайдбара.
 * Обеспечивает переводы секций, модулей, роутов и действий.
 */
export function useSidebarI18n() {
  const { t, locale } = useI18n()

  const sectionTitle = (key: 'workspaces' | 'modules' | 'footer') =>
    t(`sidebar.sections.${key}`)

  const moduleLabel = (moduleId: string, fallback: string) =>
    t(MODULE_LABEL_KEYS[moduleId] ?? 'sidebar.modules.unknown', fallback)

  const routeLabel = (moduleId: string, routeName: string, fallback: string) => {
    const moduleRoutes = ROUTE_LABEL_KEYS[moduleId]
    const key = moduleRoutes?.[routeName]
    return key ? t(key, fallback) : fallback
  }

  const actionLabel = (key: 'expand' | 'collapse' | 'closeMenu' | 'language') =>
    t(`sidebar.actions.${key}`)

  const footerLabel = (id: string, fallback: string) => {
    const keyMap: Record<string, string> = {
      admin: 'sidebar.footer.admin',
      'workspace-settings': 'sidebar.footer.workspaceSettings',
      logout: 'sidebar.footer.logout',
    }
    return t(keyMap[id] ?? id, fallback)
  }

  const translateModuleLabel = (module: Module) => ({
    ...module,
    label: moduleLabel(module.id, module.label),
  })

  const translateRouteLabel = (moduleId: string) => (route: ModuleRoute) => ({
    ...route,
    label: routeLabel(moduleId, route.name, route.label),
  })

  const translateNavItem = (
    item: SidebarNavItem,
    getLabel: (id: string, fallback: string) => string,
  ): SidebarNavItem => ({
    ...item,
    label: getLabel(item.id, item.label),
  })

  return {
    t,
    locale,
    setLocale,
    sectionTitle,
    moduleLabel,
    routeLabel,
    actionLabel,
    footerLabel,
    translateModuleLabel,
    translateRouteLabel,
    translateNavItem,
  }
}

export { SUPPORTED_LOCALES } from '@/shared/lib/i18n'
export type { SupportedLocale } from '@/shared/lib/i18n'
