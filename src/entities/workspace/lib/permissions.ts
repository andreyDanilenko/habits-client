import { computed } from 'vue'
import { useUserStore } from '@/entities/user'
import { useWorkspaceStore } from '@/entities/workspace'
import { WorkspaceRole } from '@/entities/user'

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
  CRM_CREATE = 'crm:create',
  CRM_EDIT = 'crm:edit',
  CRM_DELETE = 'crm:delete',
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
    WorkspacePermission.CRM_CREATE,
    WorkspacePermission.CRM_EDIT,
    WorkspacePermission.CRM_DELETE,
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
    WorkspacePermission.CRM_CREATE,
    WorkspacePermission.CRM_EDIT,
    WorkspacePermission.CRM_DELETE,
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
    WorkspacePermission.CRM_CREATE,
    WorkspacePermission.CRM_EDIT,
  ],
  [WorkspaceRole.GUEST]: [
    WorkspacePermission.WORKSPACE_VIEW,
    WorkspacePermission.HABITS_VIEW,
    WorkspacePermission.JOURNAL_VIEW,
    WorkspacePermission.CRM_VIEW,
  ],
}

function getUserWorkspaceRole(): WorkspaceRole | null {
  const userStore = useUserStore()
  const workspaceStore = useWorkspaceStore()

  if (!userStore.currentUser || !workspaceStore.currentWorkspace) {
    return null
  }
  if (workspaceStore.currentWorkspace.ownerId === userStore.currentUser.id) {
    return WorkspaceRole.OWNER
  }

  // TODO: Получать роль из workspace members когда API будет готов
  // Пока возвращаем MEMBER по умолчанию для не-владельцев
  return WorkspaceRole.MEMBER
}

export function usePermissions() {
  const userRole = computed(() => getUserWorkspaceRole())
  const isOwner = computed(() => userRole.value === WorkspaceRole.OWNER)
  const isAdmin = computed(() => userRole.value === WorkspaceRole.ADMIN)
  const isMember = computed(() => userRole.value === WorkspaceRole.MEMBER)
  const isGuest = computed(() => userRole.value === WorkspaceRole.GUEST)

  const hasPermission = (permission: WorkspacePermission): boolean => {
    if (!userRole.value) {
      return false
    }

    const rolePermissions = ROLE_PERMISSIONS[userRole.value] || []
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
      return { path: '/habits/dashboard' }
    }
    return true
  }
}

export function requireOwner() {
  return () => {
    const { isOwner } = usePermissions()
    if (!isOwner.value) {
      return { name: 'HabitsDashboard' }
    }
    return true
  }
}

/**
 * Фабрика guard: редирект, если модуль роута не включён в текущем workspace.
 * Принимает getAvailableModules из конфига (чтобы избежать циклического импорта).
 * Используется в router с meta.module.
 */
export function requireModuleEnabled(getAvailableModules: (
  enabled: string[],
  hasPermission: (p: WorkspacePermission) => boolean,
) => { id: string; routes: { path: string }[] }[]) {
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
      return { path: '/habits/dashboard' }
    }
    return true
  }
}
