<template>
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold text-gray-900">Мои привычки</h1>
      <p class="mt-2 text-gray-600">Управляйте своими привычками и отслеживайте прогресс</p>
    </div>
    <Button @click.stop="$emit('add-habit')">Добавить</Button>
  </div>
</template>

<script setup lang="ts">
  import { Button } from '@/shared/ui'

  defineEmits<{
    'add-habit': []
  }>()
</script>
