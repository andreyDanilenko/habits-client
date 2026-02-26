<template>
  <Button variant="ghost" @click="toggleNotifications" class="relative">
    <BellIcon size="l" :color="iconColor" />

    <!-- Маленькая точка (когда мало уведомлений) -->
    <span 
      v-if="unreadCount > 0 && !showMessageBadge" 
      class="absolute top-2 right-4 w-2 h-2 bg-error-default rounded-full" 
    />

    <!-- Бейдж с числом (когда много уведомлений) -->
    <span
      v-if="showMessageBadge && unreadCount > 0"
      class="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-error-default text-white text-xs rounded-full flex items-center justify-center"
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
