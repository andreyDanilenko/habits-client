import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import type { ChatThreadsProvider } from '@/chat/providers/chat-threads-provider'
import type { ChatMessage, ChatRecipient, ChatThread, ChatWidgetContext } from '@/chat/types'
import { backendChatProvider } from '@/chat/providers/backend-chat-provider'

export const useChatWidgetStore = defineStore('chatWidget', () => {
  const isOpen = ref(false)
  const isLoadingRecipients = ref(false)
  const recipientsError = ref<string | null>(null)

  const context = ref<ChatWidgetContext | null>(null)
  const provider = ref<ChatThreadsProvider>(backendChatProvider)

  const recipientSearch = ref('')
  const recipients = ref<ChatRecipient[]>([])

  const threads = ref<ChatThread[]>([])
  const currentThread = ref<ChatThread | null>(null)
  const currentRecipient = ref<ChatRecipient | null>(null)
  const messages = ref<ChatMessage[]>([])
  const isLoadingThreads = ref(false)
  const isLoadingMessages = ref(false)
  const messageDraft = ref('')
  const hasMoreMessages = ref(false)
  const oldestMessageCreatedAt = ref<string | null>(null)
  const unreadByThread = ref<Record<string, number>>({})
  const typingByThreadUser = ref<Record<string, Record<string, boolean>>>({})
  const onlineUserIds = ref<Record<string, boolean>>({})
  let unsubscribe: null | (() => void) = null

  const hasContext = computed(() => !!context.value?.currentUser?.id && !!context.value?.currentWorkspace?.id)
  const totalUnread = computed(() => Object.values(unreadByThread.value).reduce((sum, n) => sum + (n || 0), 0))
  const hasUnread = computed(() => totalUnread.value > 0)

  const setContext = (ctx: ChatWidgetContext | null) => {
    context.value = ctx
  }

  const setProvider = (p: ChatThreadsProvider) => {
    provider.value = p
  }

  const toggle = () => {
    isOpen.value = !isOpen.value
  }

  const close = () => {
    isOpen.value = false
  }

  const loadRecipients = async () => {
    if (!context.value) return
    isLoadingRecipients.value = true
    recipientsError.value = null
    try {
      recipients.value = await provider.value.listRecipients(context.value, {
        search: recipientSearch.value,
        limit: 50,
      })
    } catch (e: any) {
      console.error('ChatWidget: failed to load recipients', e)
      recipients.value = []
      recipientsError.value = e?.response?.data?.message ?? e?.message ?? 'Не удалось загрузить пользователей'
    } finally {
      isLoadingRecipients.value = false
    }
  }

  const loadThreads = async () => {
    if (!context.value) return
    isLoadingThreads.value = true
    try {
      threads.value = await provider.value.listThreads(context.value)
    } finally {
      isLoadingThreads.value = false
    }
  }

  const openOrCreatePrivateThread = async (recipient: ChatRecipient) => {
    if (!context.value) return
    currentRecipient.value = recipient
    const thread = await provider.value.getOrCreatePrivateThread(context.value, recipient.id)
    currentThread.value = thread
    unreadByThread.value[thread.id] = 0
    await loadThreads()
    await loadMessages(thread.id)
  }

  const openThread = async (thread: ChatThread) => {
    if (!context.value) return
    currentThread.value = thread
    currentRecipient.value = null
    unreadByThread.value[thread.id] = 0
    await loadMessages(thread.id)
  }

  const closeThread = () => {
    currentThread.value = null
    currentRecipient.value = null
    messages.value = []
    messageDraft.value = ''
    hasMoreMessages.value = false
    oldestMessageCreatedAt.value = null
  }

  const markThreadRead = (threadId: string) => {
    unreadByThread.value[threadId] = 0
  }

  const isUserOnline = (userId?: string | null) => {
    if (!userId) return false
    return Boolean(onlineUserIds.value[userId])
  }

  const isUserTypingInThread = (threadId?: string | null, userId?: string | null) => {
    if (!threadId || !userId) return false
    return Boolean(typingByThreadUser.value[threadId]?.[userId])
  }

  const isAnyOtherTypingInThread = (threadId?: string | null) => {
    if (!threadId || !context.value?.currentUser?.id) return false
    const byThread = typingByThreadUser.value[threadId] ?? {}
    const me = context.value.currentUser.id
    return Object.entries(byThread).some(([userId, typing]) => userId !== me && typing)
  }

  const setTyping = (isTyping: boolean) => {
    if (!context.value || !currentThread.value) return
    provider.value.setTyping(context.value, currentThread.value.id, isTyping)
  }

  const loadMessages = async (threadId: string) => {
    if (!context.value) return
    isLoadingMessages.value = true
    try {
      messages.value = await provider.value.listMessages(context.value, threadId)
      oldestMessageCreatedAt.value = messages.value[0]?.createdAt ?? null
      // пока без cursor/limit на бэке — считаем, что "ещё есть" если набрали 50+
      hasMoreMessages.value = messages.value.length >= 50
    } finally {
      isLoadingMessages.value = false
    }
  }

  const loadMoreMessagesUp = async () => {
    if (!context.value || !currentThread.value) return
    if (!hasMoreMessages.value) return
    if (!oldestMessageCreatedAt.value) return
    // В текущей реализации backend provider ещё не поддерживает cursor,
    // поэтому пока просто повторно загружаем (дальше расширим API).
    // Заглушка: не делаем ничего.
  }

  const sendMessage = async () => {
    if (!context.value || !currentThread.value) return
    const text = messageDraft.value
    if (!text.trim()) return
    messageDraft.value = ''
    try {
      await provider.value.sendMessage(context.value, currentThread.value.id, text)
      await loadThreads()
      const id = currentThread.value.id
      await loadMessages(id)
    } catch (e) {
      // если не удалось — вернём драфт
      messageDraft.value = text
      throw e
    }
  }

  const setupSubscription = () => {
    if (!context.value) return
    if (unsubscribe) unsubscribe()
    unsubscribe = provider.value.subscribe(context.value, (evt: any) => {
      const currentWsId = context.value?.currentWorkspace?.id
      if ('workspaceId' in evt && evt.workspaceId && currentWsId && evt.workspaceId !== currentWsId) {
        return
      }
      if (evt?.type === 'message.created') {
        if (evt.message.authorId === context.value?.currentUser?.id) {
          void loadThreads()
          return
        }
        const currentId = currentThread.value?.id
        if (currentId && currentId === evt.message.threadId) {
          void loadMessages(currentId)
          unreadByThread.value[currentId] = 0
        } else {
          unreadByThread.value[evt.message.threadId] = (unreadByThread.value[evt.message.threadId] ?? 0) + 1
        }
        void loadThreads()
      }
      if (evt?.type === 'thread.updated') {
        void loadThreads()
      }
      if (evt?.type === 'typing.updated') {
        const byThread = { ...(typingByThreadUser.value[evt.threadId] ?? {}) }
        if (evt.isTyping) byThread[evt.userId] = true
        else delete byThread[evt.userId]
        typingByThreadUser.value = {
          ...typingByThreadUser.value,
          [evt.threadId]: byThread,
        }
      }
      if (evt?.type === 'presence.updated') {
        onlineUserIds.value = {
          ...onlineUserIds.value,
          [evt.userId]: evt.isOnline,
        }
      }
    })
  }

  const teardownSubscription = () => {
    if (unsubscribe) {
      unsubscribe()
      unsubscribe = null
    }
  }

  watch(
    () => [context.value?.currentWorkspace?.id, context.value?.currentUser?.id],
    () => {
      recipients.value = []
      recipientsError.value = null
      recipientSearch.value = ''
      threads.value = []
      currentThread.value = null
      currentRecipient.value = null
      messages.value = []
      messageDraft.value = ''
      hasMoreMessages.value = false
      oldestMessageCreatedAt.value = null
      unreadByThread.value = {}
      typingByThreadUser.value = {}
      onlineUserIds.value = {}
      teardownSubscription()
      if (hasContext.value) {
        void loadThreads()
        setupSubscription()
        if (isOpen.value) {
          void loadRecipients()
        }
      }
    },
  )

  watch(
    () => isOpen.value,
    (open) => {
      if (!open) {
        currentThread.value = null
        currentRecipient.value = null
        return
      }
      if (hasContext.value) {
        void loadRecipients()
        void loadThreads()
      }
    },
  )

  return {
    isOpen,
    isLoadingRecipients,
    recipientsError,
    context,
    recipientSearch,
    recipients,
    hasContext,
    threads,
    currentThread,
    currentRecipient,
    messages,
    isLoadingThreads,
    isLoadingMessages,
    messageDraft,
    hasMoreMessages,
    totalUnread,
    hasUnread,
    setContext,
    setProvider,
    toggle,
    close,
    loadRecipients,
    loadThreads,
    openOrCreatePrivateThread,
    openThread,
    closeThread,
    markThreadRead,
    loadMessages,
    loadMoreMessagesUp,
    isUserOnline,
    isUserTypingInThread,
    isAnyOtherTypingInThread,
    setTyping,
    sendMessage,
  }
})

