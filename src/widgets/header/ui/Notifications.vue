<template>
  <Button variant="ghost" @click="toggleNotifications" class="relative">
    <BellIcon size="l" :color="iconColor" />

    <span
      v-if="unreadCount > 0 && !showMessageBadge"
      class="absolute top-(--spacing-2) right-(--spacing-4) w-2 h-2 bg-error-default rounded-full"
    />

    <span
      v-if="showMessageBadge && unreadCount > 0"
      class="absolute -top-1 -right-1 min-w-5 h-(--size-6) px-(--spacing-1) bg-error-default text-white text-(--text-xs) rounded-full flex items-center justify-center"
    >
      {{ unreadCount > 99 ? '99+' : unreadCount }}
    </span>
  </Button>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { Button } from '@/shared/ui'
  import { BellIcon } from '@/shared/ui/icon'

  const unreadCount = ref(3)
  const showMessageBadge = ref(false) // true для бейджа с числом, false для точки

  const iconColor = computed(() => {
    return unreadCount.value > 0 ? 'text-text-primary' : 'text-text-muted'
  })

  const toggleNotifications = () => {
    console.log('Toggle notifications')
  }
</script>
