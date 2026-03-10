import { api, API_ENDPOINTS } from '@/shared/api'
import type { Permission, PermissionsCatalogResponse, PermissionTree } from '@/entities/permission'

export type SystemRolesPermissions = Record<string, string[]>

// Бэкенд может вернуть либо { catalog: Permission[] }, либо уже собранное дерево { modules, flat }
type PermissionCatalogResponsePayload =
  | {
      catalog: Permission[]
      modules?: unknown
    }
  | PermissionTree

export const permissionService = {
  getSystemRoles: async (workspaceId: string): Promise<SystemRolesPermissions> => {
    const response = await api.get<{ systemRoles: SystemRolesPermissions }>(
      API_ENDPOINTS.PERMISSIONS.SYSTEM_ROLES(workspaceId),
    )
    return response?.systemRoles ?? {}
  },

  getCatalog: async (workspaceId: string): Promise<PermissionsCatalogResponse> => {
    const response = await api.get<PermissionCatalogResponsePayload>(
      API_ENDPOINTS.PERMISSIONS.CATALOG(workspaceId),
    )

    if ('catalog' in response) {
      return response.catalog
    }

    if ('flat' in response) {
      return response.flat ?? ([] as Permission[])
    }

    return [] as Permission[]
  },
}
