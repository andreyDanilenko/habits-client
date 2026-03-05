import { api, API_ENDPOINTS } from '@/shared/api'
import type { Contact, CreateContactDto, UpdateContactDto } from '@/entities/contact'

export interface ContactsListParams {
  workspaceId: string
  search?: string
  page?: number
  limit?: number
  sortBy?: string | null
  sortOrder?: 'asc' | 'desc'
  /** Фильтр по компании (ID) */
  companyId?: string
}

export interface ContactsListResponse {
  contacts: Contact[]
  total: number
}

export const contactService = {
  getList: async (params: ContactsListParams): Promise<ContactsListResponse> => {
    const q = new URLSearchParams()
    if (params.search) q.set('search', params.search)
    if (params.page != null) q.set('page', String(params.page))
    if (params.limit != null) q.set('limit', String(params.limit))
    if (params.sortBy) q.set('sortBy', params.sortBy)
    if (params.sortOrder) q.set('sortOrder', params.sortOrder)
    if (params.companyId) q.set('companyId', params.companyId)
    const query = q.toString()
    const url = query
      ? `${API_ENDPOINTS.CRM.CONTACTS(params.workspaceId)}?${query}`
      : API_ENDPOINTS.CRM.CONTACTS(params.workspaceId)
    return api.get<ContactsListResponse>(url)
  },

  getById: async (workspaceId: string, id: string): Promise<Contact> => {
    return api.get<Contact>(API_ENDPOINTS.CRM.CONTACT(workspaceId, id))
  },

  create: async (workspaceId: string, data: CreateContactDto): Promise<Contact> => {
    return api.post<Contact>(API_ENDPOINTS.CRM.CONTACTS(workspaceId), data)
  },

  update: async (workspaceId: string, id: string, data: UpdateContactDto): Promise<Contact> => {
    return api.put<Contact>(API_ENDPOINTS.CRM.CONTACT(workspaceId, id), data)
  },

  delete: async (workspaceId: string, id: string): Promise<void> => {
    await api.delete(API_ENDPOINTS.CRM.CONTACT(workspaceId, id))
  },
}
