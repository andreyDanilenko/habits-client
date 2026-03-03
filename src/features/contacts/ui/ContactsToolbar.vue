<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
      <div class="relative flex-1 min-w-0">
        <SearchInput
          :model-value="searchQuery"
          placeholder="Поиск по имени, email, телефону..."
          :clear-button-label="'Очистить поиск'"
          @update:model-value="$emit('update:searchQuery', $event)"
          @clear="handleClearSearch"
          @keydown.esc="handleEsc"
        />
      </div>
      
      <div class="flex gap-2 flex-shrink-0">
        <Button
          variant="outline"
          class="!p-2"
          aria-label="Импорт"
          title="Импорт"
          @click="$emit('import')"
        >
          <ArrowLeftIcon :size="iconSize" />
        </Button>
        
        <Button
          variant="outline"
          class="!p-2"
          aria-label="Экспорт"
          title="Экспорт"
          @click="$emit('export')"
        >
          <ArrowRightIcon :size="iconSize" />
        </Button>
        
        <Button
          variant="outline"
          aria-label="Фильтры"
          @click="$emit('update:showFilters', !showFilters)"
        >
          Фильтры
        </Button>
        
        <PermissionGuard :permission="CRM_PERMISSIONS.contactCreate">
          <Button variant="primary"  @click="$emit('create')">
            <PlusIcon :size="iconSize" class="mr-2" />
            Создать контакт
          </Button>
        </PermissionGuard>
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
  import { computed } from 'vue'
  import { Button, SearchInput } from '@/shared/ui'
  import { PlusIcon, ArrowLeftIcon, ArrowRightIcon } from '@/shared/ui/icon'
  import ContactsFiltersPanel from './ContactsFiltersPanel.vue'
  import type { ContactFilters } from './ContactsFiltersPanel.vue'
  import { PermissionGuard } from '@/features/permissions'
  import { CRM_PERMISSIONS } from '@/features/permissions/config'

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
    search: [value: string]
  }>()

  const iconSize = computed(() => 20)

  // Очистка поиска
  const handleClearSearch = () => {
    emit('update:searchQuery', '')
    emit('search', '')
  }

  // Обработка Escape
  const handleEsc = () => {
    (document.activeElement as HTMLElement)?.blur()
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

  .\!p-2 {
    padding: 0.5rem !important;
  }
</style>
