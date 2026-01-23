import { api, API_ENDPOINTS } from '@/shared/api'
import type { Workspace, CreateWorkspaceDto, WorkspaceModule } from '@/entities/workspace'

interface WorkspacesDataResponse {
  workspaces: Workspace[]
}

interface CurrentWorkspaceDataResponse {
  workspace: Workspace
}

export const workspaceService = {
  getWorkspaces: async (): Promise<Workspace[]> => {
    const response = await api.get<WorkspacesDataResponse>(API_ENDPOINTS.WORKSPACE.BASE)
    return response.workspaces
  },

  getCurrentWorkspace: async (): Promise<Workspace | null> => {
    try {
      const response = await api.get<CurrentWorkspaceDataResponse>(API_ENDPOINTS.WORKSPACE.CURRENT)
      return response.workspace ?? null
    } catch {
      return null
    }
  },

  createWorkspace: async (data: CreateWorkspaceDto): Promise<Workspace> => {
    const response = await api.post<Workspace>(API_ENDPOINTS.WORKSPACE.BASE, data)
    return response
  },

  getWorkspaceMembers: async (workspaceId: string) => {
    const response = await api.get(API_ENDPOINTS.WORKSPACE.MEMBERS(workspaceId))
    return response
  },

  switchWorkspace: async (workspaceId: string) => {
    const response = await api.post(API_ENDPOINTS.WORKSPACE.SWITCH(workspaceId))
    return response
  },

  getWorkspaceModules: async (workspaceId: string): Promise<{ modules: WorkspaceModule[] }> => {
    const response = await api.get<{ modules: WorkspaceModule[] }>(API_ENDPOINTS.WORKSPACE.MODULES(workspaceId))
    return response
  },
}
