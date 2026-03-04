<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
      <div class="relative flex-1 min-w-0">
        <SearchInput
          :model-value="searchInput"
          placeholder="Поиск по имени, email, телефону..."
          :clear-button-label="'Очистить поиск'"
          :debounce="300"
          @update:model-value="$emit('update:searchInput', $event)"
          @search="$emit('search', $event)"
          @clear="handleClearSearch"
          @keydown.esc="handleEsc"
        />
      </div>
      
      <div class="flex gap-2 flex-shrink-0">
        <Button
          variant="outline"
          aria-label="Импорт"
          title="Импорт"
          @click="$emit('import')"
        >
          Импорт
        </Button>
        <Button
          variant="outline"
          aria-label="Экспорт"
          title="Экспорт"
          @click="$emit('export')"
        >
          Экспорт
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
  import { PlusIcon } from '@/shared/ui/icon'
  import ContactsFiltersPanel from './ContactsFiltersPanel.vue'
  import type { ContactFilters } from './ContactsFiltersPanel.vue'
  import { PermissionGuard } from '@/features/permissions'
  import { CRM_PERMISSIONS } from '@/features/permissions/config'

  const props = defineProps<{
    searchInput: string
    showFilters: boolean
    filters: ContactFilters
    companies?: { id: string; name: string }[]
    availableTags?: string[]
  }>()

  const emit = defineEmits<{
    'update:searchInput': [value: string]
    'update:showFilters': [value: boolean]
    'update:filters': [value: ContactFilters]
    create: []
    import: []
    export: []
    resetFilters: []
    search: [value: string]
  }>()

  const iconSize = computed(() => 20) // для PlusIcon в кнопке «Создать контакт»

  // Очистка поиска
  const handleClearSearch = () => {
    emit('update:searchInput', '')
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

</style>
