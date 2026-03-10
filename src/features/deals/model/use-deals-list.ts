import { ref, watch, computed } from 'vue'
import { useWorkspaceStore } from '@/entities/workspace'
import { dealService } from '@/entities/deal'
import type { Deal, Pipeline } from '@/entities/deal'
import { useDealsTableState } from './use-deals-table-state'

export type DealsViewMode = 'kanban' | 'table'
export type DealsStatusFilter = 'all' | 'open' | 'won' | 'lost'

export function useDealsList() {
  const workspaceStore = useWorkspaceStore()
  const tableState = useDealsTableState()

  const pipelines = ref<Pipeline[]>([])
  const deals = ref<Deal[]>([])
  const total = ref(0)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const viewMode = ref<DealsViewMode>('kanban')
  const selectedPipelineId = ref<string>('')
  const dateFrom = ref<string>('')
  const dateTo = ref<string>('')
  const statusFilter = ref<DealsStatusFilter>('all')

  const workspaceId = computed(
    () => workspaceStore.currentWorkspace?.id ?? workspaceStore.workspaces?.[0]?.id ?? '',
  )

  const defaultPipeline = computed(
    () => pipelines.value.find((p) => p.isDefault) ?? pipelines.value[0],
  )

  const currentPipeline = computed(
    () => pipelines.value.find((p) => p.id === selectedPipelineId.value) ?? defaultPipeline.value,
  )

  const defaultStageId = computed(
    () => currentPipeline.value?.stages?.[0]?.id ?? defaultPipeline.value?.stages?.[0]?.id,
  )

  const fetchPipelines = async () => {
    if (!workspaceId.value) return
    pipelines.value = await dealService.getPipelines(workspaceId.value)
    if (!selectedPipelineId.value && pipelines.value.length > 0) {
      const def = pipelines.value.find((p) => p.isDefault) ?? pipelines.value[0]
      selectedPipelineId.value = def.id
    }
  }

  const fetchDeals = async () => {
    if (!workspaceId.value) {
      deals.value = []
      total.value = 0
      return
    }
    isLoading.value = true
    error.value = null
    try {
      const isKanban = viewMode.value === 'kanban'
      const statusParam = isKanban
        ? 'open'
        : statusFilter.value === 'all'
          ? undefined
          : statusFilter.value
      const res = await dealService.getList({
        workspaceId: workspaceId.value,
        page: isKanban ? 1 : tableState.page.value,
        limit: isKanban ? 500 : tableState.pageSize.value,
        sortBy: isKanban ? undefined : (tableState.sortBy.value ?? undefined),
        sortOrder: isKanban ? 'asc' : tableState.sortOrder.value,
        pipelineId: selectedPipelineId.value || undefined,
        status: statusParam,
        dateFrom: dateFrom.value || undefined,
        dateTo: dateTo.value || undefined,
      })
      deals.value = res.deals
      total.value = res.total
    } catch {
      error.value = 'Не удалось загрузить сделки'
      deals.value = []
      total.value = 0
    } finally {
      isLoading.value = false
    }
  }

  const mergeDealInList = (id: string, patch: Partial<Deal>) => {
    const idx = deals.value.findIndex((d) => d.id === id)
    if (idx >= 0) {
      deals.value = [
        ...deals.value.slice(0, idx),
        { ...deals.value[idx], ...patch },
        ...deals.value.slice(idx + 1),
      ]
    }
  }

  watch(
    workspaceId,
    async () => {
      await fetchPipelines()
      await fetchDeals()
    },
    { immediate: true },
  )

  watch(
    [
      () => tableState.page.value,
      () => tableState.pageSize.value,
      () => tableState.sortBy.value,
      () => tableState.sortOrder.value,
      viewMode,
      selectedPipelineId,
      dateFrom,
      dateTo,
      statusFilter,
    ],
    fetchDeals,
  )

  return {
    ...tableState,
    workspaceId,
    pipelines,
    deals,
    total,
    isLoading,
    error,
    viewMode,
    selectedPipelineId,
    dateFrom,
    dateTo,
    statusFilter,
    defaultPipeline,
    currentPipeline,
    defaultStageId,
    fetchPipelines,
    fetchDeals,
    mergeDealInList,
  }
}
