import { ref, watch, computed } from 'vue'
import { useWorkspaceStore } from '@/entities/workspace'
import { dealService } from '@/entities/deal'
import type { Deal, Pipeline, CreateDealDto, UpdateDealDto } from '@/entities/deal'
import { useDealsTableState } from './use-deals-table-state'
import type { KanbanColumnModel } from '@/shared/ui'

export type DealsViewMode = 'kanban' | 'table'

export function useDealsPage() {
  const workspaceStore = useWorkspaceStore()
  const tableState = useDealsTableState()

  const pipelines = ref<Pipeline[]>([])
  const deals = ref<Deal[]>([])
  const total = ref(0)
  const isLoading = ref(false)
  const isError = ref(false)

  const viewMode = ref<DealsViewMode>('kanban')
  const selectedPipelineId = ref<string>('')
  const dateFrom = ref<string>('')
  const dateTo = ref<string>('')

  const workspaceId = computed(
    () => workspaceStore.currentWorkspace?.id ?? workspaceStore.workspaces?.[0]?.id ?? '',
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
    isError.value = false
    try {
      const isKanban = viewMode.value === 'kanban'
      const res = await dealService.getList({
        workspaceId: workspaceId.value,
        page: isKanban ? 1 : tableState.page.value,
        limit: isKanban ? 500 : tableState.pageSize.value,
        sortBy: isKanban ? undefined : (tableState.sortBy.value ?? undefined),
        sortOrder: isKanban ? 'asc' : tableState.sortOrder.value,
        pipelineId: isKanban ? selectedPipelineId.value || undefined : undefined,
        dateFrom: dateFrom.value || undefined,
        dateTo: dateTo.value || undefined,
      })
      deals.value = res.deals
      total.value = res.total
    } catch {
      isError.value = true
      deals.value = []
      total.value = 0
    } finally {
      isLoading.value = false
    }
  }

  watch(workspaceId, async () => {
    await fetchPipelines()
    await fetchDeals()
  }, { immediate: true })

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
    ],
    fetchDeals,
  )

  const createDeal = async (data: CreateDealDto): Promise<Deal> => {
    if (!workspaceId.value) throw new Error('Workspace not selected')
    const deal = await dealService.create(workspaceId.value, data)
    await fetchDeals()
    return deal
  }

  const updateDeal = async (
    id: string,
    data: UpdateDealDto,
    options?: { skipRefetch?: boolean },
  ): Promise<Deal> => {
    if (!workspaceId.value) throw new Error('Workspace not selected')
    const deal = await dealService.update(workspaceId.value, id, data)
    if (!options?.skipRefetch) {
      await fetchDeals()
    } else {
      const local = deals.value.find((d) => d.id === id)
      if (local) {
        local.stageId = data.stageId ?? local.stageId
        local.updatedAt = deal.updatedAt
      }
    }
    return deal
  }

  const deleteDeal = async (id: string): Promise<void> => {
    if (!workspaceId.value) throw new Error('Workspace not selected')
    await dealService.delete(workspaceId.value, id)
    tableState.clearSelection()
    await fetchDeals()
  }

  const defaultPipeline = computed(() => pipelines.value.find((p) => p.isDefault) ?? pipelines.value[0])
  const defaultStageId = computed(() => defaultPipeline.value?.stages[0]?.id)

  const currentPipeline = computed(() =>
    pipelines.value.find((p) => p.id === selectedPipelineId.value) ?? defaultPipeline.value,
  )

  const kanbanColumns = ref<KanbanColumnModel<Deal>[]>([])

  function buildKanbanColumns(): KanbanColumnModel<Deal>[] {
    const pipeline = currentPipeline.value
    if (!pipeline) return []
    return pipeline.stages
      .sort((a, b) => a.order - b.order)
      .map((stage) => {
        const stageDeals = deals.value.filter((d) => d.stageId === stage.id)
        const sum = stageDeals.reduce((acc, d) => acc + (d.budget ?? 0), 0)
        return {
          id: stage.id,
          title: stage.name,
          color: stage.color,
          items: [...stageDeals],
          meta: { sum, count: stageDeals.length },
        }
      })
  }

  /** Обновляет колонки на месте, без замены массива — меньше дёргания при смене фильтра */
  function syncKanbanColumnsInPlace() {
    const pipeline = currentPipeline.value
    if (!pipeline) {
      kanbanColumns.value = []
      return
    }
    const stages = [...pipeline.stages].sort((a, b) => a.order - b.order)
    const current = kanbanColumns.value
    const stageIds = stages.map((s) => s.id)

    if (
      current.length === stageIds.length &&
      current.every((col, i) => col.id === stageIds[i])
    ) {
      for (let i = 0; i < stages.length; i++) {
        const stage = stages[i]
        const stageDeals = deals.value.filter((d) => d.stageId === stage.id)
        const sum = stageDeals.reduce((acc, d) => acc + (d.budget ?? 0), 0)
        current[i].title = stage.name
        current[i].color = stage.color
        current[i].items = [...stageDeals]
        current[i].meta = { sum, count: stageDeals.length }
      }
      return
    }
    kanbanColumns.value = buildKanbanColumns()
  }

  watch(
    [deals, currentPipeline],
    () => {
      syncKanbanColumnsInPlace()
    },
    { immediate: true },
  )

  const savingDealIds = ref<Set<string>>(new Set())

  async function handleDealMove(payload: { item: unknown; toColumnId?: string }) {
    const deal = payload.item as Deal
    if (!payload.toColumnId || !deal?.id) return
    savingDealIds.value = new Set(savingDealIds.value).add(deal.id)
    try {
      await updateDeal(deal.id, { stageId: payload.toColumnId }, { skipRefetch: true })
    } finally {
      const next = new Set(savingDealIds.value)
      next.delete(deal.id)
      savingDealIds.value = next
    }
  }

  return {
    ...tableState,
    workspaceId,
    pipelines,
    deals,
    total,
    isLoading,
    isError,
    viewMode,
    selectedPipelineId,
    dateFrom,
    dateTo,
    currentPipeline,
    kanbanColumns,
    savingDealIds,
    handleDealMove,
    fetchDeals,
    fetchPipelines,
    createDeal,
    updateDeal,
    deleteDeal,
    defaultPipeline,
    defaultStageId,
  }
}
