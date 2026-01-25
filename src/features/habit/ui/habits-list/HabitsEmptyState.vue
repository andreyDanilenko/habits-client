<template>
  <div class="text-center py-12">
    <div class="max-w-md mx-auto">
      <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <PlusIcon size="lg" />
      </div>
      <h3 class="mb-2">Нет привычек</h3>
      <p class="text-gray-500 mb-6">
        Создайте свою первую привычку, чтобы начать отслеживать прогресс
      </p>
      <Button @click.stop="$emit('add-habit')"> Создать привычку </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { Button } from '@/shared/ui'
  import { PlusIcon } from '@/shared/ui/icon'

  defineEmits<{
    'add-habit': []
  }>()
</script>
