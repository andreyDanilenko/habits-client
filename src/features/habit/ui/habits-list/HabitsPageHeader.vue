<template>
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div>
      <h1>Мои привычки</h1>
      <p class="text-gray-600 mt-1">Управляйте своими привычками и отслеживайте прогресс</p>
    </div>
    <Button @click="$emit('add-habit')" class="w-full sm:w-auto">Добавить привычку</Button>
  </div>
</template>

<script setup lang="ts">
  import { Button } from '@/shared/ui'

  defineEmits<{
    'add-habit': []
  }>()
</script>
