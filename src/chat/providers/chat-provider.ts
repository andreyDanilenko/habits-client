import type { ChatRecipient, ChatWidgetContext } from '@/chat/types'

export interface ListRecipientsParams {
  /** Поиск по имени/email */
  search?: string
  /** Ограничение */
  limit?: number
}

/**
 * Абстракция источника данных для чата.
 * Сегодня это может быть ERP API (/workspaces/:id/members),
 * завтра — PocketBase/сервис чата/агрегатор интеграций.
 */
export interface ChatProvider {
  listRecipients(ctx: ChatWidgetContext, params?: ListRecipientsParams): Promise<ChatRecipient[]>
}

