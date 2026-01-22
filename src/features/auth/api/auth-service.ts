import { api, API_ENDPOINTS } from '@/shared/api'
import type { LoginDto, RegisterDto, AuthResponse } from '@/features/auth'
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

  refresh: async (refreshToken: string): Promise<AuthResponse> => {
    const response = await api.post<AuthDataResponse>(API_ENDPOINTS.AUTH.REFRESH, { refreshToken })
    return {
      accessToken: 'cookie-based',
      refreshToken: 'cookie-based',
      user: response.user,
    }
  },
}
