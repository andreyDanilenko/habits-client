export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR',
}

export enum WorkspaceRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
  GUEST = 'GUEST',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
  BANNED = 'BANNED',
}

export interface User {
  id: string
  email: string
  name?: string
  role: UserRole
  avatarUrl?: string
  status?: UserStatus
  createdAt: string
  updatedAt: string
}

export interface UserWorkspace {
  workspaceId: string
  role: WorkspaceRole
  joinedAt: string
  permissions?: string[]
  invitationStatus?: 'accepted' | 'pending' | 'rejected'
}
