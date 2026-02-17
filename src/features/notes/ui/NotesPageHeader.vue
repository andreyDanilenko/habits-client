<template>
  <div class="flex items-center justify-between mb-6">
    <h1 class="text-2xl font-semibold text-gray-900">Заметки</h1>
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
