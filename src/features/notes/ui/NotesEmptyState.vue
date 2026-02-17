<template>
  <div class="text-gray-500 py-8 text-center">
    <p class="mb-4">Нет заметок. Создайте первую.</p>
    <Button variant="primary" @click="$emit('add-note')">
      <PlusIcon class="w-4 h-4 mr-2 inline" />
      Новая заметка
    </Button>
  </div>
</template>

<script setup lang="ts">
  import { Button } from '@/shared/ui'
  import { PlusIcon } from '@/shared/ui/icon'

  defineEmits<{
    'add-note': []
  }>()
</script>
