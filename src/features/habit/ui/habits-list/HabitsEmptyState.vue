<template>
  <div class="text-center py-16">
    <Card :border="true" :padding="true" class="max-w-md mx-auto">
      <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <PlusIcon size="lg" />
      </div>
      <h3 class="mb-2">{{ hasActiveFilters ? 'Привычки не найдены' : 'Нет привычек' }}</h3>
      <p class="text-gray-600 mb-6">
        {{
          hasActiveFilters
            ? 'Попробуйте изменить фильтры или сбросить их'
            : 'Создайте свою первую привычку, чтобы начать отслеживать прогресс'
        }}
      </p>
      <div class="flex gap-3 justify-center">
        <Button v-if="hasActiveFilters" variant="outline" @click="$emit('clear-filters')">
          Сбросить фильтры
        </Button>
        <Button @click="$emit('add-habit')">Создать привычку</Button>
      </div>
    </Card>
  </div>
</template>

<script setup lang="ts">
  import { Card, Button } from '@/shared/ui'
  import { PlusIcon } from '@/shared/ui/icon'

  defineProps<{
    hasActiveFilters?: boolean
  }>()

  defineEmits<{
    'add-habit': []
    'clear-filters': []
  }>()
</script>
