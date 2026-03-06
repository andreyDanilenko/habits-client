export interface LoginDto {
  email: string
  password: string
}

export interface RegisterDto {
  email: string
  password: string
  name?: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user?: {
    id: string
    email: string
    name?: string
  }
}

import type { PermissionString } from '@/entities/role'

export interface EffectivePermissions {
  permissions: PermissionString[]
  roles: string[]
  systemRole: 'OWNER' | 'ADMIN' | 'MEMBER' | 'GUEST' | (string & {})
}
