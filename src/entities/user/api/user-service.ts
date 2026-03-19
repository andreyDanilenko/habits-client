import { api, API_ENDPOINTS } from '@/shared/api'
import type { User } from '@/entities/user'

const BASE_URL = import.meta.env.VITE_API_URL ?? ''

interface UserDataResponse {
  user: User
}

export const userService = {
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<UserDataResponse>(API_ENDPOINTS.AUTH.ME)
    return response.user
  },

  updateProfile: async (data: { name?: string; position?: string }): Promise<User> => {
    const response = await api.patch<UserDataResponse>(API_ENDPOINTS.AUTH.ME, data)
    return response.user
  },

  uploadAvatar: async (file: File): Promise<User> => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await api.post<UserDataResponse>(API_ENDPOINTS.AUTH.ME_AVATAR, formData, {
      headers: { 'Content-Type': undefined } as any,
    })
    return response.user
  },

  /** URL для загрузки аватара текущего пользователя (с credentials) */
  getAvatarUrl: (): string => {
    return `${BASE_URL || ''}${API_ENDPOINTS.AUTH.ME_AVATAR}`
  },
}
