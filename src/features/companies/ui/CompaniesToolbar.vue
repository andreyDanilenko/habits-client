<template>
  <div class="flex flex-col sm:flex-row gap-(--spacing-4) items-stretch sm:items-center">
    <div class="flex-1 min-w-0">
      <SearchInput
        :model-value="searchQuery"
        placeholder="Поиск по названию, ИНН, email..."
        size="lg"
        @update:model-value="$emit('update:searchQuery', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { SearchInput } from '@/shared/ui'

  defineProps<{ searchQuery: string }>()
  defineEmits<{ 'update:searchQuery': [value: string] }>()
</script>
