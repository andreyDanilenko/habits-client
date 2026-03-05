import { api, API_ENDPOINTS } from '@/shared/api'
import type { UserPermission, UserRole } from '@/entities/assignment'

export const assignmentService = {
  getUserRoles: async (workspaceId: string, userId: string): Promise<UserRole[]> => {
    return api.get<UserRole[]>(API_ENDPOINTS.ASSIGNMENTS.USER_ROLES(workspaceId, userId))
  },

  assignRole: async (workspaceId: string, userId: string, roleId: string): Promise<void> => {
    await api.post(API_ENDPOINTS.ASSIGNMENTS.USER_ROLE(workspaceId, userId, roleId))
  },

  revokeRole: async (workspaceId: string, userId: string, roleId: string): Promise<void> => {
    await api.delete(API_ENDPOINTS.ASSIGNMENTS.USER_ROLE(workspaceId, userId, roleId))
  },

  getUserPermissions: async (workspaceId: string, userId: string): Promise<UserPermission[]> => {
    return api.get<UserPermission[]>(
      API_ENDPOINTS.ASSIGNMENTS.USER_PERMISSIONS(workspaceId, userId),
    )
  },

  grantPermission: async (
    workspaceId: string,
    userId: string,
    payload: { permissionId: string; expiresAt?: string },
  ): Promise<void> => {
    await api.post(API_ENDPOINTS.ASSIGNMENTS.USER_PERMISSIONS(workspaceId, userId), payload)
  },

  revokePermission: async (
    workspaceId: string,
    userId: string,
    permissionId: string,
  ): Promise<void> => {
    await api.delete(API_ENDPOINTS.ASSIGNMENTS.USER_PERMISSION(workspaceId, userId, permissionId))
  },
}
