import { api, API_ENDPOINTS } from '@/shared/api'
import type { User } from '@/entities/user'

interface UserDataResponse {
  user: User
}

export const userService = {
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<UserDataResponse>(API_ENDPOINTS.AUTH.ME)
    return response.user
  },
}
