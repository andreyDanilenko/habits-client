<template>
  <div class="h-full min-h-0 flex flex-col bg-bg-primary border-l border-border-default">
    <div class="px-(--spacing-4) py-(--spacing-3) border-b border-border-default flex items-center justify-between gap-(--spacing-3)">
      <div class="min-w-0">
        <p class="text-(--text-sm) font-medium text-text-primary truncate">Настройки чата</p>
        <p class="text-(--text-xs) text-text-secondary truncate">Workspace: {{ store.context?.currentWorkspace?.name ?? '—' }}</p>
      </div>
      <Button variant="icon" size="md" icon-only :left-icon="XMarkIcon" aria-label="Закрыть" @click="$emit('close')" />
    </div>

    <div class="p-(--spacing-4) space-y-(--spacing-4) overflow-y-auto">
      <Card class="p-(--spacing-4)">
        <p class="text-(--text-sm) font-medium text-text-primary mb-(--spacing-2)">Контекст</p>
        <div class="text-(--text-sm) text-text-secondary space-y-(--spacing-1)">
          <p>Пользователь: {{ store.context?.currentUser?.name ?? store.context?.currentUser?.email ?? '—' }}</p>
          <p>Email: {{ store.context?.currentUser?.email ?? '—' }}</p>
          <p>Workspace ID: {{ store.context?.currentWorkspace?.id ?? '—' }}</p>
        </div>
      </Card>

      <Card class="p-(--spacing-4)">
        <p class="text-(--text-sm) font-medium text-text-primary mb-(--spacing-2)">Действия</p>
        <div class="flex flex-col gap-(--spacing-2)">
          <Button variant="secondary" @click="store.loadThreads">Обновить список чатов</Button>
          <Button variant="secondary" @click="store.loadRecipients">Обновить список пользователей</Button>
        </div>
      </Card>

      <p class="text-(--text-xs) text-text-secondary">
        Здесь можно расширять настройки (уведомления, закреплённые чаты, фильтры) — UI уже выделен в отдельную панель.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useChatWidgetStore } from '@/chat/model/use-chat-widget-store'
  import { Button, Card } from '@/shared/ui'
  import { XMarkIcon } from '@/shared/ui/icon'

  defineEmits<{
    (e: 'close'): void
  }>()

  const store = useChatWidgetStore()
</script>

