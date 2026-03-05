import { dealService } from '@/entities/deal'
import type { CreateDealDto, UpdateDealDto } from '@/entities/deal'

export function useDealsCrud(
  getWorkspaceId: () => string,
  fetchDeals: () => Promise<void>,
  clearSelection: () => void,
) {
  const createDeal = async (data: CreateDealDto) => {
    const workspaceId = getWorkspaceId()
    if (!workspaceId) throw new Error('Workspace not selected')
    const deal = await dealService.create(workspaceId, data)
    await fetchDeals()
    return deal
  }

  const updateDeal = async (
    id: string,
    data: UpdateDealDto,
    options?: { skipRefetch?: boolean },
  ) => {
    const workspaceId = getWorkspaceId()
    if (!workspaceId) throw new Error('Workspace not selected')
    const deal = await dealService.update(workspaceId, id, data)
    if (!options?.skipRefetch) {
      await fetchDeals()
    }
    return deal
  }

  const deleteDeal = async (id: string) => {
    const workspaceId = getWorkspaceId()
    if (!workspaceId) throw new Error('Workspace not selected')
    await dealService.delete(workspaceId, id)
    clearSelection()
    await fetchDeals()
  }

  return {
    createDeal,
    updateDeal,
    deleteDeal,
  }
}
