<template>
  <Card :border="true" :padding="true" class="bg-bg-primary">
    <div class="flex flex-col gap-4">
      <div v-if="enabledFilters.includes(PageFiltersEnum.SEARCH)" class="relative">
        <div class="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
          <SearchIcon class="w-5 h-5" />
        </div>

        <input
          :value="searchQuery"
          @input="handleSearchInput"
          type="text"
          :placeholder="searchPlaceholder"
          class="w-full pl-12 pr-12 py-3 border border-border-default rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-default focus:border-primary-default bg-bg-primary text-text-primary transition-all duration-200 shadow-sm hover:shadow-card"
        />

        <div class="absolute right-3 top-1/2 -translate-y-1/2">
          <Button
            v-if="searchQuery"
            @click="$emit('update:search-query', '')"
            icon-only
            variant="icon"
            size="md"
            class="hover:bg-bg-tertiary rounded-lg transition-colors"
          >
            <XMarkIcon class="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div class="flex flex-wrap gap-3">
        <div v-if="enabledFilters.includes(PageFiltersEnum.DATE)" class="flex-1 min-w-[200px]">
          <FormField label="Дата">
            <Input
              :model-value="selectedDate"
              type="date"
              :disabled="showAll"
              @update:model-value="$emit('date-change', $event)"
            />
          </FormField>
        </div>

        <div v-if="enabledFilters.includes(PageFiltersEnum.MOOD)" class="flex-1 min-w-[200px]">
          <label class="block text-sm font-medium text-text-secondary mb-2">Настроение</label>
          <div class="relative">
            <select
              :value="selectedMood ?? ''"
              @change="handleMoodChange"
              class="w-full px-4 py-2.5 pr-10 border border-border-default rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-default focus:border-primary-default bg-bg-primary transition-all duration-200 shadow-sm hover:shadow-card appearance-none cursor-pointer text-text-primary"
            >
              <option value="" class="text-text-muted">Все настроения</option>
              <option
                v-for="mood in moodOptions"
                :key="mood.value"
                :value="mood.value"
                class="text-text-primary"
              >
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

        <div v-if="enabledFilters.includes(PageFiltersEnum.PERIOD)" class="flex-1 min-w-[200px]">
          <label class="block text-sm font-medium text-text-secondary mb-2">Период</label>
          <div class="relative">
            <select
              :value="selectedPeriod ?? ''"
              @change="handlePeriodChange"
              class="w-full px-4 py-2.5 pr-10 border border-border-default rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-default focus:border-primary-default bg-bg-primary transition-all duration-200 shadow-sm hover:shadow-card appearance-none cursor-pointer text-text-primary"
            >
              <option value="" class="text-text-muted">Все даты</option>
              <option
                v-for="date in periodOptions"
                :key="date.value"
                :value="date.value"
                class="text-text-primary"
              >
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

        <div v-if="enabledFilters.includes(PageFiltersEnum.SHOW_ALL)" class="flex items-end">
          <Button
            :variant="showAll ? 'secondary' : 'outline'"
            size="md"
            @click="$emit('show-all')"
            class="whitespace-nowrap"
          >
            Загрузить все
          </Button>
        </div>

        <div class="flex items-end">
          <Button
            v-if="hasActiveFilters"
            variant="outline"
            size="md"
            @click="$emit('clear-filters')"
            class="whitespace-nowrap"
          >
            Сбросить фильтры
          </Button>
        </div>
      </div>

      <div v-if="hasActiveFilters" class="flex flex-wrap gap-2 pt-2 border-t border-border-light">
        <Badge
          v-if="searchQuery"
          variant="outline"
          class="bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1"
        >
          Поиск: "{{ searchQuery }}"
          <Button
            @click.stop="$emit('update:search-query', '')"
            icon-only
            variant="icon"
            size="md"
            icon-color="default"
            class="!p-0 !h-auto !w-auto ml-1"
          >
            <XMarkIcon class="w-3.5 h-3.5" />
          </Button>
        </Badge>

        <Badge
          v-if="selectedMood"
          variant="outline"
          class="bg-primary-light text-primary-dark border-primary-light flex items-center gap-1"
        >
          Настроение: {{ getMoodLabel(selectedMood) }}
          <Button
            @click.stop="$emit('update:selected-mood', null)"
            icon-only
            variant="icon"
            size="md"
            icon-color="default"
            class="!p-0 !h-auto !w-auto ml-1"
          >
            <XMarkIcon class="w-3.5 h-3.5" />
          </Button>
        </Badge>

        <Badge
          v-if="selectedDate && !showAll"
          variant="outline"
          class="bg-primary-light text-primary-dark border-primary-light flex items-center gap-1"
        >
          Дата: {{ formatDate(selectedDate) }}
          <Button
            @click.stop="handleClearDate"
            icon-only
            variant="icon"
            size="md"
            icon-color="default"
            class="!p-0 !h-auto !w-auto ml-1"
          >
            <XMarkIcon class="w-3.5 h-3.5" />
          </Button>
        </Badge>

        <Badge
          v-if="selectedPeriod"
          variant="outline"
          class="bg-success-light text-success-text border-success-border flex items-center gap-1"
        >
          Период: {{ getPeriodLabel(selectedPeriod) }}
          <Button
            @click.stop="$emit('update:selected-period', null)"
            icon-only
            variant="icon"
            size="md"
            icon-color="default"
            class="!p-0 !h-auto !w-auto ml-1"
          >
            <XMarkIcon class="w-3.5 h-3.5" />
          </Button>
        </Badge>

        <Badge
          v-if="showAll"
          variant="outline"
          class="bg-success-light text-success-text border-success-border flex items-center gap-1"
        >
          Показать все
          <Button
            @click.stop="$emit('reset-filter')"
            icon-only
            variant="icon"
            size="md"
            icon-color="default"
            class="!p-0 !h-auto !w-auto ml-1"
          >
            <XMarkIcon class="w-3.5 h-3.5" />
          </Button>
        </Badge>
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
  import { formatDateRu } from '@/shared/lib'
  import { Card, Button, Badge, FormField, Input } from '@/shared/ui'
  import { XMarkIcon, ChevronDownIcon, SearchIcon } from '@/shared/ui/icon'
  import { PageFiltersEnum } from './PageFilters.types'

  const props = withDefaults(
    defineProps<{
      enabledFilters: PageFiltersEnum[]
      hasActiveFilters: boolean
      searchQuery?: string
      searchPlaceholder?: string
      selectedDate?: string
      selectedMood?: number | null
      selectedPeriod?: string | null
      showAll?: boolean
      moodOptions?: Array<{ value: number; label: string }>
      periodOptions?: Array<{ value: string; label: string }>
    }>(),
    {
      searchQuery: '',
      searchPlaceholder: 'Поиск...',
      selectedDate: '',
      selectedMood: null,
      selectedPeriod: null,
      showAll: false,
      moodOptions: () => [],
      periodOptions: () => [],
    },
  )

  const emit = defineEmits<{
    'update:search-query': [value: string]
    'update:selected-mood': [value: number | null]
    'update:selected-period': [value: string | null]
    'date-change': [date: string]
    'show-all': []
    'reset-filter': []
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

  const handlePeriodChange = (event: Event) => {
    const target = event.target as HTMLSelectElement
    emit('update:selected-period', target?.value || null)
  }

  const handleClearDate = () => {
    emit('date-change', '')
  }

  const getMoodLabel = (value: number) => {
    return props.moodOptions?.find((m) => m.value === value)?.label || ''
  }

  const getPeriodLabel = (value: string) => {
    return props.periodOptions?.find((p) => p.value === value)?.label || value
  }

  const formatDate = (dateStr: string) => {
    return formatDateRu(dateStr, 'd MMMM yyyy')
  }
</script>
