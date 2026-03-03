export interface Role {
  id: string
  workspaceId: string
  name: string
  description: string | null
  isSystem: boolean
  createdAt: string
  updatedAt: string
}

export type PermissionString = `${string}:${string}:${string}`

export type RolePermissionsResponse = PermissionString[]

