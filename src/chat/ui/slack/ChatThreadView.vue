<template>
  <div class="h-full min-h-0 flex flex-col bg-bg-primary">
    <div v-if="!store.currentThread" class="flex-1 min-h-0 p-(--spacing-8) flex items-center justify-center">
      <div class="max-w-md text-center">
        <p class="text-(--text-sm) font-medium text-text-primary mb-(--spacing-2)">Чат не выбран</p>
        <p class="text-(--text-sm) text-text-secondary">
          Выберите чат слева, чтобы увидеть сообщения.
        </p>
      </div>
    </div>

    <template v-else>
      <div class="px-(--spacing-4) py-(--spacing-3) border-b border-border-default flex items-center justify-between gap-(--spacing-3)">
        <div class="min-w-0">
          <p class="text-(--text-sm) font-medium text-text-primary truncate">
            {{ headerTitle }}
          </p>
          <p class="text-(--text-xs) text-text-secondary truncate">
            {{ store.context?.currentWorkspace?.name ?? '' }}
          </p>
        </div>
        <div class="flex items-center gap-(--spacing-2)">
          <Button
            variant="icon"
            size="md"
            icon-only
            :left-icon="CogIcon"
            aria-label="Настройки"
            @click="$emit('openSettings')"
          />
        </div>
      </div>

      <div ref="messagesEl" class="flex-1 min-h-0 overflow-y-auto p-(--spacing-4)" @scroll="onMessagesScroll">
        <div v-if="store.isLoadingMessages" class="text-(--text-sm) text-text-secondary">Загрузка…</div>
        <div v-else-if="!store.messages.length" class="text-(--text-sm) text-text-secondary">Пока нет сообщений.</div>
        <div v-else :ref="messagesListEl" class="space-y-(--spacing-3)">
          <div
            v-for="m in store.messages"
            :key="m.id"
            class="max-w-[85%] rounded-(--radius-lg) px-(--spacing-4) py-(--spacing-3)"
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

      <div class="px-(--spacing-4) py-(--spacing-3) border-t border-border-default flex items-center gap-(--spacing-3)">
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
  import { Button, Input } from '@/shared/ui'
  import { CogIcon, PaperAirplaneIcon } from '@/shared/ui/icon'
  import { useAutoAnimateRef } from '@/shared/lib/use-auto-animate-el'

  defineEmits<{
    (e: 'openSettings'): void
  }>()

  const store = useChatWidgetStore()
  const messagesEl = ref<HTMLElement | null>(null)
  const messagesListEl = useAutoAnimateRef({ duration: 160 })
  const messageInputRef = ref<{ focus?: () => void } | null>(null)

  const headerTitle = computed(() => {
    if (!store.currentThread) return 'Чат'
    return store.currentRecipient?.name || store.currentThread.title || 'Диалог'
  })

  const scrollToBottom = async (behavior: ScrollBehavior = 'auto') => {
    await nextTick()
    const el = messagesEl.value
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior })
  }

  const onMessagesScroll = () => {
    const el = messagesEl.value
    if (!el) return
    if (el.scrollTop <= 16) {
      void store.loadMoreMessagesUp()
    }
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

  const formatTime = (iso: string) => {
    try {
      return new Date(iso).toLocaleTimeString()
    } catch {
      return ''
    }
  }
</script>
