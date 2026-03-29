<template>
  <div class="fixed bottom-(--spacing-6) right-(--spacing-6) z-[1000]">
    <Transition name="chat-shell" mode="out-in">
      <div v-if="!store.isOpen" key="closed">
        <Button
          variant="primary"
          size="lg"
          icon-only
          icon-size="sm"
          :left-icon="ChatBubbleLeftRightIcon"
          aria-label="Открыть чат"
          class="relative"
          @click="onToggle"
        >
          <span
            v-if="store.hasUnread"
            class="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 bg-error-default text-white text-[10px] font-medium rounded-full flex items-center justify-center leading-none"
          >
            <Transition name="badge-number" mode="out-in">
              <span :key="store.totalUnread" class="inline-block">
                {{ store.totalUnread > 99 ? '99+' : store.totalUnread }}
              </span>
            </Transition>
          </span>
        </Button>
      </div>

      <div
        v-else
        key="open"
        class="chat-panel mt-(--spacing-4) max-w-[calc(100vw-2rem)]"
        :class="isExpanded ? 'chat-panel--expanded' : 'chat-panel--compact'"
      >
        <div v-if="isExpanded" class="h-full min-h-0 flex overflow-hidden rounded-(--radius-xl)  border-border-default">
          <div class="w-[380px] max-w-[85vw] flex-shrink-0 bg-bg-secondary border-r border-border-default">
            <ChatRecipientsPanel
              ref="recipientsPanelRef"
              :expanded="true"
              :show-expand-toggle="true"
              @toggleExpand="requestCompact"
              :show-close="false"
              @recipientClick="onRecipientClick"
            />
          </div>
          <div class="flex-1 min-w-0 bg-bg-primary">
            <ChatThreadPanel
              :show-back="false"
              :empty-state="true"
              :show-close="true"
              @close="store.close"
            />
          </div>
        </div>

        <Card v-else class="h-full flex flex-col overflow-hidden p-0">
          <Transition name="chat-view" mode="out-in">
            <ChatRecipientsPanel
              v-if="!store.currentThread"
              key="list"
              ref="recipientsPanelRef"
              :expanded="false"
              :show-expand-toggle="true"
              :show-close="true"
              @toggleExpand="requestExpanded"
              @close="store.close"
              @recipientClick="onRecipientClick"
            />
            <ChatThreadPanel
              v-else
              key="thread"
              :show-back="true"
              :empty-state="false"
              :show-close="true"
              @back="closeThread"
              @close="store.close"
            />
          </Transition>
        </Card>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
  import { nextTick, onMounted, ref, watch } from 'vue'
  import { useChatWidgetStore } from '@/chat/model/use-chat-widget-store'
  import type { ChatRecipient, ChatWidgetContext } from '@/chat/types'
  import { useUserStore } from '@/entities/user'
  import { useWorkspaceStore } from '@/entities/workspace'
  import { Button, Card } from '@/shared/ui'
  import { ChatBubbleLeftRightIcon } from '@/shared/ui/icon'
  import ChatRecipientsPanel from '@/chat/ui/widget/ChatRecipientsPanel.vue'
  import ChatThreadPanel from '@/chat/ui/widget/ChatThreadPanel.vue'

  const props = defineProps<{
    /** Изоляция: ERP может передать явный контекст. */
    context?: ChatWidgetContext
  }>()

  const emit = defineEmits<{
    (e: 'recipientClick', recipient: ChatRecipient): void
  }>()

  const store = useChatWidgetStore()
  const isExpanded = ref(false)
  const recipientsPanelRef = ref<{ focusSearch?: () => void } | null>(null)

  const deriveContextFromErpStores = (): ChatWidgetContext | null => {
    const userStore = useUserStore()
    const workspaceStore = useWorkspaceStore()
    const u = userStore.currentUser
    const ws = workspaceStore.currentWorkspace
    if (!u || !ws) return null
    return {
      currentUser: {
        id: u.id,
        name: u.name ?? u.email,
        email: u.email,
        avatarUrl: (u as any).avatarUrl ?? (u as any).avatarUrl,
      },
      currentWorkspace: { id: ws.id, name: ws.name },
    }
  }

  const syncContext = () => {
    store.setContext(props.context ?? deriveContextFromErpStores())
  }

  const onToggle = () => {
    store.toggle()
  }

  const requestExpanded = () => {
    isExpanded.value = true
  }

  const requestCompact = () => {
    isExpanded.value = false
  }

  const onRecipientClick = (r: ChatRecipient) => {
    emit('recipientClick', r)
    void store.openOrCreatePrivateThread(r).then(() => {
      if (store.currentThread?.id) store.markThreadRead(store.currentThread.id)
    })
  }

  const closeThread = () => {
    if (store.currentThread?.id) store.markThreadRead(store.currentThread.id)
    store.closeThread()
    void nextTick().then(() => recipientsPanelRef.value?.focusSearch?.())
  }

  onMounted(() => {
    syncContext()
  })

  watch(
    () => props.context,
    () => syncContext(),
    { deep: true },
  )

  watch(
    () => store.isOpen,
    async (open) => {
      if (!open) {
        // при закрытии не делаем дополнительный resize (он и даёт "дергание")
        isExpanded.value = false
        return
      }
      // Всегда открываем виджет на списке (как в ТЗ)
      store.closeThread()
      isExpanded.value = false
      await nextTick()
      recipientsPanelRef.value?.focusSearch?.()
    },
  )
</script>

<style scoped>
  /* Только opacity + transform: без clip-path — меньше repaints и артефактов «лесенки» */
  .chat-shell-enter-active,
  .chat-shell-leave-active {
    transition:
      opacity 200ms cubic-bezier(0.16, 1, 0.3, 1),
      transform 200ms cubic-bezier(0.16, 1, 0.3, 1);
    transform-origin: bottom right;
  }

  .chat-shell-enter-from,
  .chat-shell-leave-to {
    opacity: 0;
    transform: translate3d(0, 6px, 0) scale(0.96);
  }

  .chat-panel {
    width: 380px;
    height: 560px;
    overflow: hidden;
    transition:
      width 420ms cubic-bezier(0.16, 1, 0.3, 1),
      height 420ms cubic-bezier(0.16, 1, 0.3, 1);
  }

  .chat-panel--expanded {
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-xl);
    width: 960px;
    height: 640px;
  }

  .chat-view-enter-active,
  .chat-view-leave-active {
    transition:
      opacity 180ms ease,
      transform 180ms ease;
    will-change: opacity, transform;
  }

  .chat-view-enter-from,
  .chat-view-leave-to {
    opacity: 0;
    transform: translateX(8px);
  }

  .badge-number-enter-active,
  .badge-number-leave-active {
    transition:
      opacity 0.2s ease,
      transform 0.2s ease;
  }
  .badge-number-enter-from {
    opacity: 0;
    transform: scale(0.8);
  }
  .badge-number-leave-to {
    opacity: 0;
    transform: scale(1.1);
  }
</style>

