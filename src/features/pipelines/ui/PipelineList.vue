<!-- components/pipelines/PipelineList.vue -->
<template>
    <Card class="p-4 space-y-3 flex flex-col h-full">
      <div class="flex items-center justify-between gap-2 mb-1">
        <h2 class="text-sm font-medium text-text-secondary">Список воронок</h2>
        <span class="text-xs text-text-muted">{{ pipelines.length }} шт.</span>
      </div>
  
      <div
        v-if="isLoading"
        class="text-sm text-text-secondary py-8 text-center flex flex-col items-center justify-center"
      >
        <span class="animate-pulse">Загрузка воронок...</span>
      </div>
  
      <div
        v-else-if="pipelines.length === 0"
        class="text-sm text-text-secondary py-8 text-center flex flex-col items-center justify-center"
      >
        <p>Воронок пока нет.</p>
        <p class="mt-1 text-xs text-text-muted" v-if="showEmptyHint">
          {{ emptyHint }}
        </p>
      </div>
  
      <div v-else class="flex-1 flex flex-col min-h-0">
        <div class="space-y-(--spacing-2)">
          <ListOption
            v-for="pipeline in paginatedPipelines"
            :key="pipeline.id"
            :title="pipeline.name"
            :selected="pipeline.id === selectedPipelineId"
            :trailing="`Этапов: ${pipeline.stages.length}`"
            class="cursor-pointer"
            @click="$emit('select', pipeline.id)"
          >
            <template #badge>
              <Badge v-if="pipeline.isDefault" variant="indigo">По умолчанию</Badge>
            </template>
          </ListOption>
        </div>
  
        <div
          v-if="showPagination"
          class="pt-2 border-t border-border-light mt-2"
        >
          <Pagination
            :total="pipelines.length"
            :page-size="pageSize"
            :current-page="currentPage"
            @page-change="$emit('page-change', $event)"
          />
        </div>
      </div>
    </Card>
  </template>
  
  <script setup lang="ts">
  import type { Pipeline } from '@/entities/deal'
  import { Card, ListOption, Badge, Pagination } from '@/shared/ui'
  
  defineProps<{
    pipelines: Pipeline[]
    isLoading: boolean
    selectedPipelineId: string | null
    paginatedPipelines: Pipeline[]
    showPagination: boolean
    pageSize: number
    currentPage: number
    showEmptyHint?: boolean
    emptyHint?: string
  }>()
  
  defineEmits<{
    (e: 'select', id: string): void
    (e: 'page-change', page: number): void
  }>()
  </script>
