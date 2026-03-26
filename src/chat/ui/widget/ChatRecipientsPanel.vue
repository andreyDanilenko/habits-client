<template>
  <div class="h-full min-h-0 flex flex-col">
    <div
      class="px-(--spacing-4) py-(--spacing-3) bg-bg-tertiary border-b border-border-default flex items-center justify-between gap-(--spacing-3)"
    >
      <div class="min-w-0">
        <p class="text-(--text-sm) text-text-secondary truncate">
          {{ store.context?.currentWorkspace?.name ?? '—' }}
        </p>
      </div>
      <div class="flex items-center gap-(--spacing-2)">
        <Button
          v-if="showExpandToggle"
          variant="icon"
          size="md"
          icon-only
          :left-icon="expanded ? ArrowLeftIcon : ArrowRightIcon"
          :aria-label="expanded ? 'Сузить' : 'Расширить'"
          @click="$emit('toggleExpand')"
        />
        <Button
          v-if="showClose"
          variant="icon"
          size="md"
          icon-only
          :left-icon="XMarkIcon"
          aria-label="Закрыть"
          @click="$emit('close')"
        />
      </div>
    </div>

    <div class="px-(--spacing-4) py-(--spacing-3) border-b border-border-default space-y-(--spacing-2)">
      <SearchInput
        ref="searchInputRef"
        v-model="store.recipientSearch"
        class="w-full"
        placeholder="Поиск по имени или email"
        :debounce="250"
        @search="store.loadRecipients"
        @clear="store.loadRecipients"
      />
      <p v-if="!store.hasContext" class="text-(--text-xs) text-error-default">
        Нет контекста (user/workspace). Виджет должен быть смонтирован внутри ERP с активным workspace.
      </p>
    </div>

    <div class="flex-1 min-h-0 overflow-y-auto">
      <div v-if="store.isLoadingRecipients" class="p-(--spacing-4) text-(--text-sm) text-text-secondary">Загрузка…</div>
      <div v-else-if="store.recipientsError" class="p-(--spacing-4) text-(--text-sm) text-error-default">
        {{ store.recipientsError }}
      </div>
      <div v-else-if="!store.recipients.length" class="p-(--spacing-4) text-(--text-sm) text-text-secondary">
        Никого не найдено.
      </div>
      <div v-else :ref="recipientsListEl">
        <button
          v-for="r in store.recipients"
          :key="r.id"
          type="button"
          class="w-full px-(--spacing-4) py-(--spacing-3) text-left hover:bg-bg-tertiary border-b border-border-light flex items-center gap-(--spacing-3)"
          @click="$emit('recipientClick', r)"
        >
          <UserInfo
            :name="r.name"
            :email="r.email"
            :avatar-url="r.avatarUrl ? resolveAvatarUrl(r.avatarUrl) : undefined"
            size="sm"
            class="min-w-0 flex-1"
          />
          <Badge v-if="r.role" class="flex-shrink-0">{{ r.role }}</Badge>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { useChatWidgetStore } from '@/chat/model/use-chat-widget-store'
  import type { ChatRecipient } from '@/chat/types'
  import { Badge, Button, SearchInput, UserInfo } from '@/shared/ui'
  import { ArrowLeftIcon, ArrowRightIcon, XMarkIcon } from '@/shared/ui/icon'
  import { useAutoAnimateRef } from '@/shared/lib/use-auto-animate-el'

  const props = defineProps<{
    expanded: boolean
    showExpandToggle?: boolean
    showClose?: boolean
  }>()

  defineEmits<{
    (e: 'close'): void
    (e: 'toggleExpand'): void
    (e: 'recipientClick', recipient: ChatRecipient): void
  }>()

  const store = useChatWidgetStore()
  const recipientsListEl = useAutoAnimateRef({ duration: 160 })
  const searchInputRef = ref<{ focus?: () => void } | null>(null)

  const resolveAvatarUrl = (url: string) => {
    const apiBase = import.meta.env.VITE_API_URL ?? ''
    if (!url) return url
    if (url.startsWith('http://') || url.startsWith('https://')) return url
    return apiBase + url
  }

  const expanded = props.expanded
  const showExpandToggle = props.showExpandToggle ?? true
  const showClose = props.showClose ?? true

  defineExpose({
    focusSearch: () => searchInputRef.value?.focus?.(),
  })
</script>

