<template>
  <Drawer
    :is-open="isOpen"
    title="Уведомления"
    width="md"
    @close="$emit('close')"
  >
    <div class="flex flex-col gap-(--spacing-1)">
      <div
        v-if="unreadCount > 0"
        class="flex justify-end mb-(--spacing-2)"
      >
        <button
          type="button"
          class="text-(--text-xs) text-primary-default hover:text-primary-dark font-medium"
          @click="markAllAsRead"
        >
          Отметить все прочитанными
        </button>
      </div>

      <div
        v-if="notifications.length === 0"
        class="py-(--spacing-8) text-center text-text-muted text-(--text-xs)"
      >
        Нет уведомлений
      </div>

      <div
        v-for="item in notifications"
        :key="item.id"
        :class="[
          'NotificationItem flex flex-col gap-0 px-(--spacing-2) py-(--spacing-1) rounded-(--radius-sm) transition-colors cursor-default',
          item.read
            ? 'bg-transparent hover:bg-bg-tertiary'
            : 'bg-primary-light border-l-2 border-l-primary-default hover:bg-primary-light/80',
        ]"
        @click="markAsRead(item.id)"
      >
        <p class="text-text-primary text-(--text-xs) font-medium leading-tight m-0">
          {{ item.title }}
        </p>
        <p
          v-if="item.subtitle"
          class="text-text-muted text-[10px] leading-tight mt-0.5 m-0"
        >
          {{ item.subtitle }}
        </p>
        <time
          class="text-text-muted text-[10px] mt-0.5"
          :datetime="new Date(item.timestamp).toISOString()"
        >
          {{ formatTime(item.timestamp) }}
        </time>
      </div>
    </div>
  </Drawer>
</template>

<script setup lang="ts">
  import { watch } from 'vue'
  import { Drawer } from '@/shared/ui'
  import { useNotificationsStore } from '../model/use-notifications-store'

  const props = defineProps<{ isOpen: boolean }>()
  defineEmits<{ close: [] }>()

  const { notifications, unreadCount, markAsRead, markAllAsRead, fetchFromApi } =
    useNotificationsStore()

  watch(
    () => props.isOpen,
    (open) => {
      if (open) void fetchFromApi()
    },
  )

  function formatTime(ts: number): string {
    const d = new Date(ts)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    if (diff < 60_000) return 'только что'
    if (diff < 3600_000) return `${Math.floor(diff / 60_000)} мин. назад`
    if (diff < 86400_000) return `${Math.floor(diff / 3600_000)} ч. назад`
    return d.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  }
</script>
