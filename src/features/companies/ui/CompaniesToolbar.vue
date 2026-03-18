<template>
  <div class="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
    <div class="relative flex-1 min-w-0">
      <SearchInput
        :model-value="searchInput"
        placeholder="Поиск по названию, ИНН, email..."
        size="lg"
        clear-button-label="Очистить поиск"
        :debounce="300"
        @update:model-value="$emit('update:searchInput', $event)"
        @search="$emit('search', $event)"
        @clear="handleClearSearch"
        @keydown.esc="handleEsc"
      />
    </div>

    <div class="flex gap-2 flex-shrink-0 items-center">
      <Button variant="outline" @click="$emit('openFilters')">
        <IconFunnel class="w-4 h-4 mr-(--spacing-2) inline" />
        Фильтры
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { Button, SearchInput } from '@/shared/ui'
  import { IconFunnel } from '@/shared/ui/icon'

  defineProps<{
    searchInput: string
  }>()

  const emit = defineEmits<{
    'update:searchInput': [value: string]
    search: [value: string]
    openFilters: []
  }>()

  const handleClearSearch = () => {
    emit('update:searchInput', '')
    emit('search', '')
  }

  const handleEsc = () => {
    ;(document.activeElement as HTMLElement)?.blur()
  }
</script>
