import { api, API_ENDPOINTS } from '@/shared/api'
import type { Workspace, CreateWorkspaceDto, UpdateWorkspaceDto, WorkspaceModule } from '@/entities/workspace'

interface WorkspacesDataResponse {
  workspaces: Workspace[]
}

interface CurrentWorkspaceDataResponse {
  workspace: Workspace
}

interface WorkspaceDataResponse {
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

  getWorkspace: async (workspaceId: string): Promise<Workspace> => {
    const response = await api.get<WorkspaceDataResponse>(`${API_ENDPOINTS.WORKSPACE.BASE}/${workspaceId}`)
    return response.workspace
  },

  createWorkspace: async (data: CreateWorkspaceDto): Promise<Workspace> => {
    const response = await api.post<Workspace>(API_ENDPOINTS.WORKSPACE.BASE, data)
    return response
  },

  updateWorkspace: async (workspaceId: string, data: UpdateWorkspaceDto): Promise<Workspace> => {
    const response = await api.put<WorkspaceDataResponse>(`${API_ENDPOINTS.WORKSPACE.BASE}/${workspaceId}`, data)
    return response.workspace
  },

  deleteWorkspace: async (workspaceId: string): Promise<void> => {
    await api.delete(`${API_ENDPOINTS.WORKSPACE.BASE}/${workspaceId}`)
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
