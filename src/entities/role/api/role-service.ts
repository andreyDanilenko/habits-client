import { api, API_ENDPOINTS } from '@/shared/api'
import type { Role, PermissionString, RolePermissionsResponse } from '@/entities/role'

export interface CreateRoleDto {
  name: string
  description?: string | null
  permissions: PermissionString[]
}

export interface UpdateRoleDto {
  name?: string
  description?: string | null
  permissions: PermissionString[]
}

export const roleService = {
  list: async (workspaceId: string): Promise<Role[]> => {
    const response = await api.get<{ roles: Role[] }>(API_ENDPOINTS.ROLES.LIST(workspaceId))
    return response.roles
  },

  getById: async (workspaceId: string, roleId: string): Promise<Role> => {
    return api.get<Role>(API_ENDPOINTS.ROLES.DETAIL(workspaceId, roleId))
  },

  getPermissions: async (workspaceId: string, roleId: string): Promise<RolePermissionsResponse> => {
    return api.get<RolePermissionsResponse>(API_ENDPOINTS.ROLES.PERMISSIONS(workspaceId, roleId))
  },

  create: async (workspaceId: string, dto: CreateRoleDto): Promise<Role> => {
    return api.post<Role>(API_ENDPOINTS.ROLES.LIST(workspaceId), dto)
  },

  update: async (workspaceId: string, roleId: string, dto: UpdateRoleDto): Promise<Role> => {
    return api.put<Role>(API_ENDPOINTS.ROLES.DETAIL(workspaceId, roleId), dto)
  },

  delete: async (workspaceId: string, roleId: string): Promise<void> => {
    await api.delete(API_ENDPOINTS.ROLES.DETAIL(workspaceId, roleId))
  },

  addInheritance: async (
    workspaceId: string,
    roleId: string,
    parentRoleId: string,
  ): Promise<void> => {
    await api.post(API_ENDPOINTS.ROLES.INHERIT(workspaceId, roleId, parentRoleId))
  },

  removeInheritance: async (
    workspaceId: string,
    roleId: string,
    parentRoleId: string,
  ): Promise<void> => {
    await api.delete(API_ENDPOINTS.ROLES.INHERIT(workspaceId, roleId, parentRoleId))
  },
}

