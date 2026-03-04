<template>
  <DataTable
    title="Сделки"
    :data="deals"
    :columns="(dealColumns as import('@/shared/ui').DataTableColumn<unknown>[])"
    :get-row-id="(row: unknown) => (row as Deal).id"
    :loading="isLoading"
    :error="isError"
    empty-message="Нет сделок для отображения."
    error-message="Ошибка загрузки сделок."
    :selectable="true"
    :selected-ids="selectedIds"
    :sort-by="sortBy"
    :sort-order="sortOrder"
    @select="handleRowSelect"
    @select-all="onSelectAll"
    @sort="handleSort"
    :row-actions="(row: unknown) => rowActionsRenderer(row as Deal)"
  >
    <template #headerActions>
      <Button variant="ghost" size="md" :disabled="isLoading" @click="fetchDeals">
        Обновить
      </Button>
    </template>
    <template #footer>
      <Pagination
        :total="total"
        :page-size="pageSize"
        :current-page="page"
        @page-change="setPage"
      />
    </template>
  </DataTable>
</template>

<script setup lang="ts">
  import { h, computed } from 'vue'
  import { DataTable, Button, Pagination } from '@/shared/ui'
  import { getDealColumns } from '../config/columns'
  import DealsTableRowActions from './DealsTableRowActions.vue'
  import type { Deal, Pipeline } from '@/entities/deal'

  const props = defineProps<{
    deals: Deal[]
    pipelines: Pipeline[]
    total: number
    isLoading: boolean
    isError: boolean
    page: number
    pageSize: number
    sortBy: string | null
    sortOrder: 'asc' | 'desc'
    selectedIds: Set<string | number>
    handleSort: (columnId: string) => void
    handleRowSelect: (id: string | number) => void
    handleSelectAll: (ids: (string | number)[]) => void
    setPage: (page: number) => void
    fetchDeals: () => Promise<void>
  }>()

  const emit = defineEmits<{ edit: [deal: Deal]; delete: [deal: Deal] }>()

  const stageName = (stageId: string) => {
    for (const p of props.pipelines) {
      const s = p.stages.find((st) => st.id === stageId)
      if (s) return s.name
    }
    return stageId
  }

  const dealColumns = computed(() => getDealColumns(stageName))

  const onSelectAll = () => {
    props.handleSelectAll(props.deals.map((d) => d.id))
  }

  function rowActionsRenderer(deal: Deal) {
    return h(DealsTableRowActions, {
      deal,
      onEdit: (d: Deal) => emit('edit', d),
      onDelete: (d: Deal) => emit('delete', d),
    })
  }
</script>
