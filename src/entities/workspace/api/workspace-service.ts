import { api, API_ENDPOINTS } from '@/shared/api'
import type {
  Workspace,
  CreateWorkspaceDto,
  UpdateWorkspaceDto,
  WorkspaceModule,
  Member,
} from '@/entities/workspace'

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
    const response = await api.get<WorkspaceDataResponse>(
      `${API_ENDPOINTS.WORKSPACE.BASE}/${workspaceId}`,
    )
    return response.workspace
  },

  createWorkspace: async (data: CreateWorkspaceDto): Promise<Workspace> => {
    const response = await api.post<Workspace>(API_ENDPOINTS.WORKSPACE.BASE, data)
    return response
  },

  updateWorkspace: async (workspaceId: string, data: UpdateWorkspaceDto): Promise<Workspace> => {
    const response = await api.put<WorkspaceDataResponse>(
      `${API_ENDPOINTS.WORKSPACE.BASE}/${workspaceId}`,
      data,
    )
    return response.workspace
  },

  uploadWorkspaceLogo: async (workspaceId: string, file: File): Promise<Workspace> => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await api.post<WorkspaceDataResponse>(API_ENDPOINTS.WORKSPACE.LOGO(workspaceId), formData, {
      headers: { 'Content-Type': undefined } as any,
    })
    return response.workspace
  },

  clearWorkspaceLogo: async (workspaceId: string): Promise<Workspace> => {
    const response = await api.delete<WorkspaceDataResponse>(API_ENDPOINTS.WORKSPACE.LOGO(workspaceId))
    return response.workspace
  },

  deleteWorkspace: async (workspaceId: string): Promise<void> => {
    await api.delete(`${API_ENDPOINTS.WORKSPACE.BASE}/${workspaceId}`)
  },

  getWorkspaceMembers: async (workspaceId: string): Promise<Member[]> => {
    const response = await api.get<{ members: Member[] }>(
      API_ENDPOINTS.WORKSPACE.MEMBERS(workspaceId),
    )
    return response.members ?? []
  },

  removeMember: async (workspaceId: string, userId: string): Promise<void> => {
    await api.delete(API_ENDPOINTS.WORKSPACE.MEMBER(workspaceId, userId))
  },

  updateMemberRole: async (
    workspaceId: string,
    userId: string,
    payload: { role?: 'OWNER' | 'ADMIN' | 'MEMBER' | 'GUEST'; roleId?: string },
  ): Promise<void> => {
    await api.patch(API_ENDPOINTS.WORKSPACE.MEMBER(workspaceId, userId), payload)
  },

  switchWorkspace: async (workspaceId: string) => {
    const response = await api.post(API_ENDPOINTS.WORKSPACE.SWITCH(workspaceId))
    return response
  },

  getWorkspaceModules: async (workspaceId: string): Promise<{ modules: WorkspaceModule[] }> => {
    const response = await api.get<{ modules: WorkspaceModule[] }>(
      API_ENDPOINTS.WORKSPACE.MODULES(workspaceId),
    )
    return response
  },

  enableModule: async (workspaceId: string, moduleCode: string): Promise<void> => {
    await api.post(API_ENDPOINTS.WORKSPACE.MODULES(workspaceId), { moduleCode })
  },

  disableModule: async (workspaceId: string, moduleCode: string): Promise<void> => {
    await api.delete(API_ENDPOINTS.WORKSPACE.MODULE(workspaceId, moduleCode))
  },

  getMyLicenses: async (): Promise<{ licenses: UserModuleLicense[] }> => {
    const response = await api.get<{ licenses?: UserModuleLicense[] | null }>(
      API_ENDPOINTS.WORKSPACE.MY_LICENSES,
    )
    return { licenses: response?.licenses ?? [] }
  },

  createInvitation: async (
    workspaceId: string,
    data: { email: string; systemRole: 'MEMBER' | 'GUEST' },
  ): Promise<Invitation> => {
    return api.post<Invitation>(API_ENDPOINTS.WORKSPACE.INVITATIONS(workspaceId), data)
  },

  listInvitations: async (
    workspaceId: string,
    params?: { status?: string; limit?: number; offset?: number },
  ): Promise<{ invitations: Invitation[]; total: number }> => {
    const searchParams = new URLSearchParams()
    if (params?.status) searchParams.set('status', params.status)
    if (params?.limit) searchParams.set('limit', String(params.limit))
    if (params?.offset) searchParams.set('offset', String(params.offset))
    const qs = searchParams.toString()
    const url = API_ENDPOINTS.WORKSPACE.INVITATIONS(workspaceId) + (qs ? `?${qs}` : '')
    return api.get<{ invitations: Invitation[]; total: number }>(url)
  },

  cancelInvitation: async (workspaceId: string, invitationId: string): Promise<void> => {
    await api.delete(API_ENDPOINTS.WORKSPACE.INVITATION(workspaceId, invitationId))
  },
}

export const publicInvitationService = {
  getByToken: async (token: string): Promise<PublicInvitationInfo> => {
    return api.get<PublicInvitationInfo>(API_ENDPOINTS.PUBLIC.INVITATION(token))
  },
  accept: async (token: string): Promise<AcceptInvitationResponse> => {
    return api.post<AcceptInvitationResponse>(API_ENDPOINTS.PUBLIC.INVITATION_ACCEPT(token))
  },
}

export interface PublicInvitationInfo {
  email: string
  workspaceName: string
  invitedByName: string
  systemRole: string
  expiresAt: string
  userExists: boolean
  isAuthenticated: boolean
}

export interface AcceptInvitationResponse {
  status: 'accepted' | 'requires_auth' | 'expired' | 'wrong_email'
  redirectTo?: string
  email?: string
  userExists?: boolean
  message?: string
}

export interface Invitation {
  id: string
  email: string
  workspaceId: string
  invitedBy?: { id: string; name: string; email: string }
  systemRole: string
  status: string
  inviteLink?: string
  expiresAt: string
  createdAt: string
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
