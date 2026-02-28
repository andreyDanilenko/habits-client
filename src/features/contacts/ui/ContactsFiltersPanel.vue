<template>
  <div class="rounded-lg border border-border-default bg-bg-primary p-4 space-y-4">
    <div class="flex items-center justify-between">
      <span class="text-sm font-medium text-text-secondary">Расширенные фильтры</span>
      <Button variant="ghost" size="sm" @click="$emit('reset')">Сбросить фильтры</Button>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div>
        <label class="block text-xs font-medium text-text-muted mb-1">Компания</label>
        <select
          :value="filters.companyId"
          class="w-full px-3 py-2 border border-border-default rounded-lg bg-bg-primary text-text-primary text-sm"
          @change="(e) => updateCompanyId(e)"
        >
          <option value="">Все компании</option>
          <option v-for="c in companies" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
      </div>
      <div>
        <label class="block text-xs font-medium text-text-muted mb-1">Дата создания (с)</label>
        <input
          :value="filters.dateFrom"
          type="date"
          class="w-full px-3 py-2 border border-border-default rounded-lg bg-bg-primary text-text-primary text-sm"
          @input="(e) => updateDateFrom(e)"
        />
      </div>
      <div>
        <label class="block text-xs font-medium text-text-muted mb-1">Дата создания (по)</label>
        <input
          :value="filters.dateTo"
          type="date"
          class="w-full px-3 py-2 border border-border-default rounded-lg bg-bg-primary text-text-primary text-sm"
          @input="(e) => updateDateTo(e)"
        />
      </div>
      <div>
        <label class="block text-xs font-medium text-text-muted mb-1">Ответственный</label>
        <select
          :value="filters.ownerId"
          class="w-full px-3 py-2 border border-border-default rounded-lg bg-bg-primary text-text-primary text-sm"
          @change="(e) => updateOwnerId(e)"
        >
          <option value="">Все</option>
          <option value="1">Текущий пользователь</option>
        </select>
      </div>
    </div>
    <div v-if="availableTags.length">
      <label class="block text-xs font-medium text-text-muted mb-1">Теги</label>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="tag in availableTags"
          :key="tag"
          type="button"
          :class="['px-2 py-1 rounded text-sm transition-colors', selectedTags.includes(tag) ? 'bg-primary-default text-white' : 'bg-bg-tertiary text-text-secondary hover:bg-border-light']"
          @click="toggleTag(tag)"
        >
          {{ tag }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { Button } from '@/shared/ui'

  export interface ContactFilters {
    companyId?: string
    dateFrom?: string
    dateTo?: string
    ownerId?: string
    tags?: string[]
  }

  const props = withDefaults(
    defineProps<{
      filters: ContactFilters
      companies?: { id: string; name: string }[]
      availableTags?: string[]
    }>(),
    {
      companies: () => [],
      availableTags: () => [],
    },
  )

  const emit = defineEmits<{
    'update:filters': [filters: ContactFilters]
    reset: []
  }>()

  const selectedTags = computed(() => props.filters.tags ?? [])

  function updateCompanyId(e: Event) {
    const v = (e.target as HTMLSelectElement)?.value
    emit('update:filters', { ...props.filters, companyId: v })
  }

  function updateDateFrom(e: Event) {
    const v = (e.target as HTMLInputElement)?.value
    emit('update:filters', { ...props.filters, dateFrom: v })
  }

  function updateDateTo(e: Event) {
    const v = (e.target as HTMLInputElement)?.value
    emit('update:filters', { ...props.filters, dateTo: v })
  }

  function updateOwnerId(e: Event) {
    const v = (e.target as HTMLSelectElement)?.value
    emit('update:filters', { ...props.filters, ownerId: v })
  }

  function toggleTag(tag: string) {
    const current = props.filters.tags ?? []
    const next = current.includes(tag) ? current.filter((t: string) => t !== tag) : [...current, tag]
    emit('update:filters', { ...props.filters, tags: next })
  }
</script>
