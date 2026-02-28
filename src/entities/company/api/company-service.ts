import { api, API_ENDPOINTS } from '@/shared/api'
import type { Company, CreateCompanyDto, UpdateCompanyDto } from '@/entities/company'

export interface CompaniesListParams {
  workspaceId: string
  search?: string
  page?: number
  limit?: number
  sortBy?: string | null
  sortOrder?: 'asc' | 'desc'
}

export interface CompaniesListResponse {
  companies: Company[]
  total: number
}

export const companyService = {
  getList: async (params: CompaniesListParams): Promise<CompaniesListResponse> => {
    const q = new URLSearchParams()
    if (params.search) q.set('search', params.search)
    if (params.page != null) q.set('page', String(params.page))
    if (params.limit != null) q.set('limit', String(params.limit))
    if (params.sortBy) q.set('sortBy', params.sortBy)
    if (params.sortOrder) q.set('sortOrder', params.sortOrder)
    const query = q.toString()
    const url = query
      ? `${API_ENDPOINTS.CRM.COMPANIES(params.workspaceId)}?${query}`
      : API_ENDPOINTS.CRM.COMPANIES(params.workspaceId)
    return api.get<CompaniesListResponse>(url)
  },

  getById: async (workspaceId: string, id: string): Promise<Company> => {
    return api.get<Company>(API_ENDPOINTS.CRM.COMPANY(workspaceId, id))
  },

  create: async (workspaceId: string, data: CreateCompanyDto): Promise<Company> => {
    return api.post<Company>(API_ENDPOINTS.CRM.COMPANIES(workspaceId), data)
  },

  update: async (
    workspaceId: string,
    id: string,
    data: UpdateCompanyDto,
  ): Promise<Company> => {
    return api.put<Company>(API_ENDPOINTS.CRM.COMPANY(workspaceId, id), data)
  },

  delete: async (workspaceId: string, id: string): Promise<void> => {
    await api.delete(API_ENDPOINTS.CRM.COMPANY(workspaceId, id))
  },
}
