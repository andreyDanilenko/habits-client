import type { ChatThreadsProvider } from '@/chat/providers/chat-threads-provider'
import type { ListRecipientsParams } from '@/chat/providers/chat-provider'
import type { ChatMessage, ChatRecipient, ChatThread, ChatWidgetContext } from '@/chat/types'
import { workspaceService } from '@/entities/workspace'

type PersistedState = {
  threads: Record<string, ChatThread>
  messagesByThread: Record<string, ChatMessage[]>
}

const STORAGE_KEY = 'chatWidget.local.v1'
const CHANNEL = 'chatWidget.local.v1'

function nowIso() {
  return new Date().toISOString()
}

function readState(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { threads: {}, messagesByThread: {} }
    const parsed = JSON.parse(raw) as PersistedState
    return {
      threads: parsed?.threads ?? {},
      messagesByThread: parsed?.messagesByThread ?? {},
    }
  } catch {
    return { threads: {}, messagesByThread: {} }
  }
}

function writeState(state: PersistedState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

function normalizeSearch(s: string) {
  return s.trim().toLowerCase()
}

function includesNormalized(h: string, n: string) {
  return h.toLowerCase().includes(n)
}

function privateThreadKey(workspaceId: string, a: string, b: string) {
  const [x, y] = [a, b].sort()
  return `ws:${workspaceId}:private:${x}:${y}`
}

function makeId(prefix: string) {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`
}

export const localChatProvider: ChatThreadsProvider = {
  async listRecipients(ctx: ChatWidgetContext, params?: ListRecipientsParams): Promise<ChatRecipient[]> {
    const workspaceId = ctx.currentWorkspace.id
    const members = await workspaceService.getWorkspaceMembers(workspaceId)
    const selfId = ctx.currentUser.id
    const search = normalizeSearch(params?.search ?? '')
    const limit = params?.limit ?? 50

    return members
      .filter((m) => m.id !== selfId)
      .filter((m) => {
        if (!search) return true
        return includesNormalized(m.name ?? '', search) || includesNormalized(m.email ?? '', search)
      })
      .slice(0, Math.max(1, limit))
      .map((m) => ({
        id: m.id,
        name: m.name,
        email: m.email,
        avatarUrl: m.avatarUrl,
        role: m.systemRole,
      }))
  },

  async listThreads(ctx: ChatWidgetContext): Promise<ChatThread[]> {
    const wsId = ctx.currentWorkspace.id
    const state = readState()
    return Object.values(state.threads)
      .filter((t) => t.workspaceId === wsId && t.participantIds.includes(ctx.currentUser.id))
      .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
  },

  async getOrCreatePrivateThread(ctx: ChatWidgetContext, otherUserId: string): Promise<ChatThread> {
    const wsId = ctx.currentWorkspace.id
    const me = ctx.currentUser.id
    const key = privateThreadKey(wsId, me, otherUserId)
    const state = readState()

    const existing = Object.values(state.threads).find(
      (t) => t.workspaceId === wsId && t.type === 'private' && (t as any)._key === key,
    )
    if (existing) return existing

    const id = makeId('thread')
    const thread: ChatThread = {
      id,
      workspaceId: wsId,
      type: 'private',
      participantIds: [me, otherUserId],
      updatedAt: nowIso(),
    }

    ;(thread as any)._key = key
    state.threads[id] = thread
    state.messagesByThread[id] = state.messagesByThread[id] ?? []
    writeState(state)

    const bc = new BroadcastChannel(CHANNEL)
    bc.postMessage({ type: 'thread.updated', thread })
    bc.close()

    return thread
  },

  async listMessages(ctx: ChatWidgetContext, threadId: string): Promise<ChatMessage[]> {
    const wsId = ctx.currentWorkspace.id
    const state = readState()
    const list = state.messagesByThread[threadId] ?? []
    return list.filter((m) => m.workspaceId === wsId)
  },

  async sendMessage(ctx: ChatWidgetContext, threadId: string, text: string): Promise<ChatMessage> {
    const wsId = ctx.currentWorkspace.id
    const me = ctx.currentUser.id
    const clean = text.trim()
    if (!clean) throw new Error('EMPTY_MESSAGE')

    const state = readState()
    const msg: ChatMessage = {
      id: makeId('msg'),
      threadId,
      workspaceId: wsId,
      authorId: me,
      text: clean,
      createdAt: nowIso(),
    }

    state.messagesByThread[threadId] = [...(state.messagesByThread[threadId] ?? []), msg]

    const thread = state.threads[threadId]
    if (thread) {
      const updated: ChatThread = {
        ...thread,
        updatedAt: nowIso(),
        lastMessagePreview: clean.slice(0, 120),
      }
      state.threads[threadId] = updated
      writeState(state)

      const bc = new BroadcastChannel(CHANNEL)
      bc.postMessage({ type: 'message.created', message: msg })
      bc.postMessage({ type: 'thread.updated', thread: updated })
      bc.close()
    } else {
      writeState(state)
      const bc = new BroadcastChannel(CHANNEL)
      bc.postMessage({ type: 'message.created', message: msg })
      bc.close()
    }

    return msg
  },

  setTyping(ctx: ChatWidgetContext, threadId: string, isTyping: boolean) {
    const userId = ctx.currentUser.id
    const workspaceId = ctx.currentWorkspace.id
    const bc = new BroadcastChannel(CHANNEL)
    bc.postMessage({
      type: 'typing.updated',
      workspaceId,
      threadId,
      userId,
      isTyping,
    })
    bc.close()
  },

  subscribe(ctx: ChatWidgetContext, handler: (evt: any) => void) {
    const wsId = ctx.currentWorkspace.id
    const bc = new BroadcastChannel(CHANNEL)
    const onMessage = (e: MessageEvent) => {
      const data = e.data
      if (!data) return
      if (data?.thread?.workspaceId && data.thread.workspaceId !== wsId) return
      if (data?.message?.workspaceId && data.message.workspaceId !== wsId) return
      handler(data)
    }
    bc.addEventListener('message', onMessage)
    return () => {
      bc.removeEventListener('message', onMessage)
      bc.close()
    }
  },
}

