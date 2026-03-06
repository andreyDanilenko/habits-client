<template>
  <div class="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center flex-wrap">
    <div class="flex gap-2 flex-shrink-0 flex-wrap items-center">
      <div v-if="pipelines.length > 1" class="min-w-[160px]">
        <span class="block text-(--text-sm) font-medium text-text-secondary mb-(--spacing-1)">Воронка</span>
        <Select
          :model-value="selectedPipelineId"
          :options="pipelineSelectOptions"
          @update:model-value="onPipelineChange"
        />
      </div>

      <SegmentedControl
        :model-value="viewMode"
        :options="viewModeOptions"
        @update:model-value="onViewModeChange"
      />

      <div v-if="viewMode === 'table'" class="min-w-[140px]">
        <span class="block text-(--text-sm) font-medium text-text-secondary mb-(--spacing-1)">Статус</span>
        <Select
          :model-value="status"
          :options="statusOptions"
          @update:model-value="onStatusChange"
        />
      </div>

      <div class="flex flex-wrap items-end gap-2">
        <span class="block text-(--text-sm) font-medium text-text-secondary mb-(--spacing-1) shrink-0">Период</span>
        <DatePicker
          :model-value="dateFrom"
          placeholder="ДД.ММ.ГГГГ"
          @update:model-value="$emit('update:dateFrom', $event)"
        />
        <span class="text-text-muted pb-1">—</span>
        <DatePicker
          :model-value="dateTo"
          placeholder="ДД.ММ.ГГГГ"
          @update:model-value="$emit('update:dateTo', $event)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { Select, DatePicker, SegmentedControl } from '@/shared/ui'
  import { ListIcon } from '@/shared/ui/icon'
  import type { Pipeline } from '@/entities/deal'
  import type { DealsViewMode, DealsStatusFilter } from '../model/use-deals-page'

  const props = defineProps<{
    pipelines: Pipeline[]
    viewMode: DealsViewMode
    selectedPipelineId: string
    dateFrom: string
    dateTo: string
    status: DealsStatusFilter
  }>()

  const emit = defineEmits<{
    'update:viewMode': [mode: DealsViewMode]
    'update:selectedPipelineId': [id: string]
    'update:dateFrom': [value: string]
    'update:dateTo': [value: string]
    'update:status': [value: DealsStatusFilter]
  }>()

  const pipelineSelectOptions = computed(() =>
    props.pipelines.map((p) => ({ value: p.id, label: p.name })),
  )

  const viewModeOptions = computed(() => [
    { value: 'kanban', label: 'Канбан' },
    { value: 'table', label: 'Список', icon: ListIcon },
  ])

  const statusOptions = [
    { value: 'all', label: 'Все' },
    { value: 'open', label: 'Активные' },
    { value: 'won', label: 'Успешные' },
    { value: 'lost', label: 'Проигранные' },
  ]

  function onPipelineChange(value: string | number | null | undefined) {
    emit('update:selectedPipelineId', String(value ?? ''))
  }

  function onViewModeChange(value: string) {
    emit('update:viewMode', value as DealsViewMode)
  }

  function onStatusChange(value: string | number | null | undefined) {
    const v = value === '' || value == null ? 'all' : String(value)
    emit('update:status', v as DealsStatusFilter)
  }
</script>
