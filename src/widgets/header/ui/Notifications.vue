<template>
  <div class="relative">
    <Button variant="ghost" @click="isDrawerOpen = true" class="relative">
      <BellIcon size="l" :color="iconColor" />

      <span
        v-if="unreadCount > 0 && !showNumberBadge"
        class="absolute top-(--spacing-2) right-(--spacing-4) w-2 h-2 bg-error-default rounded-full"
      />

      <span
        v-if="showNumberBadge && unreadCount > 0"
        class="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 bg-error-default text-white text-[10px] font-medium rounded-full flex items-center justify-center leading-none"
      >
        {{ unreadCount > 99 ? '99+' : unreadCount }}
      </span>
    </Button>

    <NotificationsDrawer :is-open="isDrawerOpen" @close="isDrawerOpen = false" />
  </div>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { Button } from '@/shared/ui'
  import { BellIcon } from '@/shared/ui/icon'
  import { NotificationsDrawer, useNotificationsStore } from '@/features/notifications'

  const { unreadCount } = useNotificationsStore()
  const isDrawerOpen = ref(false)
  const showNumberBadge = ref(true)

  const iconColor = computed(() => {
    return unreadCount.value > 0 ? 'text-text-primary' : 'text-text-muted'
  })
</script>
