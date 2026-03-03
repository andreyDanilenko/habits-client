import type { PermissionString, Role } from '@/entities/role'

export interface RoleAssignment {
  userId: string
  roleId: string
  workspaceId: string
  assignedBy?: string
  assignedAt: string
}

export interface UserPermission {
  id: string
  userId: string
  workspaceId: string
  permissionId: string
  permission: PermissionString
  moduleCode: string
  entityType: string
  action: string
  grantedBy?: string
  grantedAt: string
  expiresAt?: string | null
}

export interface UserRole extends Role {
  assignedAt: string
  assignedBy?: string
}

