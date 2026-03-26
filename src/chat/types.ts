export type ChatUserId = string
export type WorkspaceId = string

export interface ChatWidgetUser {
  id: ChatUserId
  name: string
  email: string
  avatarUrl?: string
}

export interface ChatWidgetWorkspace {
  id: WorkspaceId
  name: string
}

/**
 * Минимальный контекст, который ERP передаёт виджету.
 * Виджет не должен знать внутренности ERP (сторы/роутер/права).
 */
export interface ChatWidgetContext {
  currentUser: ChatWidgetUser
  currentWorkspace: ChatWidgetWorkspace
}

export interface ChatRecipient extends ChatWidgetUser {
  /** Например, роль в workspace (если доступно) */
  role?: string
}

export type ChatThreadId = string
export type ChatMessageId = string

export type ChatThreadType = 'private' | 'group'

export interface ChatThread {
  id: ChatThreadId
  workspaceId: WorkspaceId
  type: ChatThreadType
  participantIds: ChatUserId[]
  title?: string
  updatedAt: string
  lastMessagePreview?: string
}

export interface ChatMessage {
  id: ChatMessageId
  threadId: ChatThreadId
  workspaceId: WorkspaceId
  authorId: ChatUserId
  text: string
  createdAt: string
}

