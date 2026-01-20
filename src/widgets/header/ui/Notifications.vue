<template>
  <Button
    variant="ghost"
    @click="toggleNotifications"
  >
    <BellIcon size="l" color="gray" />
    
    <span
      v-if="unreadCount > 0"
      class="absolute top-2 right-4 w-2 h-2 bg-red-500 rounded-full"
    />
    
    <span
      v-if="showMessageBadge"
      class="absolute top-1 right-2 min-w-[20px] h-5 px-1 bg-red-600 text-white text-xs rounded-full flex items-center justify-center"
    >
      {{ unreadCount > 99 ? '99+' : unreadCount }}
    </span>
  </Button>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/shared/ui'
import { BellIcon } from '@/shared/ui/icon'

const unreadCount = ref(3)
const showMessageBadge = ref(false) 

const toggleNotifications = () => {
  console.log('Toggle notifications')
}
</script>
