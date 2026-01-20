<template>
  <button
    class="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
    @click="toggleNotifications"
  >
      <BellIcon size="sm"/> 
    <span v-if="unreadCount > 0" class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
  </button>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { BellIcon } from '@/shared/ui/icon'


  const unreadCount = ref(0)

  const toggleNotifications = () => {
    // Заглушка: логика уведомлений
    console.log('Toggle notifications')
  }
</script>
