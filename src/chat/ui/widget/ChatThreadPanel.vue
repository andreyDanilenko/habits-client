<template>
  <div class="h-full min-h-0 flex flex-col">
    <div
      class="px-(--spacing-4) py-(--spacing-3) bg-bg-tertiary border-b border-border-default flex items-center gap-(--spacing-3)"
    >
      <Button
        v-if="showBack"
        variant="icon"
        size="md"
        icon-only
        :left-icon="ArrowLeftIcon"
        aria-label="Назад"
        @click="$emit('back')"
      />
      <div v-if="store.currentThread" class="min-w-0 flex-1">
        <UserInfo
          class="min-w-0"
          :name="headerName"
          :email="statusText"
          :avatar-url="headerAvatarUrl"
          size="sm"
        />
      </div>
      <Button
        v-if="showExpandToggle"
        variant="icon"
        size="md"
        icon-only
        :left-icon="ArrowRightIcon"
        aria-label="Расширить"
        @click="$emit('toggleExpand')"
      />
      <Button
        v-if="showClose"
        variant="icon"
        size="md"
        class="ml-auto"
        icon-only
        :left-icon="XMarkIcon"
        aria-label="Закрыть"
        @click="$emit('close')"
      />
    </div>

    <div v-if="!store.currentThread && emptyState" class="flex-1 min-h-0 p-(--spacing-8) flex items-center justify-center">
      <div class="max-w-md text-center">
        <p class="text-(--text-sm) font-medium text-text-primary mb-(--spacing-2)">Чат не выбран</p>
        <p class="text-(--text-sm) text-text-secondary">Выберите собеседника в списке слева.</p>
      </div>
    </div>

    <template v-else>
      <div
        ref="messagesEl"
        class="flex-1 min-h-0 overflow-y-auto p-(--spacing-4) space-y-(--spacing-3)"
        @scroll="onMessagesScroll"
      >
        <div v-if="store.isLoadingMessages" class="text-(--text-sm) text-text-secondary">Загрузка…</div>
        <div v-else-if="!store.messages.length" class="text-(--text-sm) text-text-secondary">Пока нет сообщений.</div>
        <div v-else :ref="messagesListEl">
          <div
            v-for="m in store.messages"
            :key="m.id"
            class="max-w-[85%] rounded-(--radius-lg) px-(--spacing-4) py-(--spacing-3) mb-(--spacing-3) last:mb-0"
            :class="
              m.authorId === store.context?.currentUser.id
                ? 'ml-auto bg-primary-default text-white'
                : 'bg-bg-tertiary text-text-primary'
            "
          >
            <div class="text-(--text-sm) whitespace-pre-wrap break-words">{{ m.text }}</div>
            <div class="mt-(--spacing-1) text-(--text-xs) opacity-80">
              {{ formatTime(m.createdAt) }}
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="store.currentThread"
        class="px-(--spacing-4) py-(--spacing-3) border-t border-border-default flex items-center gap-(--spacing-3)"
      >
        <Input
          ref="messageInputRef"
          v-model="store.messageDraft"
          class="flex-1 min-w-0"
          placeholder="Введите сообщение…"
          @keydown.enter.prevent="store.sendMessage"
        />
        <Button
          variant="primary"
          size="md"
          icon-only
          icon-size="sm"
          :left-icon="PaperAirplaneIcon"
          :disabled="!store.messageDraft.trim()"
          aria-label="Отправить сообщение"
          @click="store.sendMessage"
        />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
  import { computed, nextTick, ref, watch } from 'vue'
  import { useChatWidgetStore } from '@/chat/model/use-chat-widget-store'
  import { Button, Input, UserInfo } from '@/shared/ui'
  import { ArrowLeftIcon, ArrowRightIcon, PaperAirplaneIcon, XMarkIcon } from '@/shared/ui/icon'
  import { useAutoAnimateRef } from '@/shared/lib/use-auto-animate-el'

  const props = defineProps<{
    showBack?: boolean
    emptyState?: boolean
    showExpandToggle?: boolean
    showClose?: boolean
  }>()

  defineEmits<{
    (e: 'back'): void
    (e: 'close'): void
    (e: 'toggleExpand'): void
  }>()

  const store = useChatWidgetStore()
  const resolveAvatarUrl = (url: string) => {
    const apiBase = import.meta.env.VITE_API_URL ?? ''
    if (!url) return url
    if (url.startsWith('http://') || url.startsWith('https://')) return url
    return apiBase + url
  }

  const headerName = computed(() => {
    return store.currentRecipient?.name || store.currentThread?.title || store.currentRecipient?.email || 'Диалог'
  })

  const headerAvatarUrl = computed(() => {
    const url = (store.currentRecipient as any)?.avatarUrl as string | undefined
    return url ? resolveAvatarUrl(url) : undefined
  })

  const isOnline = computed(() => {
    const userId = store.currentRecipient?.id
    return store.isUserOnline(userId)
  })
  const isTyping = computed(() => {
    const threadId = store.currentThread?.id
    const userId = store.currentRecipient?.id
    if (userId) return store.isUserTypingInThread(threadId, userId)
    return store.isAnyOtherTypingInThread(threadId)
  })
  const statusText = computed(() => {
    if (isTyping.value) return 'Печатает...'
    return isOnline.value ? 'В сети' : 'Не в сети'
  })
  const messagesEl = ref<HTMLElement | null>(null)
  const messageInputRef = ref<{ focus?: () => void } | null>(null)
  const messagesListEl = useAutoAnimateRef({ duration: 160 })
  let typingTimer: number | null = null

  const onMessagesScroll = () => {
    const el = messagesEl.value
    if (!el) return
    if (el.scrollTop <= 16) {
      void store.loadMoreMessagesUp()
    }
  }

  const scrollToBottom = async (behavior: ScrollBehavior = 'auto') => {
    await nextTick()
    const el = messagesEl.value
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior })
  }

  watch(
    () => store.currentThread?.id,
    async (id) => {
      if (id) {
        await scrollToBottom('auto')
        messageInputRef.value?.focus?.()
      }
    },
  )

  watch(
    () => store.messages.length,
    async () => {
      const el = messagesEl.value
      if (!el) return
      const distanceToBottom = el.scrollHeight - (el.scrollTop + el.clientHeight)
      if (distanceToBottom < 80) {
        await scrollToBottom('auto')
      }
    },
  )

  watch(
    () => [store.currentThread?.id, store.messageDraft],
    ([threadId, draft]) => {
      if (!threadId) return
      const hasText = Boolean((draft ?? '').trim())
      store.setTyping(hasText)
      if (typingTimer) window.clearTimeout(typingTimer)
      if (!hasText) return
      typingTimer = window.setTimeout(() => {
        store.setTyping(false)
        typingTimer = null
      }, 2000)
    },
  )

  watch(
    () => store.currentThread?.id,
    () => {
      if (typingTimer) {
        window.clearTimeout(typingTimer)
        typingTimer = null
      }
      store.setTyping(false)
    },
  )

  const formatTime = (iso: string) => {
    try {
      return new Date(iso).toLocaleTimeString()
    } catch {
      return ''
    }
  }

  const showBack = props.showBack ?? false
  const emptyState = props.emptyState ?? false
  const showExpandToggle = props.showExpandToggle ?? false
  const showClose = props.showClose ?? true
</script>

