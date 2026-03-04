<template>
  <div class="rounded-lg border border-border-default bg-bg-primary p-4 space-y-4">
    <div class="flex items-center justify-between">
      <span class="text-sm font-medium text-text-secondary">Расширенные фильтры</span>
      <Button variant="ghost"  @click="$emit('reset')">Сбросить фильтры</Button>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <FormField label="Компания">
        <Select
          :model-value="filters.companyId ?? ''"
          :options="companyOptions"
          
          placeholder="Все компании"
          @update:model-value="setCompanyId($event)"
        />
      </FormField>
      <FormField label="Дата создания (с)">
        <DatePicker
          :model-value="filters.dateFrom ?? ''"
          
          @update:model-value="$emit('update:filters', { ...filters, dateFrom: $event || undefined })"
        />
      </FormField>
      <FormField label="Дата создания (по)">
        <DatePicker
          :model-value="filters.dateTo ?? ''"
          @update:model-value="$emit('update:filters', { ...filters, dateTo: $event || undefined })"
        />
      </FormField>
      <FormField label="Ответственный">
        <Select
          :model-value="filters.ownerId ?? ''"
          :options="ownerOptions"
          
          placeholder="Все"
          @update:model-value="setOwnerId($event)"
        />
      </FormField>
    </div>
    <FormField v-if="availableTags.length" label="Теги">
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
    </FormField>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { Button, FormField, Select, DatePicker, Badge } from '@/shared/ui'

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

  const companyOptions = computed(() => [
    { value: '', label: 'Все компании' },
    ...props.companies.map((c) => ({ value: c.id, label: c.name })),
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
    const next = current.includes(tag) ? current.filter((t: string) => t !== tag) : [...current, tag]
    emit('update:filters', { ...props.filters, tags: next })
  }
</script>
