import { api, API_ENDPOINTS } from '@/shared/api'
import type { LoginDto, RegisterDto, AuthResponse, EffectivePermissions } from '@/features/auth'
import type { User } from '@/entities/user'

interface AuthDataResponse {
  user: User
  expires_in?: number
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

  register: async (data: RegisterDto): Promise<AuthResponse> => {
    const response = await api.post<AuthDataResponse>(API_ENDPOINTS.AUTH.REGISTER, data)
    return {
      accessToken: 'cookie-based',
      refreshToken: 'cookie-based',
      user: response.user,
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
}
