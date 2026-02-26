<template>
  <Card :border="true" :padding="true" class="bg-bg-primary">
    <div class="flex flex-col gap-5">
      <div class="relative">
        <div class="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        
        <input
          :value="searchQuery"
          @input="handleSearchInput"
          type="text"
          placeholder="Поиск по записям, тегам, содержимому..."
          class="w-full pl-12 pr-12 py-3 border border-border-default rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-default focus:border-primary-default bg-bg-primary text-text-primary transition-all duration-200 shadow-sm hover:shadow-card"
        />
        
        <div class="absolute right-3 top-1/2 -translate-y-1/2">
          <Button
            v-if="searchQuery"
            @click="$emit('update:search-query', '')"
            icon-only
            variant="icon"
            size="sm"
            class="hover:bg-bg-tertiary rounded-lg transition-colors"
            :left-icon="XMarkIcon"
          />
        </div>
      </div>

      <div class="flex flex-wrap gap-4">
        <div class="flex-1 min-w-[200px]">
          <label class="block text-sm font-medium text-text-secondary mb-2">Настроение</label>
          <div class="relative">
            <select
              :value="selectedMood ?? ''"
              @change="handleMoodChange"
              class="w-full px-4 py-2.5 pr-10 border border-border-default rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-default focus:border-primary-default bg-bg-primary transition-all duration-200 shadow-sm hover:shadow-card appearance-none cursor-pointer text-text-primary"
            >
              <option value="" class="text-text-muted">Все настроения</option>
              <option v-for="mood in moodOptions" :key="mood.value" :value="mood.value" class="text-text-primary">
                {{ mood.label }}
              </option>
            </select>
            <div
              class="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
            >
              <ChevronDownIcon class="w-5 h-5" />
            </div>
          </div>
        </div>

        <div class="flex-1 min-w-[200px]">
          <label class="block text-sm font-medium text-text-secondary mb-2">Период</label>
          <div class="relative">
            <select
              :value="selectedDate ?? ''"
              @change="handleDateChange"
              class="w-full px-4 py-2.5 pr-10 border border-border-default rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-default focus:border-primary-default bg-bg-primary transition-all duration-200 shadow-sm hover:shadow-card appearance-none cursor-pointer text-text-primary"
            >
              <option value="" class="text-text-muted">Все даты</option>
              <option v-for="date in dateOptions" :key="date.value" :value="date.value" class="text-text-primary">
                {{ date.label }}
              </option>
            </select>
            <div
              class="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
            >
              <ChevronDownIcon class="w-5 h-5" />
            </div>
          </div>
        </div>

        <div class="flex items-end">
          <Button
            v-if="hasActiveFilters"
            variant="outline"
            size="sm"
            @click="$emit('clear-filters')"
            class="whitespace-nowrap rounded-xl"
          >
            Сбросить фильтры
          </Button>
        </div>
      </div>

      <div v-if="hasActiveFilters" class="flex flex-wrap gap-2 pt-4 border-t border-border-light">
        <Badge
          v-if="selectedMood"
          variant="outline"
          class="bg-primary-light text-primary-dark border-primary-light flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
        >
          <span class="text-sm"
            >Настроение: {{ moodOptions.find((m) => m.value === selectedMood)?.label }}</span
          >
          <Button
            @click.stop="$emit('update:selected-mood', null)"
            icon-only
            variant="icon"
            size="sm"
            icon-color="default"
            class="!p-0 !h-auto !w-auto hover:bg-primary-light/80 rounded-full transition-colors"
            :left-icon="XMarkIcon"
          />
        </Badge>

        <Badge
          v-if="selectedDate"
          variant="outline"
          class="bg-success-light text-success-text border-success-border flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
        >
          <span class="text-sm"
            >Период: {{ dateOptions.find((d) => d.value === selectedDate)?.label }}</span
          >
          <Button
            @click.stop="$emit('update:selected-date', null)"
            icon-only
            variant="icon"
            size="sm"
            icon-color="default"
            class="!p-0 !h-auto !w-auto hover:bg-success-light/80 rounded-full transition-colors"
            :left-icon="XMarkIcon"
          />
        </Badge>

        <Badge
          v-if="searchQuery"
          variant="outline"
          class="bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
        >
          <span class="text-sm">Поиск: "{{ searchQuery }}"</span>
          <Button
            @click.stop="$emit('update:search-query', '')"
            icon-only
            variant="icon"
            size="sm"
            icon-color="default"
            class="!p-0 !h-auto !w-auto hover:bg-amber-100 rounded-full transition-colors"
            :left-icon="XMarkIcon"
          />
        </Badge>
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
  import { Card, Button, Badge } from '@/shared/ui'
  import { XMarkIcon, ChevronDownIcon } from '@/shared/ui/icon'
  import type { moodOptions, dateOptions } from '@/features/journal/model'

  defineProps<{
    searchQuery: string
    selectedMood: number | null
    selectedDate: string | null
    moodOptions: typeof moodOptions
    dateOptions: typeof dateOptions
    hasActiveFilters: boolean
  }>()

  const emit = defineEmits<{
    'update:search-query': [value: string]
    'update:selected-mood': [value: number | null]
    'update:selected-date': [value: string | null]
    'clear-filters': []
  }>()

  const handleSearchInput = (event: Event) => {
    const target = event.target as HTMLInputElement
    emit('update:search-query', target.value)
  }

  const handleMoodChange = (event: Event) => {
    const target = event.target as HTMLSelectElement
    const value = target?.value
    emit('update:selected-mood', value ? Number(value) : null)
  }

  const handleDateChange = (event: Event) => {
    const target = event.target as HTMLSelectElement
    emit('update:selected-date', target?.value || null)
  }
</script>
