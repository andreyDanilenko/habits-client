<template>
  <Card :border="true" :padding="true" class="bg-white">
    <div class="flex flex-col gap-4">
      <!-- Поиск -->
      <div class="relative">
        <Input
          :model-value="searchQuery"
          @update:model-value="$emit('update:search-query', $event)"
          placeholder="Поиск по записям, тегам, содержимому..."
          class="w-full pl-10"
        />
        <div class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <Button
          v-if="searchQuery"
          @click="$emit('update:search-query', '')"
          icon-only
          variant="icon"
          size="sm"
          class="absolute right-3 top-1/2 -translate-y-1/2"
          :left-icon="XMarkIcon"
        />
      </div>

      <!-- Фильтры -->
      <div class="flex flex-wrap gap-3">
        <!-- Фильтр по настроению -->
        <div class="flex-1 min-w-[200px]">
          <label class="block text-xs font-medium text-gray-700 mb-1">Настроение</label>
          <select
            :value="selectedMood"
            @change="
              $emit(
                'update:selected-mood',
                $event.target.value ? Number($event.target.value) : null,
              )
            "
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
          >
            <option :value="null">Все настроения</option>
            <option v-for="mood in moodOptions" :key="mood.value" :value="mood.value">
              {{ mood.label }}
            </option>
          </select>
        </div>

        <!-- Фильтр по дате -->
        <div class="flex-1 min-w-[200px]">
          <label class="block text-xs font-medium text-gray-700 mb-1">Период</label>
          <select
            :value="selectedDate"
            @change="$emit('update:selected-date', $event.target.value || null)"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
          >
            <option :value="null">Все даты</option>
            <option v-for="date in dateOptions" :key="date.value" :value="date.value">
              {{ date.label }}
            </option>
          </select>
        </div>

        <!-- Сброс фильтров -->
        <div class="flex items-end">
          <Button
            v-if="hasActiveFilters"
            variant="outline"
            @click="$emit('clear-filters')"
            class="whitespace-nowrap"
          >
            Сбросить фильтры
          </Button>
        </div>
      </div>

      <!-- Индикаторы активных фильтров -->
      <div v-if="hasActiveFilters" class="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
        <Badge
          v-if="selectedMood"
          variant="outline"
          class="bg-indigo-50 text-indigo-700 border-indigo-200 flex items-center gap-1"
        >
          Настроение: {{ moodOptions.find((m) => m.value === selectedMood)?.label }}
          <Button
            @click.stop="$emit('update:selected-mood', null)"
            icon-only
            variant="icon"
            size="sm"
            icon-color="default"
            class="!p-0 !h-auto !w-auto ml-1"
            :left-icon="XMarkIcon"
          />
        </Badge>
        <Badge
          v-if="selectedDate"
          variant="outline"
          class="bg-emerald-50 text-emerald-700 border-emerald-200 flex items-center gap-1"
        >
          Период: {{ dateOptions.find((d) => d.value === selectedDate)?.label }}
          <Button
            @click.stop="$emit('update:selected-date', null)"
            icon-only
            variant="icon"
            size="sm"
            icon-color="default"
            class="!p-0 !h-auto !w-auto ml-1"
            :left-icon="XMarkIcon"
          />
        </Badge>
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
            size="sm"
            icon-color="default"
            class="!p-0 !h-auto !w-auto ml-1"
            :left-icon="XMarkIcon"
          />
        </Badge>
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
  import { Card, Button, Input, Badge } from '@/shared/ui'
  import { XMarkIcon } from '@/shared/ui/icon'
  import type { moodOptions, dateOptions } from '@/features/journal/model'

  defineProps<{
    searchQuery: string
    selectedMood: number | null
    selectedDate: string | null
    moodOptions: typeof moodOptions
    dateOptions: typeof dateOptions
    hasActiveFilters: boolean
  }>()

  defineEmits<{
    'update:search-query': [value: string]
    'update:selected-mood': [value: number | null]
    'update:selected-date': [value: string | null]
    'clear-filters': []
  }>()
</script>
