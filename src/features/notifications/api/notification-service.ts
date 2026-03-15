import { api, API_ENDPOINTS } from '@/shared/api'

export interface NotificationDto {
  id: string
  userId: string
  workspaceId?: string
  channel: string
  eventType: string
  eventKey: string
  title: string
  subtitle?: string
  payload?: Record<string, unknown>
  createdAt: string
  readAt?: string
}

export interface CreateNotificationDto {
  workspaceId?: string
  channel: string
  eventType: string
  eventKey: string
  title: string
  subtitle?: string
  payload?: Record<string, unknown>
}

export interface NotificationListParams {
  channel?: string
  unreadOnly?: boolean
  limit?: number
  offset?: number
}

export const notificationService = {
  list: async (
    params?: NotificationListParams,
  ): Promise<{ notifications: NotificationDto[]; total: number }> => {
    const search = new URLSearchParams()
    if (params?.channel) search.set('channel', params.channel)
    if (params?.unreadOnly) search.set('unreadOnly', 'true')
    if (params?.limit != null) search.set('limit', String(params.limit))
    if (params?.offset != null) search.set('offset', String(params.offset))
    const q = search.toString()
    const url = q ? `${API_ENDPOINTS.ME.NOTIFICATIONS}?${q}` : API_ENDPOINTS.ME.NOTIFICATIONS
    return api.get<{ notifications: NotificationDto[]; total: number }>(url)
  },

  create: (dto: CreateNotificationDto): Promise<NotificationDto> =>
    api.post<NotificationDto>(API_ENDPOINTS.ME.NOTIFICATIONS, dto),

  markRead: (id: string): Promise<void> =>
    api.patch<void>(API_ENDPOINTS.ME.NOTIFICATION_READ(id)),

  markAllRead: (channel?: string): Promise<void> => {
    const url = channel
      ? `${API_ENDPOINTS.ME.NOTIFICATIONS_MARK_ALL_READ}?channel=${encodeURIComponent(channel)}`
      : API_ENDPOINTS.ME.NOTIFICATIONS_MARK_ALL_READ
    return api.post<void>(url)
  },
}
