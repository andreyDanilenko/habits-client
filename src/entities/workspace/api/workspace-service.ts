import { api, API_ENDPOINTS } from '@/shared/api'
import type { Workspace, CreateWorkspaceDto } from '@/entities/workspace'

export const workspaceService = {
  getWorkspaces: async (): Promise<Workspace[]> =>
    api.get<Workspace[]>(API_ENDPOINTS.WORKSPACE.BASE),

  createWorkspace: async (data: CreateWorkspaceDto): Promise<Workspace> =>
    api.post<Workspace>(API_ENDPOINTS.WORKSPACE.BASE, data),

  getWorkspaceMembers: async (workspaceId: string) =>
    api.get(API_ENDPOINTS.WORKSPACE.MEMBERS(workspaceId)),

  switchWorkspace: async (workspaceId: string) =>
    api.post(API_ENDPOINTS.WORKSPACE.SWITCH(workspaceId)),

  getWorkspaceModules: async (workspaceId: string) =>
    api.get(API_ENDPOINTS.WORKSPACE.MODULES(workspaceId)),
}
