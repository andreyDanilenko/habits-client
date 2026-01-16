import { api, API_ENDPOINTS } from '@/shared/api'
import type { User } from '@/entities/user'

export const userService = {
  getCurrentUser: async (): Promise<User> => api.get<User>(API_ENDPOINTS.AUTH.ME),
}
