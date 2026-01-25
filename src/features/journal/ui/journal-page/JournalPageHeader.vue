<template>
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div>
      <h1>Дневник</h1>
      <p class="text-gray-600 mt-1">Записывайте свои мысли, достижения и планы</p>
    </div>
    <Button @click="$emit('create-entry')" class="w-full sm:w-auto" :to="{ name: 'JournalNew' }">
      Новая запись
    </Button>
  </div>
</template>

<script setup lang="ts">
  import { Button } from '@/shared/ui'

  defineEmits<{
    'create-entry': []
  }>()
</script>
