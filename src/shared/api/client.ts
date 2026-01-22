import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios'
import { mockApi } from './mock-client'

const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true' || false
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

type UnauthorizedHandler = () => void | Promise<void>

class ApiClient {
  private client: AxiosInstance
  private unauthorizedHandler: UnauthorizedHandler | null = null

  constructor() {
    this.client = axios.create({
      baseURL: BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    })

    this.setupInterceptors()
  }

  setUnauthorizedHandler(handler: UnauthorizedHandler) {
    this.unauthorizedHandler = handler
  }

  private setupInterceptors() {
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          if (this.unauthorizedHandler) {
            await this.unauthorizedHandler()
          } else {
            window.location.href = '/login'
          }
        }
        return Promise.reject(error)
      },
    )
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    if (USE_MOCK_API) {
      return mockApi.get<T>(url)
    }
    const response = await this.client.get<{ status: string; data?: T }>(url, config)
    return response.data.data as T
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    if (USE_MOCK_API) {
      return mockApi.post<T>(url, data)
    }
    const response = await this.client.post<{ status: string; data?: T }>(url, data, config)
    return response.data.data as T
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    if (USE_MOCK_API) {
      return mockApi.put<T>(url, data)
    }
    const response = await this.client.put<{ status: string; data?: T }>(url, data, config)
    return response.data.data as T
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    if (USE_MOCK_API) {
      return mockApi.delete<T>(url)
    }
    const response = await this.client.delete<{ status: string; data?: T }>(url, config)
    return response.data.data as T
  }
}

export const api = new ApiClient()
