import { ref, watch, type Ref, type ComputedRef } from 'vue'
import { dealService } from '@/entities/deal'
import type { Deal, Pipeline } from '@/entities/deal'
import type { KanbanColumnModel } from '@/shared/ui'

export function useDealsKanban(
  deals: Ref<Deal[]>,
  currentPipeline: ComputedRef<Pipeline | undefined>,
  workspaceId: Ref<string>,
  updateDeal: (id: string, data: { stageId: string }, opts?: { skipRefetch?: boolean }) => Promise<unknown>,
  mergeDealInList: (id: string, patch: Partial<Deal>) => void,
) {
  const kanbanColumns = ref<KanbanColumnModel<Deal>[]>([])
  const savingDealIds = ref<Set<string>>(new Set())

  function buildKanbanColumns(): KanbanColumnModel<Deal>[] {
    const list = deals.value
    const uniqueDeals: Deal[] = []
    const seenIds = new Set<string>()
    for (const d of list) {
      if (seenIds.has(d.id)) continue
      seenIds.add(d.id)
      uniqueDeals.push(d)
    }

    const pipeline = currentPipeline.value
    if (!pipeline) return []
    const stages = pipeline.stages ?? []
    return stages
      .sort((a, b) => a.order - b.order)
      .map((stage) => {
        const stageDeals = uniqueDeals.filter((d) => d.stageId === stage.id)
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

  function syncKanbanColumnsInPlace() {
    const list = deals.value
    const uniqueDeals: Deal[] = []
    const seenIds = new Set<string>()
    for (const d of list) {
      if (seenIds.has(d.id)) continue
      seenIds.add(d.id)
      uniqueDeals.push(d)
    }

    const pipeline = currentPipeline.value
    if (!pipeline) {
      kanbanColumns.value = []
      return
    }
    const stages = [...(pipeline.stages ?? [])].sort((a, b) => a.order - b.order)
    const current = kanbanColumns.value
    const stageIds = stages.map((s) => s.id)

    if (current.length === stageIds.length && current.every((col, i) => col.id === stageIds[i])) {
      for (let i = 0; i < stages.length; i++) {
        const stage = stages[i]
        const stageDeals = uniqueDeals.filter((d) => d.stageId === stage.id)
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
    () => syncKanbanColumnsInPlace(),
    { immediate: true },
  )

  function setKanbanColumnsFromBoard(_v: KanbanColumnModel<Deal>[]) {
    // no-op: колонки только из syncKanbanColumnsInPlace и handleDealMove
  }

  async function handleDealMove(payload: { item: unknown; toColumnId?: string }) {
    const deal = payload.item as Deal
    const toId = payload.toColumnId
    if (!toId || !deal?.id) return
    savingDealIds.value = new Set(savingDealIds.value).add(deal.id)
    const prevStageId = deal.stageId

    mergeDealInList(deal.id, { stageId: toId })
    kanbanColumns.value = buildKanbanColumns()
    try {
      await updateDeal(deal.id, { stageId: toId }, { skipRefetch: true })
      const updated = await dealService.getById(workspaceId.value, deal.id)
      mergeDealInList(deal.id, { updatedAt: updated.updatedAt })
    } catch {
      mergeDealInList(deal.id, { stageId: prevStageId })
      kanbanColumns.value = buildKanbanColumns()
    } finally {
      const next = new Set(savingDealIds.value)
      next.delete(deal.id)
      savingDealIds.value = next
    }
  }

  return {
    kanbanColumns,
    setKanbanColumnsFromBoard,
    savingDealIds,
    handleDealMove,
  }
}
