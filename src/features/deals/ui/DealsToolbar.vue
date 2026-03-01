<template>
  <div class="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center flex-wrap">
    <div class="flex gap-2 flex-shrink-0 flex-wrap items-center">
      <Button variant="primary" size="md" @click="$emit('create')">
        <PlusIcon class="size-5 mr-2" />
        Создать сделку
      </Button>

      <div v-if="pipelines.length > 1" class="flex items-center gap-2">
        <label class="text-sm text-text-secondary whitespace-nowrap">Воронка:</label>
        <select
          :value="selectedPipelineId"
          class="px-3 py-2 border border-border-default rounded-lg bg-bg-primary text-text-primary text-sm min-w-[160px]"
          @change="$emit('update:selectedPipelineId', ($event.target as HTMLSelectElement).value)"
        >
          <option v-for="p in pipelines" :key="p.id" :value="p.id">{{ p.name }}</option>
        </select>
      </div>

      <div class="flex rounded-lg border border-border-default overflow-hidden">
        <button
          type="button"
          :class="['px-3 py-2 text-sm', viewMode === 'kanban' ? 'bg-primary-default text-white' : 'bg-bg-primary text-text-secondary hover:bg-bg-tertiary']"
          title="Канбан"
          @click="$emit('update:viewMode', 'kanban')"
        >
          Канбан
        </button>
        <button
          type="button"
          :class="['px-3 py-2 text-sm flex items-center gap-1', viewMode === 'table' ? 'bg-primary-default text-white' : 'bg-bg-primary text-text-secondary hover:bg-bg-tertiary']"
          title="Список"
          @click="$emit('update:viewMode', 'table')"
        >
          <ListIcon class="size-4" />
          Список
        </button>
      </div>

      <div class="flex items-center gap-2">
        <label class="text-sm text-text-secondary whitespace-nowrap">Период:</label>
        <input
          :value="dateFrom"
          type="date"
          class="px-3 py-2 border border-border-default rounded-lg bg-bg-primary text-text-primary text-sm"
          @input="$emit('update:dateFrom', ($event.target as HTMLInputElement).value)"
        />
        <span class="text-text-muted">—</span>
        <input
          :value="dateTo"
          type="date"
          class="px-3 py-2 border border-border-default rounded-lg bg-bg-primary text-text-primary text-sm"
          @input="$emit('update:dateTo', ($event.target as HTMLInputElement).value)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { Button } from '@/shared/ui'
  import { PlusIcon, ListIcon } from '@/shared/ui/icon'
  import type { Pipeline } from '@/entities/deal'
  import type { DealsViewMode } from '../model/use-deals-page'

  defineProps<{
    pipelines: Pipeline[]
    viewMode: DealsViewMode
    selectedPipelineId: string
    dateFrom: string
    dateTo: string
  }>()

  defineEmits<{
    create: []
    'update:viewMode': [mode: DealsViewMode]
    'update:selectedPipelineId': [id: string]
    'update:dateFrom': [value: string]
    'update:dateTo': [value: string]
  }>()
</script>
