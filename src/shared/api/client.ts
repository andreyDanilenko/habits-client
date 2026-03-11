import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios'
import { mockApi } from './mock-client'
import { API_ENDPOINTS } from './endpoints'

const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true' || false
const BASE_URL = import.meta.env.VITE_API_URL ?? ''

/** Ранее CRM шёл на моки; теперь бэкенд отдаёт /contacts, /companies, /deals, /pipelines */

type UnauthorizedHandler = () => void | Promise<void>

class ApiClient {
  private client: AxiosInstance
  private unauthorizedHandler: UnauthorizedHandler | null = null
  /** Один refresh на все параллельные 401 — остальные ждут и ретраят после успеха */
  private refreshPromise: Promise<boolean> | null = null

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

  setWorkspaceId(id: string | null) {
    if (id) {
      this.client.defaults.headers.common['X-Workspace-ID'] = id
    } else {
      delete this.client.defaults.headers.common['X-Workspace-ID']
    }
  }

  private setupInterceptors() {
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config

        if (error.response?.status === 401 && !originalRequest._retry) {
          const isRefreshRequest = originalRequest.url?.includes('/auth/refresh')

          if (isRefreshRequest) {
            if (this.unauthorizedHandler) {
              await this.unauthorizedHandler()
            } else {
              window.location.href = '/login'
            }
            return Promise.reject(error)
          }

          // Один refresh на все параллельные 401 — остальные ждут того же промиса
          if (!this.refreshPromise) {
            this.refreshPromise = this.client
              .post(API_ENDPOINTS.AUTH.REFRESH)
              .then((res) => {
                this.refreshPromise = null
                return res.status === 200
              })
              .catch(() => {
                this.refreshPromise = null
                return false
              })
          }

          const refreshSucceeded = await this.refreshPromise
          if (refreshSucceeded) {
            originalRequest._retry = true
            return this.client(originalRequest)
          }

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

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    if (USE_MOCK_API) {
      return mockApi.put<T>(url, data)
    }
    const response = await this.client.patch<{ status: string; data?: T }>(url, data, config)
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
