import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/entities/user'
import { useModal } from '@/shared/lib/modal'
import { useCompaniesCrud } from '@/features/companies'
import { useContactsCrud } from '@/features/contacts'
import { useOpenCompanyForm } from '@/features/companies'
import { useOpenContactForm } from '@/features/contacts'
import { ConfirmModal } from '@/shared/ui'
import DealFormModal from '../ui/DealFormModal.vue'
import type { Deal, CreateDealDto, Pipeline } from '@/entities/deal'
import type { Contact } from '@/entities/contact'
import type { Company } from '@/entities/company'

interface UseDealActionsParams {
  workspaceId: () => string
  pipelines: () => Pipeline[]
  createDeal: (data: CreateDealDto) => Promise<Deal>
  updateDeal: (id: string, data: CreateDealDto) => Promise<Deal>
  deleteDeal: (id: string) => Promise<void>
  onSuccess?: () => void | Promise<void>
}

export function useDealActions({
  workspaceId,
  pipelines,
  createDeal,
  updateDeal,
  deleteDeal,
  onSuccess,
}: UseDealActionsParams) {
  const router = useRouter()
  const userStore = useUserStore()
  const { openModal } = useModal()

  const { createCompany } = useCompaniesCrud(workspaceId, () => Promise.resolve())
  const { createContact } = useContactsCrud(workspaceId, () => Promise.resolve())

  const openCompanyForm = useOpenCompanyForm()
  const openContactFormForCreate = useOpenContactForm({
    workspaceId,
    defaultOwnerId: () => userStore.currentUser?.id ?? '1',
    createContact,
    createCompany,
    openCompanyForm,
  })

  const preselectedContactRef = ref<Contact | null>(null)
  const preselectedCompanyRef = ref<Company | null>(null)

  const defaultOwnerId = () => userStore.currentUser?.id ?? '1'

  const getDealFormProps = (deal: Deal | null) => ({
    isOpen: true,
    deal,
    pipelines: pipelines(),
    pipelineId: deal ? deal.pipelineId : pipelines().find((p) => p.isDefault)?.id,
    defaultStageId: deal
      ? pipelines().find((p) => p.id === deal.pipelineId)?.stages?.[0]?.id
      : pipelines().find((p) => p.isDefault)?.stages?.[0]?.id,
    workspaceId: workspaceId(),
    defaultOwnerId: defaultOwnerId(),
    preselectedContact: preselectedContactRef,
    onCreateContact: () =>
      openContactFormForCreate({
        preselectedCompanyRef,
        onContactCreated: (contact: Contact | null) => {
          preselectedContactRef.value = contact
        },
      }),
  })

  const openAddDeal = () => {
    preselectedContactRef.value = null
    preselectedCompanyRef.value = null
    return openModal<{ id?: string; data: CreateDealDto }>({
      component: DealFormModal,
      fullscreenOnMobile: true,
      contentClass: 'lg:max-w-[min(52rem,calc(100vw-2rem))]',
      props: getDealFormProps(null),
      onConfirm: async (result) => {
        if (result?.data) {
          if (result.id) {
            await updateDeal(result.id, result.data)
          } else {
            await createDeal(result.data)
          }
          await onSuccess?.()
        }
      },
    })
  }

  const openEditDeal = (deal: Deal) => {
    preselectedContactRef.value = null
    preselectedCompanyRef.value = null
    return openModal<{ id?: string; data: CreateDealDto }>({
      component: DealFormModal,
      fullscreenOnMobile: true,
      contentClass: 'lg:max-w-[min(52rem,calc(100vw-2rem))]',
      props: getDealFormProps(deal),
      onConfirm: async (result) => {
        if (result?.id && result?.data) {
          await updateDeal(result.id, result.data)
          await onSuccess?.()
        }
      },
    })
  }

  const openDeleteConfirm = (deal: Deal) => {
    return openModal<boolean>({
      component: ConfirmModal,
      props: {
        title: 'Удалить сделку?',
        message: 'Сделка будет удалена без возможности восстановления.',
        confirmText: 'Удалить',
        confirmVariant: 'danger',
      },
      onConfirm: async () => {
        await deleteDeal(deal.id)
        await onSuccess?.()
      },
    })
  }

  const openDealCard = (deal: Deal) => {
    router.push({ name: 'CrmDealDetail', params: { id: deal.id } })
  }

  return {
    openAddDeal,
    openEditDeal,
    openDeleteConfirm,
    openDealCard,
  }
}
