import { dealService } from '@/entities/deal'
import type { CreateDealDto, UpdateDealDto } from '@/entities/deal'
import type { Deal } from '@/entities/deal'

const noop = () => {}
const noopAsync = async () => {}

export function useDealsCrud(
  getWorkspaceId: () => string,
  fetchDeals: () => Promise<void> = noopAsync,
  clearSelection: () => void = noop,
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

  const getDealsList = async (
    workspaceId: string,
    params?: { page?: number; limit?: number; contactId?: string },
  ): Promise<Deal[]> => {
    const res = await dealService.getList({
      workspaceId,
      page: params?.page ?? 1,
      limit: params?.limit ?? 50,
      contactId: params?.contactId,
    })
    return res.deals ?? []
  }

  return {
    createDeal,
    updateDeal,
    deleteDeal,
    getDealsList,
  }
}
