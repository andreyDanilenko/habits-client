import { api, API_ENDPOINTS } from '@/shared/api'
import type {
  Activity,
  ActivitiesResponse,
  GetActivitiesParams,
  CreateNoteDto,
  CreateCallDto,
  UpdateNoteDto,
} from '@/entities/activity'

export const activityService = {
  getList: async (
    workspaceId: string,
    params: GetActivitiesParams,
  ): Promise<ActivitiesResponse> => {
    const q = new URLSearchParams()
    q.set('entityType', params.entityType)
    q.set('entityId', params.entityId)
    if (params.page != null) q.set('page', String(params.page))
    if (params.limit != null) q.set('limit', String(params.limit))
    const f = params.filters
    if (f?.types?.length) q.set('types', f.types.join(','))
    if (f?.dateFrom) q.set('dateFrom', f.dateFrom)
    if (f?.dateTo) q.set('dateTo', f.dateTo)
    if (f?.importantOnly) q.set('importantOnly', 'true')
    if (f?.search) q.set('search', f.search)
    const url = `${API_ENDPOINTS.CRM.ACTIVITIES(workspaceId)}?${q.toString()}`
    return api.get<ActivitiesResponse>(url)
  },

  createNote: async (
    workspaceId: string,
    data: CreateNoteDto,
  ): Promise<Activity> => {
    return api.post<Activity>(API_ENDPOINTS.CRM.ACTIVITIES(workspaceId), {
      ...data,
      type: 'note',
    })
  },

  createCall: async (
    workspaceId: string,
    data: CreateCallDto,
  ): Promise<Activity> => {
    return api.post<Activity>(API_ENDPOINTS.CRM.ACTIVITIES(workspaceId), {
      ...data,
      type: 'call',
    })
  },

  update: async (
    workspaceId: string,
    id: string,
    data: UpdateNoteDto,
  ): Promise<Activity> => {
    return api.put<Activity>(API_ENDPOINTS.CRM.ACTIVITY(workspaceId, id), data)
  },

  delete: async (workspaceId: string, id: string): Promise<void> => {
    await api.delete(API_ENDPOINTS.CRM.ACTIVITY(workspaceId, id))
  },

  toggleImportant: async (
    workspaceId: string,
    id: string,
  ): Promise<Activity> => {
    return api.post<Activity>(
      API_ENDPOINTS.CRM.ACTIVITY_IMPORTANT(workspaceId, id),
    )
  },
}
