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
  /** Признак core-модуля (is_core в БД): можно включать без лицензии. */
  isCore?: boolean
  /** active | trial | disabled */
  status?: string
  /** Дата окончания триала (ISO string). Только для status=trial. */
  expiresAt?: string
  enabled: boolean
  config?: Record<string, any>
  createdAt: string
  updatedAt: string
}

/** Системная или кастомная роль участника */
export type MemberSystemRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'GUEST' | (string & {})

export interface Member {
  id: string
  email: string
  name: string
  systemRole: MemberSystemRole
  joinedAt: string
  avatarUrl?: string
}
