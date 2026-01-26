<template>
  <div class="text-center py-16">
    <Card :border="true" :padding="true" class="max-w-md mx-auto">
      <h3 class="mb-2">
        {{ hasActiveFilters ? 'Ничего не найдено' : 'Пока нет записей' }}
      </h3>
      <p class="text-gray-600 mb-6">
        {{
          hasActiveFilters
            ? 'Попробуйте изменить фильтры или поисковый запрос'
            : 'Начните вести дневник и записывайте свои мысли, достижения и планы'
        }}
      </p>
      <div class="flex gap-3 justify-center">
        <Button v-if="hasActiveFilters" variant="outline" @click="$emit('clear-filters')">
          Сбросить фильтры
        </Button>
        <Button @click="$emit('create-entry')"> Создать запись </Button>
      </div>
    </Card>
  </div>
</template>

<script setup lang="ts">
  import { Card, Button } from '@/shared/ui'

  defineProps<{
    hasActiveFilters: boolean
  }>()

  defineEmits<{
    'clear-filters': []
    'create-entry': []
  }>()
</script>
