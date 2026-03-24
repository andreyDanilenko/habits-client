import { computed } from 'vue'
import { useUserStore } from '@/entities/user'
import { useWorkspaceStore } from '../model/workspace-store'
import { useAuthStore } from '@/features/auth'
import { WorkspaceRole } from '@/entities/user'
import type { PermissionString } from '@/entities/role'

export enum WorkspacePermission {
  WORKSPACE_VIEW = 'workspace:view',
  WORKSPACE_EDIT = 'workspace:edit',
  WORKSPACE_DELETE = 'workspace:delete',

  MEMBERS_VIEW = 'members:view',
  MEMBERS_INVITE = 'members:invite',
  MEMBERS_REMOVE = 'members:remove',
  MEMBERS_EDIT_ROLE = 'members:edit_role',

  MODULES_VIEW = 'modules:view',
  MODULES_EDIT = 'modules:edit',

  PERMISSIONS_VIEW = 'permissions:view',
  PERMISSIONS_EDIT = 'permissions:edit',

  HABITS_VIEW = 'habits:view',
  HABITS_CREATE = 'habits:create',
  HABITS_EDIT = 'habits:edit',
  HABITS_DELETE = 'habits:delete',

  JOURNAL_VIEW = 'journal:view',
  JOURNAL_CREATE = 'journal:create',
  JOURNAL_EDIT = 'journal:edit',
  JOURNAL_DELETE = 'journal:delete',

  CRM_VIEW = 'crm:view',
  CRM_CONTACT_VIEW = 'crm:contact:view',
  CRM_COMPANY_VIEW = 'crm:company:view',
  CRM_DEAL_VIEW = 'crm:deal:view',
  CRM_CREATE = 'crm:create',
  CRM_EDIT = 'crm:edit',
  CRM_DELETE = 'crm:delete',
  CRM_PIPELINE_MANAGE = 'crm:pipeline:manage',

  NOTES_VIEW = 'notes:view',
  NOTES_CREATE = 'notes:create',
  NOTES_EDIT = 'notes:edit',
  NOTES_DELETE = 'notes:delete',

  PROJECT_VIEW = 'projects:view',
  PROJECT_CREATE = 'projects:create',
  PROJECT_EDIT = 'projects:edit',
  PROJECT_DELETE = 'projects:delete',

  TASKS_VIEW = 'tasks:view',
}

