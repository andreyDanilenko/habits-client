<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <div>
        <h1>Мои привычки</h1>
        <p class="mt-2 text-gray-600">Управляйте своими привычками и отслеживайте прогресс</p>
      </div>
      <Button @click.stop="$emit('add-habit')">Добавить</Button>
    </div>
    
    <div class="flex items-center gap-4 flex-wrap">
      <div class="flex items-center gap-2">
        <label for="date-filter" class="text-sm font-medium text-gray-700">Фильтр по дате:</label>
        <input
          id="date-filter"
          type="date"
          :value="selectedDate"
          @input="handleDateInput"
          :disabled="showAll"
          class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
      </div>
      <Button
        :variant="showAll ? 'default' : 'outline'"
        size="sm"
        @click="$emit('show-all')"
      >
        Загрузить все
      </Button>
      <Button
        v-if="selectedDate || showAll"
        variant="ghost"
        size="sm"
        @click="$emit('reset-filter')"
      >
        Сбросить фильтр
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { Button } from '@/shared/ui'

  const props = defineProps<{
    selectedDate?: string
    showAll?: boolean
  }>()

  const emit = defineEmits<{
    'add-habit': []
    'date-change': [date: string]
    'show-all': []
    'reset-filter': []
  }>()

  const handleDateInput = (event: Event) => {
    const target = event.target as HTMLInputElement
    emit('date-change', target.value)
  }
</script>
