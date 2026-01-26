<template>
  <Card :border="true" :padding="true" class="bg-white">
    <div class="flex flex-col gap-4">
      <!-- Фильтры -->
      <div class="flex flex-wrap gap-3">
        <!-- Фильтр по дате -->
        <div class="flex-1 min-w-[200px]">
          <label class="block text-xs font-medium text-gray-700 mb-1">Дата</label>
          <input
            type="date"
            :value="selectedDate"
            @input="handleDateInput"
            :disabled="showAll"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
          />
        </div>

        <!-- Кнопка "Показать все" -->
        <div class="flex items-end">
          <Button
            :variant="showAll ? 'secondary' : 'outline'"
            size="sm"
            @click="$emit('show-all')"
            class="whitespace-nowrap"
          >
            Загрузить все
          </Button>
        </div>

        <!-- Сброс фильтров -->
        <div class="flex items-end">
          <Button
            v-if="hasActiveFilters"
            :variant="showAll ? 'primary' : 'outline'"
            size="sm"
            @click="$emit('reset-filter')"
            class="whitespace-nowrap"
          >
            Сбросить фильтры
          </Button>
        </div>
      </div>

      <!-- Индикаторы активных фильтров -->
      <div v-if="hasActiveFilters" class="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
        <Badge
          v-if="selectedDate"
          variant="outline"
          class="bg-indigo-50 text-indigo-700 border-indigo-200 flex items-center gap-1"
        >
          Дата: {{ formatDate(selectedDate) }}
          <Button
            @click.stop="handleClearDate"
            icon-only
            variant="icon"
            size="sm"
            icon-color="default"
            class="!p-0 !h-auto !w-auto ml-1"
            :left-icon="XMarkIcon"
          />
        </Badge>
        <Badge
          v-if="showAll"
          variant="outline"
          class="bg-emerald-50 text-emerald-700 border-emerald-200 flex items-center gap-1"
        >
          Показать все
          <Button
            @click.stop="$emit('reset-filter')"
            icon-only
            variant="icon"
            size="sm"
            icon-color="default"
            class="!p-0 !h-auto !w-auto ml-1"
            :left-icon="XMarkIcon"
          />
        </Badge>
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
  import { format } from 'date-fns'
  import { ru } from 'date-fns/locale'
  import { Card, Button, Badge } from '@/shared/ui'
  import { XMarkIcon } from '@/shared/ui/icon'

  defineProps<{
    selectedDate?: string
    showAll?: boolean
    hasActiveFilters: boolean
  }>()

  const emit = defineEmits<{
    'date-change': [date: string]
    'show-all': []
    'reset-filter': []
  }>()

  const handleDateInput = (event: Event) => {
    const target = event.target as HTMLInputElement
    emit('date-change', target.value)
  }

  const handleClearDate = () => {
    emit('date-change', '')
  }

  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), 'd MMMM yyyy', { locale: ru })
  }
</script>