const ROLE_PERMISSIONS: Record<WorkspaceRole, WorkspacePermission[]> = {
  [WorkspaceRole.OWNER]: [
    WorkspacePermission.WORKSPACE_VIEW,
    WorkspacePermission.WORKSPACE_EDIT,
    WorkspacePermission.WORKSPACE_DELETE,
    WorkspacePermission.MEMBERS_VIEW,
    WorkspacePermission.MEMBERS_INVITE,
    WorkspacePermission.MEMBERS_REMOVE,
    WorkspacePermission.MEMBERS_EDIT_ROLE,
    WorkspacePermission.MODULES_VIEW,
    WorkspacePermission.MODULES_EDIT,
    WorkspacePermission.PERMISSIONS_VIEW,
    WorkspacePermission.PERMISSIONS_EDIT,
    WorkspacePermission.HABITS_VIEW,
    WorkspacePermission.HABITS_CREATE,
    WorkspacePermission.HABITS_EDIT,
    WorkspacePermission.HABITS_DELETE,
    WorkspacePermission.JOURNAL_VIEW,
    WorkspacePermission.JOURNAL_CREATE,
    WorkspacePermission.JOURNAL_EDIT,
    WorkspacePermission.JOURNAL_DELETE,
    WorkspacePermission.CRM_VIEW,
    WorkspacePermission.CRM_CONTACT_VIEW,
    WorkspacePermission.CRM_COMPANY_VIEW,
    WorkspacePermission.CRM_DEAL_VIEW,
    WorkspacePermission.CRM_CREATE,
    WorkspacePermission.CRM_EDIT,
    WorkspacePermission.CRM_DELETE,
    WorkspacePermission.CRM_PIPELINE_MANAGE,
    WorkspacePermission.NOTES_VIEW,
    WorkspacePermission.NOTES_CREATE,
    WorkspacePermission.NOTES_EDIT,
    WorkspacePermission.NOTES_DELETE,
    WorkspacePermission.PROJECT_VIEW,
    WorkspacePermission.PROJECT_CREATE,
    WorkspacePermission.PROJECT_EDIT,
    WorkspacePermission.PROJECT_DELETE,
    WorkspacePermission.TASKS_VIEW,
  ],
  [WorkspaceRole.ADMIN]: [
    WorkspacePermission.WORKSPACE_VIEW,
    WorkspacePermission.WORKSPACE_EDIT,
    WorkspacePermission.MEMBERS_VIEW,
    WorkspacePermission.MEMBERS_INVITE,
    WorkspacePermission.MEMBERS_REMOVE,
    WorkspacePermission.MEMBERS_EDIT_ROLE,
    WorkspacePermission.MODULES_VIEW,
    WorkspacePermission.MODULES_EDIT,
    WorkspacePermission.HABITS_VIEW,
    WorkspacePermission.HABITS_CREATE,
    WorkspacePermission.HABITS_EDIT,
    WorkspacePermission.HABITS_DELETE,
    WorkspacePermission.JOURNAL_VIEW,
    WorkspacePermission.JOURNAL_CREATE,
    WorkspacePermission.JOURNAL_EDIT,
    WorkspacePermission.JOURNAL_DELETE,
    WorkspacePermission.CRM_VIEW,
    WorkspacePermission.CRM_CONTACT_VIEW,
    WorkspacePermission.CRM_COMPANY_VIEW,
    WorkspacePermission.CRM_DEAL_VIEW,
    WorkspacePermission.CRM_CREATE,
    WorkspacePermission.CRM_EDIT,
    WorkspacePermission.CRM_DELETE,
    WorkspacePermission.CRM_PIPELINE_MANAGE,
    WorkspacePermission.NOTES_VIEW,
    WorkspacePermission.NOTES_CREATE,
    WorkspacePermission.NOTES_EDIT,
    WorkspacePermission.NOTES_DELETE,
    WorkspacePermission.PROJECT_VIEW,
    WorkspacePermission.PROJECT_CREATE,
    WorkspacePermission.PROJECT_EDIT,
    WorkspacePermission.PROJECT_DELETE,
    WorkspacePermission.TASKS_VIEW,
  ],
  [WorkspaceRole.MEMBER]: [
    WorkspacePermission.WORKSPACE_VIEW,
    WorkspacePermission.HABITS_VIEW,
    WorkspacePermission.HABITS_CREATE,
    WorkspacePermission.HABITS_EDIT,
    WorkspacePermission.JOURNAL_VIEW,
    WorkspacePermission.JOURNAL_CREATE,
    WorkspacePermission.JOURNAL_EDIT,
    WorkspacePermission.CRM_VIEW,
    WorkspacePermission.CRM_CONTACT_VIEW,
    WorkspacePermission.CRM_COMPANY_VIEW,
    WorkspacePermission.CRM_DEAL_VIEW,
    WorkspacePermission.CRM_CREATE,
    WorkspacePermission.CRM_EDIT,
    WorkspacePermission.NOTES_VIEW,
    WorkspacePermission.NOTES_CREATE,
    WorkspacePermission.NOTES_EDIT,
    WorkspacePermission.PROJECT_VIEW,
    WorkspacePermission.PROJECT_CREATE,
    WorkspacePermission.PROJECT_EDIT,
    WorkspacePermission.TASKS_VIEW,
  ],
  [WorkspaceRole.GUEST]: [
    WorkspacePermission.WORKSPACE_VIEW,
    WorkspacePermission.HABITS_VIEW,
    WorkspacePermission.JOURNAL_VIEW,
    WorkspacePermission.CRM_VIEW,
    WorkspacePermission.CRM_CONTACT_VIEW,
    WorkspacePermission.CRM_COMPANY_VIEW,
    WorkspacePermission.CRM_DEAL_VIEW,
    WorkspacePermission.NOTES_VIEW,
    WorkspacePermission.PROJECT_VIEW,
    // Guest can see projects, but not tasks
  ],
}

