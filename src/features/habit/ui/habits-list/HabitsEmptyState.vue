<template>
  <div class="text-center py-12">
    <div class="max-w-md mx-auto">
      <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 4v16m8-8H4"
          />
        </svg>
      </div>
      <h3 class="text-lg font-medium text-gray-900 mb-2">Нет привычек</h3>
      <p class="text-gray-500 mb-6">
        Создайте свою первую привычку, чтобы начать отслеживать прогресс
      </p>
      <Button @click.stop="$emit('add-habit')"> Создать привычку </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { Button } from '@/shared/ui'

  defineEmits<{
    'add-habit': []
  }>()
</script>
