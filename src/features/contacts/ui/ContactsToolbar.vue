<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
      <div class="relative flex-1 min-w-0">
        <SearchIcon class="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-text-muted pointer-events-none" />
        <input
          :value="searchQuery"
          type="search"
          placeholder="Поиск по имени, email, телефону..."
          class="w-full pl-10 pr-4 py-2 border border-border-default rounded-lg bg-bg-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-default focus:border-primary-default"
          @input="onSearchInput"
        />
      </div>
      <div class="flex gap-2 flex-shrink-0">
        <Button
          variant="outline"
          size="md"
          class="p-2"
          aria-label="Импорт (заглушка)"
          title="Импорт"
          @click="$emit('import')"
        >
          <ArrowLeftIcon class="size-5" />
        </Button>
        <Button
          variant="outline"
          size="md"
          class="p-2"
          aria-label="Экспорт (заглушка)"
          title="Экспорт"
          @click="$emit('export')"
        >
          <ArrowRightIcon class="size-5" />
        </Button>
        <Button
          variant="outline"
          size="md"
          :class="{ 'ring-2 ring-primary-default': showFilters }"
          aria-label="Фильтры"
          @click="$emit('update:showFilters', !showFilters)"
        >
          Фильтры
        </Button>
        <Button variant="primary" size="md" @click="$emit('create')">
          <PlusIcon class="size-5 mr-2" />
          Создать контакт
        </Button>
      </div>
    </div>
    <Transition name="filters-slide">
      <ContactsFiltersPanel
        v-if="showFilters"
        :filters="filters"
        :companies="companies"
        :available-tags="availableTags"
        @update:filters="$emit('update:filters', $event)"
        @reset="$emit('resetFilters')"
      />
    </Transition>
  </div>
</template>

<script setup lang="ts">
  import { Button } from '@/shared/ui'
  import { PlusIcon, SearchIcon, ArrowLeftIcon, ArrowRightIcon } from '@/shared/ui/icon'
  import ContactsFiltersPanel from './ContactsFiltersPanel.vue'
  import type { ContactFilters } from './ContactsFiltersPanel.vue'

  const props = defineProps<{
    searchQuery: string
    showFilters: boolean
    filters: ContactFilters
    companies?: { id: string; name: string }[]
    availableTags?: string[]
  }>()

  const emit = defineEmits<{
    'update:searchQuery': [value: string]
    'update:showFilters': [value: boolean]
    'update:filters': [value: ContactFilters]
    create: []
    import: []
    export: []
    resetFilters: []
  }>()

  function onSearchInput(e: Event) {
    const target = e.target as HTMLInputElement
    emit('update:searchQuery', target?.value ?? '')
  }
</script>

<style scoped>
  .filters-slide-enter-active,
  .filters-slide-leave-active {
    transition: all 0.2s ease;
  }
  .filters-slide-enter-from,
  .filters-slide-leave-to {
    opacity: 0;
    transform: translateY(-8px);
  }
</style>