/** Маппинг WorkspacePermission -> префиксы API-прав (module:entity:action). Если есть любое совпадение — право есть. */
const WORKSPACE_TO_API_PREFIXES: Partial<Record<WorkspacePermission, string[]>> = {
  [WorkspacePermission.WORKSPACE_VIEW]: ['workspace:'],
  [WorkspacePermission.WORKSPACE_EDIT]: ['workspace:'],
  [WorkspacePermission.MEMBERS_VIEW]: ['workspace:member:'],
  [WorkspacePermission.MEMBERS_INVITE]: ['workspace:member:invite'],
  [WorkspacePermission.MEMBERS_REMOVE]: ['workspace:member:remove'],
  [WorkspacePermission.MEMBERS_EDIT_ROLE]: ['workspace:role:'],
  [WorkspacePermission.MODULES_VIEW]: ['workspace:module:read'],
  [WorkspacePermission.MODULES_EDIT]: ['workspace:module:manage'],
  [WorkspacePermission.PERMISSIONS_VIEW]: ['workspace:role:'],
  [WorkspacePermission.PERMISSIONS_EDIT]: ['workspace:role:manage'],
  [WorkspacePermission.HABITS_VIEW]: ['habits:habit:', 'habits:journal:'],
  [WorkspacePermission.HABITS_CREATE]: ['habits:habit:create', 'habits:journal:create'],
  [WorkspacePermission.HABITS_EDIT]: ['habits:habit:update', 'habits:journal:update'],
  [WorkspacePermission.HABITS_DELETE]: ['habits:habit:delete', 'habits:journal:delete'],
  [WorkspacePermission.JOURNAL_VIEW]: ['habits:journal:'],
  [WorkspacePermission.JOURNAL_CREATE]: ['habits:journal:create'],
  [WorkspacePermission.JOURNAL_EDIT]: ['habits:journal:update'],
  [WorkspacePermission.JOURNAL_DELETE]: ['habits:journal:delete'],
  [WorkspacePermission.CRM_VIEW]: ['crm:deal:', 'crm:contact:', 'crm:company:'],
  [WorkspacePermission.CRM_CONTACT_VIEW]: ['crm:contact:read'],
  [WorkspacePermission.CRM_COMPANY_VIEW]: ['crm:company:read'],
  [WorkspacePermission.CRM_DEAL_VIEW]: ['crm:deal:read'],
  [WorkspacePermission.CRM_CREATE]: ['crm:deal:create', 'crm:contact:create', 'crm:company:create'],
  [WorkspacePermission.CRM_EDIT]: ['crm:deal:update', 'crm:contact:update', 'crm:company:update'],
  [WorkspacePermission.CRM_DELETE]: ['crm:deal:delete', 'crm:contact:delete', 'crm:company:delete'],
  [WorkspacePermission.CRM_PIPELINE_MANAGE]: ['crm:pipeline:manage'],
  [WorkspacePermission.NOTES_VIEW]: ['notes:'],
  [WorkspacePermission.NOTES_CREATE]: ['notes:'],
  [WorkspacePermission.NOTES_EDIT]: ['notes:'],
  [WorkspacePermission.NOTES_DELETE]: ['notes:'],
  [WorkspacePermission.PROJECT_VIEW]: ['projects:project:read'],
  [WorkspacePermission.PROJECT_CREATE]: ['projects:project:create'],
  [WorkspacePermission.PROJECT_EDIT]: ['projects:project:update'],
  [WorkspacePermission.PROJECT_DELETE]: ['projects:project:delete'],

  // Any tasks:* permission implies tasks module visibility
  [WorkspacePermission.TASKS_VIEW]: ['tasks:task:'],
}

function hasWorkspacePermissionFromApi(
  permission: WorkspacePermission,
  apiPermissions: PermissionString[],
): boolean {
  const prefixes = WORKSPACE_TO_API_PREFIXES[permission]
  if (!prefixes) return false
  return apiPermissions.some((p) => prefixes.some((pref) => p.startsWith(pref)))
}

function getUserWorkspaceRole(): WorkspaceRole | string | null {
  const userStore = useUserStore()
  const workspaceStore = useWorkspaceStore()
  const authStore = useAuthStore()

  if (!userStore.currentUser || !workspaceStore.currentWorkspace) {
    return null
  }
  // Глобальный ADMIN имеет полный доступ в любом workspace
  const globalRole = userStore.currentUser.role
  if (
    globalRole === 'ADMIN' ||
    (typeof globalRole === 'string' && globalRole.toUpperCase() === 'ADMIN')
  ) {
    return WorkspaceRole.ADMIN
  }
  // Приоритет: effectivePermissions.systemRole из API /me/permissions (user_role_assignments)
  const ep = authStore.effectivePermissions
  if (ep?.systemRole) {
    if (['OWNER', 'ADMIN', 'MEMBER', 'GUEST'].includes(ep.systemRole)) {
      return ep.systemRole as WorkspaceRole
    }
    return ep.systemRole
  }
  // Fallback: ownerId → OWNER (до загрузки permissions или если миграции не применены)
  if (workspaceStore.currentWorkspace.ownerId === userStore.currentUser.id) {
    return WorkspaceRole.OWNER
  }
  return WorkspaceRole.MEMBER
}

