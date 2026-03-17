<template>
  <div class="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
    <div class="flex gap-2 flex-shrink-0 items-center">
      <SegmentedControl
        :model-value="viewMode"
        :options="viewModeOptions"
        @update:model-value="$emit('update:viewMode', $event)"
      />
      <Button
        variant="outline"
        :class="{ 'text-primary-default border-primary-default': hasActiveFilters }"
        @click="$emit('openFilters')"
      >
        <IconFunnel class="w-4 h-4 mr-(--spacing-2) inline" />
        Фильтры
        <span
          v-if="hasActiveFilters"
          class="ml-(--spacing-1) inline-flex items-center justify-center min-w-(--size-5) h-(--size-5) text-(--text-xs) font-medium rounded-full bg-primary-light text-primary-dark"
        >
          {{ activeFiltersCount }}
        </span>
      </Button>
    </div>
  </div>
</template>


<script setup lang="ts">
  import { Button, SegmentedControl } from '@/shared/ui'
  import { IconFunnel, ListIcon } from '@/shared/ui/icon'
  import type { DealsViewMode, DealsStatusFilter } from '../model/use-deals-page'

  defineProps<{
    viewMode: DealsViewMode
    hasActiveFilters: boolean
    activeFiltersCount: number
  }>()

  const viewModeOptions = [
    { value: 'kanban', label: 'Канбан' },
    { value: 'table', label: 'Список', icon: ListIcon },
  ]

  defineEmits<{
    'update:viewMode': [mode: DealsViewMode]
    openFilters: []
  }>()
</script>
