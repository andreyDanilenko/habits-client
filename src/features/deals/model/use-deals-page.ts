import { computed } from 'vue'
import { useDealsList } from './use-deals-list'
import { useDealsCrud } from './use-deals-crud'
import { useDealsKanban } from './use-deals-kanban'

export type { DealsViewMode, DealsStatusFilter } from './use-deals-list'

export function useDealsPage() {
  const list = useDealsList()
  const crud = useDealsCrud(() => list.workspaceId.value, list.fetchDeals, list.clearSelection)
  const kanban = useDealsKanban(
    list.deals,
    list.currentPipeline,
    crud.updateDeal,
    list.mergeDealInList,
  )

  return {
    // List
    workspaceId: list.workspaceId,
    pipelines: list.pipelines,
    deals: list.deals,
    total: list.total,
    isLoading: list.isLoading,
    error: list.error,
    isError: computed(() => !!list.error.value),
    viewMode: list.viewMode,
    selectedPipelineId: list.selectedPipelineId,
    defaultPipeline: list.defaultPipeline,
    dateFrom: list.dateFrom,
    dateTo: list.dateTo,
    statusFilter: list.statusFilter,
    currentPipeline: list.currentPipeline,
    defaultStageId: list.defaultStageId,
    fetchDeals: list.fetchDeals,

    // Table state
    page: list.page,
    pageSize: list.pageSize,
    sortBy: list.sortBy,
    sortOrder: list.sortOrder,
    selectedIds: list.selectedIds,
    handleSort: list.handleSort,
    handleRowSelect: list.handleRowSelect,
    handleSelectAll: list.handleSelectAll,
    setPage: list.setPage,

    // Kanban
    kanbanColumns: kanban.kanbanColumns,
    setKanbanColumnsFromBoard: kanban.setKanbanColumnsFromBoard,
    savingDealIds: kanban.savingDealIds,
    handleDealMove: kanban.handleDealMove,

    // CRUD
    createDeal: crud.createDeal,
    updateDeal: crud.updateDeal,
    deleteDeal: crud.deleteDeal,
  }
}
