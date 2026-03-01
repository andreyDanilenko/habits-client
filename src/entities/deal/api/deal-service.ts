import { api, API_ENDPOINTS } from '@/shared/api'
import type { Deal, Pipeline, CreateDealDto, UpdateDealDto } from '@/entities/deal'

export interface DealsListParams {
  workspaceId: string
  search?: string
  page?: number
  limit?: number
  sortBy?: string | null
  sortOrder?: 'asc' | 'desc'
  pipelineId?: string
  stageId?: string
  /** Фильтр по компании */
  companyId?: string
  /** Фильтр по дате создания (ISO) */
  dateFrom?: string
  dateTo?: string
}

export interface DealsListResponse {
  deals: Deal[]
  total: number
}

export const dealService = {
  getList: async (params: DealsListParams): Promise<DealsListResponse> => {
    const q = new URLSearchParams()
    if (params.search) q.set('search', params.search)
    if (params.page != null) q.set('page', String(params.page))
    if (params.limit != null) q.set('limit', String(params.limit))
    if (params.sortBy) q.set('sortBy', params.sortBy)
    if (params.sortOrder) q.set('sortOrder', params.sortOrder)
    if (params.pipelineId) q.set('pipelineId', params.pipelineId)
    if (params.stageId) q.set('stageId', params.stageId)
    if (params.companyId) q.set('companyId', params.companyId)
    if (params.dateFrom) q.set('dateFrom', params.dateFrom)
    if (params.dateTo) q.set('dateTo', params.dateTo)
    const query = q.toString()
    const url = query
      ? `${API_ENDPOINTS.CRM.DEALS(params.workspaceId)}?${query}`
      : API_ENDPOINTS.CRM.DEALS(params.workspaceId)
    return api.get<DealsListResponse>(url)
  },

  getById: async (workspaceId: string, id: string): Promise<Deal> => {
    return api.get<Deal>(API_ENDPOINTS.CRM.DEAL(workspaceId, id))
  },

  getPipelines: async (workspaceId: string): Promise<Pipeline[]> => {
    const res = await api.get<{ pipelines: Pipeline[] }>(API_ENDPOINTS.CRM.PIPELINES(workspaceId))
    return res.pipelines ?? []
  },

  create: async (workspaceId: string, data: CreateDealDto): Promise<Deal> => {
    return api.post<Deal>(API_ENDPOINTS.CRM.DEALS(workspaceId), data)
  },

  update: async (workspaceId: string, id: string, data: UpdateDealDto): Promise<Deal> => {
    return api.put<Deal>(API_ENDPOINTS.CRM.DEAL(workspaceId, id), data)
  },

  delete: async (workspaceId: string, id: string): Promise<void> => {
    await api.delete(API_ENDPOINTS.CRM.DEAL(workspaceId, id))
  },
}
