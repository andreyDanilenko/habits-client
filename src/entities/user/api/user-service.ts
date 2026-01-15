import { api } from '@/shared/api/client'
import { API_ENDPOINTS } from '@/shared/api/endpoints'
import type { User } from '@/entities/user/types/user'

export const userService = {
  getCurrentUser: async (): Promise<User> => api.get<User>(API_ENDPOINTS.AUTH.ME),
}
