import { useModal } from '@/shared/lib/modal'
import { dealService } from '@/entities/deal'
import { ConfirmModal } from '@/shared/ui'
import DealFormModal from '../ui/DealFormModal.vue'
import type { Deal, Pipeline, CreateDealDto } from '@/entities/deal'

interface UseDealActionsParams {
  workspaceId: () => string
  defaultOwnerId: () => string
  pipelines: () => Pipeline[]
  onEditSuccess?: () => void | Promise<void>
  onDeleteSuccess?: () => void | Promise<void>
}

export function useDealActions({
  workspaceId,
  defaultOwnerId,
  pipelines,
  onEditSuccess,
  onDeleteSuccess,
}: UseDealActionsParams) {
  const { openModal } = useModal()

  const editDeal = (deal: Deal) => {
    return openModal<{ id?: string; data: CreateDealDto }>({
      component: DealFormModal,
      props: {
        isOpen: true,
        deal,
        pipelines: pipelines(),
        pipelineId: deal.pipelineId,
        defaultStageId: pipelines().find((p) => p.id === deal.pipelineId)?.stages?.[0]?.id,
        workspaceId: workspaceId(),
        defaultOwnerId: defaultOwnerId(),
      },
      onConfirm: async (result?: { id?: string; data: CreateDealDto }) => {
        if (result?.id && workspaceId()) {
          await dealService.update(workspaceId(), result.id, result.data)
          await onEditSuccess?.()
        }
      },
    })
  }

  const deleteDeal = (deal: Deal) => {
    return openModal<boolean>({
      component: ConfirmModal,
      props: {
        title: 'Удалить сделку?',
        message: 'Сделка будет удалена без возможности восстановления.',
        confirmText: 'Удалить',
        confirmVariant: 'danger',
      },
      onConfirm: async () => {
        if (workspaceId()) {
          await dealService.delete(workspaceId(), deal.id)
          await onDeleteSuccess?.()
        }
      },
    })
  }

  return {
    editDeal,
    deleteDeal,
  }
}
