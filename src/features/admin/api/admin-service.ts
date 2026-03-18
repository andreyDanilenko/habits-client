import { api, API_ENDPOINTS } from '@/shared/api'

export interface AdminModule {
  id: string
  code: string
  name: string
  description?: string
  isCore: boolean
  defaultTrialDays?: number
  createdAt: string
}

export interface WorkspaceModuleInfo {
  id: string
  workspaceId: string
  moduleId: string
  moduleName: string
  isCore: boolean
  status: 'active' | 'trial' | 'disabled'
  expiresAt?: string
  enabled: boolean
  createdAt: string
  updatedAt: string
}

export interface UserModuleLicense {
  id: string
  userId: string
  moduleId: string
  moduleCode: string
  scope: 'all_workspaces' | 'single_workspace'
  workspaceId?: string
  status: string
  source: string
  expiresAt?: string
  createdAt: string
  updatedAt: string
}

export interface AdminWorkspace {
  id: string
  name: string
  description?: string
  color?: string
  ownerId: string
  createdAt: string
  updatedAt: string
}

export interface AdminUserWithWorkspaces {
  id: string
  email: string
  name?: string
  role: string
  status?: string
  createdAt: string
  updatedAt: string
  workspaces: AdminWorkspace[]
}

interface AdminUsersResponse {
  users: AdminUserWithWorkspaces[]
}

export const adminService = {
  getUsers: async (): Promise<AdminUserWithWorkspaces[]> => {
    const response = await api.get<AdminUsersResponse>(API_ENDPOINTS.ADMIN.USERS)
    return response.users
  },

  deleteUser: async (userId: string, permanent = false): Promise<void> => {
    const url = permanent
      ? `${API_ENDPOINTS.ADMIN.USER(userId)}?permanent=true`
      : API_ENDPOINTS.ADMIN.USER(userId)
    await api.delete(url)
  },

  banUser: async (userId: string): Promise<void> => {
    await api.post(API_ENDPOINTS.ADMIN.USER_BAN(userId))
  },

  unbanUser: async (userId: string): Promise<void> => {
    await api.post(API_ENDPOINTS.ADMIN.USER_UNBAN(userId))
  },

  getModules: async (): Promise<AdminModule[]> => {
    const response = await api.get<{ modules: AdminModule[] }>(API_ENDPOINTS.ADMIN.MODULES)
    return response.modules
  },

  getUserLicenses: async (userId: string): Promise<UserModuleLicense[]> => {
    const response = await api.get<{ licenses?: UserModuleLicense[] | null }>(
      API_ENDPOINTS.ADMIN.USER_LICENSES(userId),
    )
    return response?.licenses ?? []
  },

  revokeLicense: async (userId: string, licenseId: string): Promise<void> => {
    await api.delete(API_ENDPOINTS.ADMIN.USER_LICENSE(userId, licenseId))
  },

  grantLicense: async (
    userId: string,
    data: {
      moduleCode: string
      scope: 'all_workspaces' | 'single_workspace'
      workspaceId?: string
    },
  ): Promise<UserModuleLicense> => {
    const response = await api.post<{ license: UserModuleLicense }>(
      API_ENDPOINTS.ADMIN.USER_LICENSES(userId),
      data,
    )
    return response.license
  },

  getWorkspaceModules: async (workspaceId: string): Promise<WorkspaceModuleInfo[]> => {
    const response = await api.get<{ modules: WorkspaceModuleInfo[] }>(
      API_ENDPOINTS.ADMIN.WORKSPACE_MODULES(workspaceId),
    )
    return response?.modules ?? []
  },

  patchWorkspaceModule: async (
    workspaceId: string,
    moduleCode: string,
    data: {
      action: 'extend_trial' | 'add_trial' | 'set_full' | 'set_disabled'
      trialDays?: number
    },
  ): Promise<void> => {
    await api.patch(API_ENDPOINTS.ADMIN.WORKSPACE_MODULE(workspaceId, moduleCode), data)
  },
}
