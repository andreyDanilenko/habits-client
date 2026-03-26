import type { ChatThreadsProvider, ChatThreadEvent } from '@/chat/providers/chat-threads-provider'
import type { ListRecipientsParams } from '@/chat/providers/chat-provider'
import type { ChatMessage, ChatRecipient, ChatThread, ChatWidgetContext } from '@/chat/types'
import { api } from '@/shared/api'
import { workspaceService } from '@/entities/workspace'
import { io, type Socket } from 'socket.io-client'

type ApiThread = {
  id: string
  workspaceId: string
  type: 'private' | 'group'
  title?: string | null
  createdBy: string
  createdAt: string
  updatedAt: string
  lastMessagePreview?: string | null
}

type ApiMessage = {
  id: string
  threadId: string
  workspaceId: string
  authorId: string
  body: string
  createdAt: string
}

// Same-origin: в dev через Vite proxy, в prod через nginx proxy
const REALTIME_URL = import.meta.env.VITE_REALTIME_URL || ''

let socket: Socket | null = null
let joinedWorkspaceId: string | null = null

function getSocket(): Socket {
  if (socket) return socket
  const base = REALTIME_URL || (typeof window !== 'undefined' ? window.location.origin : '')
  const url = `${base}/chat`
  socket = io(url, {
    path: '/socket.io',
    withCredentials: true,
    transports: ['websocket', 'polling'],
  })
  return socket
}

function ensureJoined(workspaceId: string) {
  const s = getSocket()
  const join = () => {
    if (joinedWorkspaceId === workspaceId) return
    s.emit('joinWorkspace', workspaceId)
    joinedWorkspaceId = workspaceId
  }
  if (s.connected) join()
  else s.on('connect', join)
}

function includesNormalized(haystack: string, needle: string) {
  return haystack.toLowerCase().includes(needle.trim().toLowerCase())
}

export const backendChatProvider: ChatThreadsProvider = {
  async listRecipients(ctx: ChatWidgetContext, params?: ListRecipientsParams): Promise<ChatRecipient[]> {
    const workspaceId = ctx.currentWorkspace.id
    const members = await workspaceService.getWorkspaceMembers(workspaceId)

    const selfId = ctx.currentUser.id
    const search = (params?.search ?? '').trim()
    const limit = params?.limit ?? 50

    const filtered = members
      .filter((m) => m.id !== selfId)
      .filter((m) => {
        if (!search) return true
        return includesNormalized(m.name ?? '', search) || includesNormalized(m.email ?? '', search)
      })
      .slice(0, Math.max(1, limit))

    return filtered.map((m) => ({
      id: m.id,
      name: m.name,
      email: m.email,
      avatarUrl: m.avatarUrl,
      role: m.systemRole,
    }))
  },

  async listThreads(ctx: ChatWidgetContext): Promise<ChatThread[]> {
    const wsId = ctx.currentWorkspace.id
    const res = await api.get<{ threads: ApiThread[] }>(`/api/v1/workspaces/${wsId}/chat/threads`)
    return (res.threads ?? []).map((t) => ({
      id: t.id,
      workspaceId: t.workspaceId,
      type: t.type,
      participantIds: [], // UI пока не использует; можно добавить отдельный endpoint позже
      title: t.title ?? undefined,
      updatedAt: t.updatedAt,
      lastMessagePreview: t.lastMessagePreview ?? undefined,
    }))
  },

  async getOrCreatePrivateThread(ctx: ChatWidgetContext, otherUserId: string): Promise<ChatThread> {
    const wsId = ctx.currentWorkspace.id
    const res = await api.post<{ thread: ApiThread }>(`/api/v1/workspaces/${wsId}/chat/threads/private`, {
      otherUserId,
    })
    const t = res.thread
    return {
      id: t.id,
      workspaceId: t.workspaceId,
      type: t.type,
      participantIds: [],
      title: t.title ?? undefined,
      updatedAt: t.updatedAt,
      lastMessagePreview: t.lastMessagePreview ?? undefined,
    }
  },

  async listMessages(ctx: ChatWidgetContext, threadId: string): Promise<ChatMessage[]> {
    const wsId = ctx.currentWorkspace.id
    const res = await api.get<{ messages: ApiMessage[] }>(
      `/api/v1/workspaces/${wsId}/chat/threads/${threadId}/messages`,
    )
    return (res.messages ?? []).map((m) => ({
      id: m.id,
      threadId: m.threadId,
      workspaceId: m.workspaceId,
      authorId: m.authorId,
      text: m.body,
      createdAt: m.createdAt,
    }))
  },

  async sendMessage(ctx: ChatWidgetContext, threadId: string, text: string): Promise<ChatMessage> {
    const wsId = ctx.currentWorkspace.id
    const res = await api.post<{ message: ApiMessage }>(
      `/api/v1/workspaces/${wsId}/chat/threads/${threadId}/messages`,
      { body: text },
    )
    const m = res.message
    return {
      id: m.id,
      threadId: m.threadId,
      workspaceId: m.workspaceId,
      authorId: m.authorId,
      text: m.body,
      createdAt: m.createdAt,
    }
  },

  setTyping(ctx: ChatWidgetContext, threadId: string, isTyping: boolean) {
    const wsId = ctx.currentWorkspace.id
    ensureJoined(wsId)
    const s = getSocket()
    s.emit('chat.typing', {
      workspaceId: wsId,
      threadId,
      isTyping,
    })
  },

  subscribe(ctx: ChatWidgetContext, handler: (evt: ChatThreadEvent) => void) {
    const wsId = ctx.currentWorkspace.id
    ensureJoined(wsId)
    const s = getSocket()

    const onMsg = (payload: any) => {
      const message = payload?.message
      if (!message) return
      handler({
        type: 'message.created',
        message: {
          id: message.id,
          threadId: message.threadId,
          workspaceId: message.workspaceId,
          authorId: message.authorId,
          text: message.body,
          createdAt: message.createdAt,
        },
      })
    }

    const onThread = (payload: any) => {
      const thread = payload?.thread
      if (!thread) return
      handler({
        type: 'thread.updated',
        thread: {
          id: thread.id,
          workspaceId: thread.workspaceId,
          type: thread.type,
          participantIds: [],
          title: thread.title ?? undefined,
          updatedAt: thread.updatedAt,
          lastMessagePreview: thread.lastMessagePreview ?? undefined,
        },
      })
    }

    const onTyping = (payload: any) => {
      const workspaceId = payload?.workspaceId
      const threadId = payload?.threadId
      const userId = payload?.userId
      const isTyping = Boolean(payload?.isTyping)
      if (!workspaceId || !threadId || !userId) return
      handler({
        type: 'typing.updated',
        workspaceId,
        threadId,
        userId,
        isTyping,
      })
    }

    const onPresence = (payload: any) => {
      const workspaceId = payload?.workspaceId
      const userId = payload?.userId
      if (!workspaceId || !userId) return
      handler({
        type: 'presence.updated',
        workspaceId,
        userId,
        isOnline: Boolean(payload?.isOnline),
      })
    }

    s.on('chat.message.created', onMsg)
    s.on('chat.thread.upserted', onThread)
    s.on('chat.typing.updated', onTyping)
    s.on('chat.presence.updated', onPresence)
    return () => {
      s.off('chat.message.created', onMsg)
      s.off('chat.thread.upserted', onThread)
      s.off('chat.typing.updated', onTyping)
      s.off('chat.presence.updated', onPresence)
    }
  },
}

