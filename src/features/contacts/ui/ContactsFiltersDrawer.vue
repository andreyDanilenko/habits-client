<template>
  <Drawer
    :is-open="isOpen"
    title="Фильтры"
    width="md"
    show-close-button
    @close="$emit('close')"
  >
    <div class="space-y-0">
      <section class="FiltersSection">
        <h3 class="FiltersSection__Title">Компания</h3>
        <div class="FiltersSection__Content">
          <Select
            :model-value="filters.companyId ?? ''"
            :options="companyOptions"
            placeholder="Все компании"
            size="md"
            class="w-full"
            @update:model-value="setCompanyId($event)"
          />
        </div>
      </section>

      <div class="FiltersDivider" />

      <section class="FiltersSection">
        <h3 class="FiltersSection__Title">Дата создания</h3>
        <div class="FiltersSection__Content space-y-(--spacing-3)">
          <div>
            <span class="block text-(--text-xs) text-text-muted mb-(--spacing-1)">С</span>
            <DatePicker
              :model-value="filters.dateFrom ?? ''"
              placeholder="ДД.ММ.ГГГГ"
              size="md"
              class="w-full"
              @update:model-value="$emit('update:filters', { ...filters, dateFrom: $event || undefined })"
            />
          </div>
          <div>
            <span class="block text-(--text-xs) text-text-muted mb-(--spacing-1)">По</span>
            <DatePicker
              :model-value="filters.dateTo ?? ''"
              placeholder="ДД.ММ.ГГГГ"
              size="md"
              class="w-full"
              @update:model-value="$emit('update:filters', { ...filters, dateTo: $event || undefined })"
            />
          </div>
        </div>
      </section>

      <div class="FiltersDivider" />

      <section class="FiltersSection">
        <h3 class="FiltersSection__Title">Ответственный</h3>
        <div class="FiltersSection__Content">
          <Select
            :model-value="filters.ownerId ?? ''"
            :options="ownerOptions"
            placeholder="Все"
            size="md"
            class="w-full"
            @update:model-value="setOwnerId($event)"
          />
        </div>
      </section>

      <div v-if="availableTags.length" class="FiltersDivider" />

      <section v-if="availableTags.length" class="FiltersSection">
        <h3 class="FiltersSection__Title">Теги</h3>
        <div class="FiltersSection__Content">
          <div class="flex flex-wrap gap-2">
            <button
              v-for="tag in availableTags"
              :key="tag"
              type="button"
              class="cursor-pointer transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary-default focus:ring-offset-1 rounded-full"
              @click="toggleTag(tag)"
            >
              <Badge :variant="selectedTags.includes(tag) ? 'indigo' : 'outline'">
                {{ tag }}
              </Badge>
            </button>
          </div>
        </div>
      </section>

      <div class="FiltersDivider" />

      <section class="FiltersSection">
        <h3 class="FiltersSection__Title">Действия</h3>
        <div class="FiltersSection__Content flex gap-2">
          <Button variant="outline" size="md" @click="$emit('import')">
            Импорт
          </Button>
          <Button variant="outline" size="md" @click="$emit('export')">
            Экспорт
          </Button>
        </div>
      </section>
    </div>

    <template #footer>
      <div class="flex gap-(--spacing-3)">
        <Button
          v-if="hasActiveFilters"
          variant="outline"
          class="flex-1"
          @click="$emit('reset')"
        >
          Сбросить
        </Button>
        <Button variant="primary" class="flex-1" @click="$emit('close')">
          Применить
        </Button>
      </div>
    </template>
  </Drawer>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { Drawer, Button, Select, DatePicker, Badge } from '@/shared/ui'
  import type { ContactFilters } from './ContactsFiltersPanel.vue'

  const props = defineProps<{
    isOpen: boolean
    filters: ContactFilters
    companies?: { id: string; name: string }[]
    availableTags?: string[]
    hasActiveFilters: boolean
  }>()

  const emit = defineEmits<{
    close: []
    reset: []
    import: []
    export: []
    'update:filters': [filters: ContactFilters]
  }>()

  const selectedTags = computed(() => props.filters.tags ?? [])

  const companyOptions = computed(() => [
    { value: '', label: 'Все компании' },
    ...(props.companies ?? []).map((c) => ({ value: c.id, label: c.name })),
  ])

  const ownerOptions = [
    { value: '', label: 'Все' },
    { value: '1', label: 'Текущий пользователь' },
  ]

  function setCompanyId(value: string | number | null | undefined) {
    const v = value === '' || value == null ? undefined : String(value)
    emit('update:filters', { ...props.filters, companyId: v })
  }

  function setOwnerId(value: string | number | null | undefined) {
    const v = value === '' || value == null ? undefined : String(value)
    emit('update:filters', { ...props.filters, ownerId: v })
  }

  function toggleTag(tag: string) {
    const current = props.filters.tags ?? []
    const next = current.includes(tag)
      ? current.filter((t: string) => t !== tag)
      : [...current, tag]
    emit('update:filters', { ...props.filters, tags: next })
  }
</script>

<style scoped>
  .FiltersSection {
    padding-top: var(--spacing-4);
    padding-bottom: var(--spacing-4);
  }

  .FiltersSection:first-child {
    padding-top: 0;
  }

  .FiltersSection__Title {
    font-size: var(--text-sm);
    font-weight: 500;
    color: var(--color-text-secondary);
    margin-bottom: var(--spacing-2);
  }

  .FiltersSection__Content {
    color: var(--color-text-primary);
  }

  .FiltersDivider {
    height: 1px;
    background-color: var(--color-border-light);
  }
</style>
