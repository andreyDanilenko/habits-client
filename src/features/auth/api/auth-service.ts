import { api, API_ENDPOINTS } from '@/shared/api'
import type { LoginDto, RegisterDto, AuthResponse, EffectivePermissions } from '@/features/auth'
import type { User } from '@/entities/user'

interface AuthDataResponse {
  user?: User
  expires_in?: number
  message?: string
}

export interface RegisterResult {
  pendingVerification?: boolean
  message?: string
  user?: User
}

export const authService = {
  login: async (credentials: LoginDto): Promise<AuthResponse> => {
    const response = await api.post<AuthDataResponse>(API_ENDPOINTS.AUTH.LOGIN, credentials)
    return {
      accessToken: 'cookie-based',
      refreshToken: 'cookie-based',
      user: response.user,
    }
  },

  register: async (data: RegisterDto): Promise<AuthResponse & RegisterResult> => {
    const response = await api.post<AuthDataResponse>(API_ENDPOINTS.AUTH.REGISTER, data)
    const pendingVerification = !response.user && !!response.message
    return {
      accessToken: pendingVerification ? '' : 'cookie-based',
      refreshToken: pendingVerification ? '' : 'cookie-based',
      user: response.user,
      pendingVerification,
      message: response.message,
    }
  },

  logout: async (): Promise<void> => api.post(API_ENDPOINTS.AUTH.LOGOUT),

  refresh: async (): Promise<AuthResponse> => {
    // Refresh token передаётся через httpOnly cookie автоматически
    const response = await api.post<AuthDataResponse>(API_ENDPOINTS.AUTH.REFRESH)
    return {
      accessToken: 'cookie-based',
      refreshToken: 'cookie-based',
      user: response.user,
    }
  },

  getEffectivePermissions: async (workspaceId: string): Promise<EffectivePermissions> => {
    return api.get<EffectivePermissions>(API_ENDPOINTS.ME.PERMISSIONS(workspaceId))
  },

  changePassword: async (data: {
    currentPassword: string
    newPassword: string
  }): Promise<void> => {
    await api.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, data)
  },
}
