import type { ChatMessage, ChatRecipient, ChatThread, ChatWidgetContext } from '@/chat/types'
import type { ListRecipientsParams } from '@/chat/providers/chat-provider'

export type ChatThreadEvent =
  | { type: 'message.created'; message: ChatMessage }
  | { type: 'thread.updated'; thread: ChatThread }
  | { type: 'typing.updated'; workspaceId: string; threadId: string; userId: string; isTyping: boolean }
  | { type: 'presence.updated'; workspaceId: string; userId: string; isOnline: boolean }

export interface ChatThreadsProvider {
  listRecipients(ctx: ChatWidgetContext, params?: ListRecipientsParams): Promise<ChatRecipient[]>

  listThreads(ctx: ChatWidgetContext): Promise<ChatThread[]>
  getOrCreatePrivateThread(ctx: ChatWidgetContext, otherUserId: string): Promise<ChatThread>

  listMessages(ctx: ChatWidgetContext, threadId: string): Promise<ChatMessage[]>
  sendMessage(ctx: ChatWidgetContext, threadId: string, text: string): Promise<ChatMessage>
  setTyping(ctx: ChatWidgetContext, threadId: string, isTyping: boolean): void

  subscribe(ctx: ChatWidgetContext, handler: (evt: ChatThreadEvent) => void): () => void
}

