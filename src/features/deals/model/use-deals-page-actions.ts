import { useDealsPage } from './use-deals-page'
import { useDealActions } from './use-deal-actions'

export function useDealsPageActions() {
  const page = useDealsPage()

  const actions = useDealActions({
    workspaceId: () => page.workspaceId.value,
    pipelines: () => page.pipelines.value,
    createDeal: page.createDeal,
    updateDeal: page.updateDeal,
    deleteDeal: page.deleteDeal,
    onSuccess: page.fetchDeals,
  })

  const setViewMode = (v: 'kanban' | 'table') => {
    page.viewMode.value = v
  }

  const setSelectedPipelineId = (v: string) => {
    page.selectedPipelineId.value = v
  }

  const setDateFrom = (v: string) => {
    page.dateFrom.value = v
  }

  const setDateTo = (v: string) => {
    page.dateTo.value = v
  }

  const setStatusFilter = (v: 'all' | 'open' | 'won' | 'lost') => {
    page.statusFilter.value = v
  }

  return {
    ...page,
    openCreateModal: actions.openAddDeal,
    openEditModal: actions.openEditDeal,
    confirmDelete: actions.openDeleteConfirm,
    openDealCard: actions.openDealCard,
    setViewMode,
    setSelectedPipelineId,
    setDateFrom,
    setDateTo,
    setStatusFilter,
  }
}
