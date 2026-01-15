import { api } from '@/shared/api/client'
import { API_ENDPOINTS } from '@/shared/api/endpoints'
import type { LoginDto, RegisterDto, AuthResponse } from '@/features/auth/types/auth'

export const authService = {
  login: async (credentials: LoginDto): Promise<AuthResponse> =>
    api.post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, credentials),

  register: async (data: RegisterDto): Promise<AuthResponse> =>
    api.post<AuthResponse>(API_ENDPOINTS.AUTH.REGISTER, data),

  logout: async (): Promise<void> => api.post(API_ENDPOINTS.AUTH.LOGOUT),

  refresh: async (refreshToken: string): Promise<AuthResponse> =>
    api.post<AuthResponse>(API_ENDPOINTS.AUTH.REFRESH, { refreshToken }),
}
