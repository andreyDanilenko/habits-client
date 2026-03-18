<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
      <div class="relative flex-1 min-w-0">
      <SearchInput
        :model-value="searchQuery"
        placeholder="Поиск по названию..."
        size="lg"
        clear-button-label="Очистить поиск"
        :debounce="400"
        @update:model-value="$emit('update:searchQuery', $event)"
        @search="$emit('search', $event)"
        @clear="handleClearSearch"
        @keydown.esc="handleEsc"
      />
    </div>

    <div class="flex gap-2 flex-shrink-0 items-center">
      <SegmentedControl
        :model-value="viewMode"
        :options="viewModeOptions"
        @update:model-value="$emit('update:viewMode', $event as 'list' | 'kanban')"
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
  </div>
</template>

<script setup lang="ts">
  import { Button, SearchInput, SegmentedControl } from '@/shared/ui'
  import { IconFunnel, ListIcon, IconKanban } from '@/shared/ui/icon'

  defineProps<{
    searchQuery: string
    viewMode: 'list' | 'kanban'
    hasActiveFilters: boolean
    activeFiltersCount: number
  }>()

  const viewModeOptions = [
    { value: 'list', label: 'Список', icon: ListIcon },
    { value: 'kanban', label: 'Канбан', icon: IconKanban },
  ]

  const emit = defineEmits<{
    'update:searchQuery': [value: string]
    'update:viewMode': [value: 'list' | 'kanban']
    search: [value: string]
    openFilters: []
  }>()

  const handleClearSearch = () => {
    emit('update:searchQuery', '')
    emit('search', '')
  }

  const handleEsc = () => {
    ;(document.activeElement as HTMLElement)?.blur()
  }
</script>
