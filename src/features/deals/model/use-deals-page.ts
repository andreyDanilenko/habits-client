import { ref, watch, computed } from 'vue'
import { useWorkspaceStore } from '@/entities/workspace'
import { dealService } from '@/entities/deal'
import type { Deal, Pipeline, CreateDealDto, UpdateDealDto } from '@/entities/deal'
import { useDealsTableState } from './use-deals-table-state'

export function useDealsPage() {
  const workspaceStore = useWorkspaceStore()
  const tableState = useDealsTableState()

  const pipelines = ref<Pipeline[]>([])
  const deals = ref<Deal[]>([])
  const total = ref(0)
  const isLoading = ref(false)
  const isError = ref(false)

  const workspaceId = computed(() => workspaceStore.currentWorkspace?.id ?? '')

  const fetchPipelines = async () => {
    if (!workspaceId.value) return
    pipelines.value = await dealService.getPipelines(workspaceId.value)
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
      const res = await dealService.getList({
        workspaceId: workspaceId.value,
        page: tableState.page.value,
        limit: tableState.pageSize.value,
        sortBy: tableState.sortBy.value ?? undefined,
        sortOrder: tableState.sortOrder.value,
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
    [() => tableState.page.value, () => tableState.pageSize.value, () => tableState.sortBy.value, () => tableState.sortOrder.value],
    fetchDeals,
  )

  const createDeal = async (data: CreateDealDto): Promise<Deal> => {
    if (!workspaceId.value) throw new Error('Workspace not selected')
    const deal = await dealService.create(workspaceId.value, data)
    await fetchDeals()
    return deal
  }

  const updateDeal = async (id: string, data: UpdateDealDto): Promise<Deal> => {
    if (!workspaceId.value) throw new Error('Workspace not selected')
    const deal = await dealService.update(workspaceId.value, id, data)
    await fetchDeals()
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

  return {
    ...tableState,
    workspaceId,
    pipelines,
    deals,
    total,
    isLoading,
    isError,
    fetchDeals,
    fetchPipelines,
    createDeal,
    updateDeal,
    deleteDeal,
    defaultPipeline,
    defaultStageId,
  }
}
