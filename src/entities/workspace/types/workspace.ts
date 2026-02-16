export interface Workspace {
  id: string
  name: string
  description?: string
  color?: string
  ownerId: string
  createdAt: string
  updatedAt: string
}

export interface CreateWorkspaceDto {
  name: string
  description?: string
  color?: string
}

export interface UpdateWorkspaceDto extends Partial<CreateWorkspaceDto> {}

export interface WorkspaceModule {
  id: string
  workspaceId: string
  moduleId?: string
  moduleName: string
  status?: string
  enabled: boolean
  config?: Record<string, any>
  createdAt: string
  updatedAt: string
}
