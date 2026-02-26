<template>
  <Card :border="true" :padding="true" class="bg-bg-primary">
    <div class="flex flex-col gap-4">
      <div class="flex flex-wrap gap-3">
        <div class="flex-1 min-w-[200px]">
          <FormField label="Дата">
            <Input
              v-model="dateModel"
              type="date"
              :disabled="showAll"
            />
          </FormField>
        </div>

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

      <div v-if="hasActiveFilters" class="flex flex-wrap gap-2 pt-2 border-t border-border-light">
        <Badge
          v-if="selectedDate"
          variant="outline"
          class="bg-primary-light text-primary-dark border-primary-light flex items-center gap-1"
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
          class="bg-success-light text-success-text border-success-border flex items-center gap-1"
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
  import { computed } from 'vue'
  import { formatDateRu } from '@/shared/lib'
  import { Card, Button, Badge, FormField, Input } from '@/shared/ui'
  import { XMarkIcon } from '@/shared/ui/icon'

  const props = defineProps<{
    selectedDate?: string
    showAll?: boolean
    hasActiveFilters: boolean
  }>()

  const emit = defineEmits<{
    'date-change': [date: string]
    'show-all': []
    'reset-filter': []
  }>()

  const dateModel = computed({
    get: () => props.selectedDate || '',
    set: (value) => emit('date-change', value)
  })

  const handleClearDate = () => {
    emit('date-change', '')
  }

  const formatDate = (dateStr: string) => formatDateRu(dateStr, 'd MMMM yyyy')
</script>
