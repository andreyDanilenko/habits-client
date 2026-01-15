import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/features/auth/model/auth-store'
import { mockApi } from './mock-client'

// Переключение между реальным API и моком
// Установите VITE_USE_MOCK_API=true в .env или используйте флаг ниже
const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true' || false

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    this.client.interceptors.request.use(
      (config) => {
        const authStore = useAuthStore()
        const token = authStore.accessToken

        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`
        }

        return config
      },
      (error) => Promise.reject(error),
    )

    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          const authStore = useAuthStore()
          await authStore.logout()
          window.location.href = '/login'
        }
        return Promise.reject(error)
      },
    )
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    if (USE_MOCK_API) {
      return mockApi.get<T>(url)
    }
    const response = await this.client.get<T>(url, config)
    return response.data
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    if (USE_MOCK_API) {
      return mockApi.post<T>(url, data)
    }
    const response = await this.client.post<T>(url, data, config)
    return response.data
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    if (USE_MOCK_API) {
      return mockApi.put<T>(url, data)
    }
    const response = await this.client.put<T>(url, data, config)
    return response.data
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    if (USE_MOCK_API) {
      return mockApi.delete<T>(url)
    }
    const response = await this.client.delete<T>(url, config)
    return response.data
  }
}

export const api = new ApiClient()
