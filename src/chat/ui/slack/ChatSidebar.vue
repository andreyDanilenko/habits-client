<template>
  <div class="h-full min-h-0 flex flex-col border-r border-border-default bg-bg-secondary">
    <div class="px-(--spacing-4) py-(--spacing-3) border-b border-border-default flex items-center justify-between gap-(--spacing-3)">
      <div class="min-w-0">
        <p class="text-(--text-sm) font-medium text-text-primary truncate">Чат</p>
        <p class="text-(--text-xs) text-text-secondary truncate">
          {{ store.context?.currentWorkspace?.name ?? '—' }}
        </p>
      </div>
      <div class="flex items-center gap-(--spacing-2)">
        <Button
          variant="icon"
          size="md"
          icon-only
          :left-icon="expanded ? ArrowLeftIcon : ArrowRightIcon"
          :aria-label="expanded ? 'Сузить' : 'Расширить'"
          @click="$emit('toggleExpand')"
        />
        <Button variant="icon" size="md" icon-only :left-icon="XMarkIcon" aria-label="Закрыть" @click="store.close" />
      </div>
    </div>

    <div class="px-(--spacing-4) py-(--spacing-3) border-b border-border-default space-y-(--spacing-2)">
      <SearchInput
        v-model="threadSearch"
        class="w-full"
        placeholder="Поиск по чатам"
        :debounce="150"
      />

      <p v-if="!store.hasContext" class="text-(--text-xs) text-error-default">
        Нет контекста (user/workspace). Чат доступен только внутри workspace.
      </p>
    </div>

    <div class="flex-1 min-h-0 overflow-y-auto">
      <div class="px-(--spacing-4) pt-(--spacing-3) pb-(--spacing-2)">
        <p class="text-(--text-xs) font-medium text-text-secondary uppercase tracking-wide">Чаты</p>
      </div>

      <div v-if="store.isLoadingThreads" class="px-(--spacing-4) py-(--spacing-3) text-(--text-sm) text-text-secondary">
        Загрузка…
      </div>
      <div
        v-else-if="!filteredThreads.length"
        class="px-(--spacing-4) py-(--spacing-3) text-(--text-sm) text-text-secondary"
      >
        Нет чатов.
      </div>

      <div v-else :ref="threadsListEl">
        <button
          v-for="t in filteredThreads"
          :key="t.id"
          type="button"
          class="w-full px-(--spacing-4) py-(--spacing-3) text-left hover:bg-bg-tertiary border-b border-border-light flex items-center gap-(--spacing-3)"
          :class="store.currentThread?.id === t.id ? 'bg-bg-tertiary' : ''"
          @click="store.openThread(t)"
        >
          <div
            class="size-9 rounded-full bg-bg-tertiary border border-border-light flex items-center justify-center flex-shrink-0"
            :class="store.currentThread?.id === t.id ? 'bg-bg-primary' : ''"
            aria-hidden="true"
          >
            <span class="text-(--text-xs) font-medium text-text-secondary">
              {{ threadAvatarLabel(t) }}
            </span>
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-(--text-sm) text-text-primary truncate">
              {{ threadTitle(t) }}
            </p>
            <p v-if="t.lastMessagePreview" class="text-(--text-xs) text-text-secondary truncate">
              {{ t.lastMessagePreview }}
            </p>
          </div>
        </button>
      </div>
    </div>

    <div class="px-(--spacing-4) py-(--spacing-3) border-t border-border-default">
      <Button variant="secondary" size="md" class="w-full" @click="$emit('openSettings')">Настройки чата</Button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import type { ChatThread } from '@/chat/types'
  import { useChatWidgetStore } from '@/chat/model/use-chat-widget-store'
  import { Button, SearchInput } from '@/shared/ui'
  import { ArrowLeftIcon, ArrowRightIcon, XMarkIcon } from '@/shared/ui/icon'
  import { useAutoAnimateRef } from '@/shared/lib/use-auto-animate-el'

  const props = defineProps<{
    expanded: boolean
  }>()

  defineEmits<{
    (e: 'openSettings'): void
    (e: 'toggleExpand'): void
  }>()

  const store = useChatWidgetStore()
  const threadSearch = ref('')
  const threadsListEl = useAutoAnimateRef({ duration: 160 })
  const expanded = computed(() => props.expanded)

  const threadTitle = (t: ChatThread) => {
    return t.title?.trim() || 'Диалог'
  }

  const threadAvatarLabel = (t: ChatThread) => {
    const title = threadTitle(t)
    const parts = title
      .split(/\s+/)
      .map((p) => p.trim())
      .filter(Boolean)
    const letters = (parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')
    const out = letters || (title[0] ?? '')
    return out.toUpperCase().slice(0, 2)
  }

  const filteredThreads = computed(() => {
    const q = threadSearch.value.trim().toLowerCase()
    const list = store.threads ?? []
    if (!q) return list
    return list.filter((t) => {
      const title = (t.title ?? '').toLowerCase()
      const preview = (t.lastMessagePreview ?? '').toLowerCase()
      return title.includes(q) || preview.includes(q) || t.id.toLowerCase().includes(q)
    })
  })
</script>
