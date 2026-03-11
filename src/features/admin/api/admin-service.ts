import { api, API_ENDPOINTS } from '@/shared/api'

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
}
