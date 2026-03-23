export interface LoginDto {
  email: string
  password: string
}

export interface RegisterDto {
  email: string
  password: string
  name?: string
  inviteToken?: string
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

export type DataScopeValue = 'all' | 'owner' | 'department' | 'none'

export interface EffectivePermissions {
  permissions: PermissionString[]
  roles: string[]
  systemRole: 'OWNER' | 'ADMIN' | 'MEMBER' | 'GUEST' | (string & {})
  /** Видимость строк по object_key (как на бэкенде), для CRM-уведомлений и т.п. */
  dataScopes?: Record<string, DataScopeValue>
  /** users.department_id текущего пользователя (если задан) */
  departmentId?: string
}
