import { computed } from 'vue'
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

  const defaultPipelineId = computed(
    () => page.defaultPipeline?.value?.id ?? page.pipelines.value?.[0]?.id ?? '',
  )

  const hasActiveFilters = computed(
    () =>
      (page.pipelines.value.length > 1 &&
        page.selectedPipelineId.value !== defaultPipelineId.value) ||
      !!page.dateFrom.value ||
      !!page.dateTo.value ||
      page.statusFilter.value !== 'all',
  )

  const activeFiltersCount = computed(() => {
    let n = 0
    if (
      page.pipelines.value.length > 1 &&
      page.selectedPipelineId.value !== defaultPipelineId.value
    )
      n++
    if (page.dateFrom.value) n++
    if (page.dateTo.value) n++
    if (page.statusFilter.value !== 'all') n++
    return n
  })

  const resetFilters = () => {
    const def = page.pipelines.value.find((p) => p.isDefault) ?? page.pipelines.value[0]
    if (def) page.selectedPipelineId.value = def.id
    page.dateFrom.value = ''
    page.dateTo.value = ''
    page.statusFilter.value = 'all'
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
    hasActiveFilters,
    activeFiltersCount,
    resetFilters,
  }
}