export function usePermissions() {
  const userRole = computed(() => getUserWorkspaceRole())
  const authStore = useAuthStore()
  const isOwner = computed(() => userRole.value === WorkspaceRole.OWNER)
  const isAdmin = computed(() => userRole.value === WorkspaceRole.ADMIN)
  const isMember = computed(() => userRole.value === WorkspaceRole.MEMBER)
  const isGuest = computed(() => userRole.value === WorkspaceRole.GUEST)
  const isCustomRole = computed(
    () =>
      typeof userRole.value === 'string' &&
      !['OWNER', 'ADMIN', 'MEMBER', 'GUEST'].includes(userRole.value),
  )

  const hasPermission = (permission: WorkspacePermission): boolean => {
    if (!userRole.value) {
      return false
    }
    // Кастомная роль: права только из API (override semantics)
    if (isCustomRole.value && authStore.effectivePermissions?.permissions) {
      return hasWorkspacePermissionFromApi(
        permission,
        authStore.effectivePermissions.permissions as PermissionString[],
      )
    }
    const rolePermissions = ROLE_PERMISSIONS[userRole.value as WorkspaceRole] || []
    return rolePermissions.includes(permission)
  }

  const hasAnyPermission = (permissions: WorkspacePermission[]): boolean => {
    return permissions.some((permission) => hasPermission(permission))
  }

  const hasAllPermissions = (permissions: WorkspacePermission[]): boolean => {
    return permissions.every((permission) => hasPermission(permission))
  }

  return {
    userRole,
    isOwner,
    isAdmin,
    isMember,
    isGuest,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  }
}

export function requirePermission(permission: WorkspacePermission) {
  return () => {
    const { hasPermission } = usePermissions()
    if (!hasPermission(permission)) {
      // Generic fallback; router root redirect chooses a valid module.
      return { path: '/' }
    }
    return true
  }
}

export function requireOwner() {
  return () => {
    const { isOwner } = usePermissions()
    if (!isOwner.value) {
      return { path: '/' }
    }
    return true
  }
}

/** Требует наличие текущего workspace. Редирект на / при отсутствии. */
export function requireWorkspace() {
  return () => {
    const workspaceStore = useWorkspaceStore()
    if (!workspaceStore.currentWorkspace) {
      return { path: '/' }
    }
    return true
  }
}

/** Разрешает доступ владельцу/админу воркспейса или глобальному админу (настройки воркспейса). */
export function requireOwnerOrAdmin() {
  return () => {
    const workspaceStore = useWorkspaceStore()
    if (!workspaceStore.currentWorkspace) {
      return { path: '/' }
    }
    const { isOwner, isAdmin } = usePermissions()
    const userStore = useUserStore()
    const isGlobalAdmin =
      userStore.currentUser?.role === 'ADMIN' ||
      (typeof userStore.currentUser?.role === 'string' &&
        userStore.currentUser.role.toUpperCase() === 'ADMIN')
    if (isOwner.value || isAdmin.value || isGlobalAdmin) {
      return true
    }
    return { path: '/' }
  }
}

/**
 * Фабрика guard: редирект, если модуль роута не включён в текущем workspace.
 * Принимает getAvailableModules из конфига (чтобы избежать циклического импорта).
 * Используется в router с meta.module.
 */
export function requireModuleEnabled(
  getAvailableModules: (
    enabled: string[],
    hasPermission: (p: WorkspacePermission) => boolean,
  ) => { id: string; routes: { path: string }[] }[],
) {
  return (to: { meta: { module?: string } }): true | { path: string } => {
    const workspaceStore = useWorkspaceStore()
    const { hasPermission } = usePermissions()
    const moduleId = to.meta.module
    if (!moduleId) return true

    const enabled = workspaceStore.enabledModules
    if (!enabled.includes(moduleId)) {
      const available = getAvailableModules(enabled, hasPermission)
      const first = available[0]
      if (first?.routes?.length) {
        return { path: first.routes[0].path }
      }
      return { path: '/' }
    }
    return true
  }
}
