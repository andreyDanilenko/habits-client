import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/entities/user'
import { useModal } from '@/shared/lib/modal'
import { useCompaniesCrud } from '@/features/companies'
import { useContactsCrud } from '@/features/contacts'
import { ConfirmModal } from '@/shared/ui'
import DealFormModal from '../ui/DealFormModal.vue'
import { ContactFormModal } from '@/features/contacts'
import { CompanyFormModal } from '@/features/companies'
import type { Deal, CreateDealDto, Pipeline } from '@/entities/deal'
import type { Contact, CreateContactDto } from '@/entities/contact'
import type { Company, CreateCompanyDto } from '@/entities/company'

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

  const { createCompany } = useCompaniesCrud(
    workspaceId,
    () => Promise.resolve(),
  )
  const { createContact } = useContactsCrud(
    workspaceId,
    () => Promise.resolve(),
  )

  const preselectedContactRef = ref<Contact | null>(null)
  const preselectedCompanyRef = ref<Company | null>(null)

  const defaultOwnerId = () => userStore.currentUser?.id ?? '1'

  const openAddDeal = () => {
    preselectedContactRef.value = null
    preselectedCompanyRef.value = null
    return openModal<{ id?: string; data: CreateDealDto }>({
      component: DealFormModal,
      props: {
        isOpen: true,
        deal: null,
        pipelines: pipelines(),
        pipelineId: pipelines().find((p) => p.isDefault)?.id,
        defaultStageId: pipelines().find((p) => p.isDefault)?.stages?.[0]?.id,
        workspaceId: workspaceId(),
        defaultOwnerId: defaultOwnerId(),
        preselectedContact: preselectedContactRef,
        onCreateContact: () =>
          new Promise<Contact | null>((resolve) => {
            preselectedCompanyRef.value = null
            openModal<{ id?: string; data: CreateContactDto }>({
              component: ContactFormModal,
              props: {
                isOpen: true,
                contact: null,
                workspaceId: workspaceId(),
                defaultOwnerId: defaultOwnerId(),
                preselectedCompany: preselectedCompanyRef,
                onCreateCompany: () =>
                  new Promise<Company | null>((resolveCompany) => {
                    openModal<{ id?: string; data: CreateCompanyDto }>({
                      component: CompanyFormModal,
                      props: { isOpen: true, company: null },
                      onConfirm: async (result) => {
                        if (result?.data && workspaceId()) {
                          const company = await createCompany(result.data)
                          preselectedCompanyRef.value = company
                          resolveCompany(company)
                        } else {
                          resolveCompany(null)
                        }
                      },
                      onClose: () => resolveCompany(null),
                    })
                  }),
              },
              onConfirm: async (result) => {
                if (result?.data && workspaceId()) {
                  const contact = await createContact(result.data)
                  preselectedContactRef.value = contact
                  resolve(contact)
                } else {
                  resolve(null)
                }
              },
              onClose: () => resolve(null),
            })
          }),
      },
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
      props: {
        isOpen: true,
        deal,
        pipelines: pipelines(),
        pipelineId: deal.pipelineId,
        defaultStageId: pipelines().find((p) => p.id === deal.pipelineId)?.stages?.[0]?.id,
        workspaceId: workspaceId(),
        defaultOwnerId: defaultOwnerId(),
        preselectedContact: preselectedContactRef,
        onCreateContact: () =>
          new Promise<Contact | null>((resolve) => {
            preselectedCompanyRef.value = null
            openModal<{ id?: string; data: CreateContactDto }>({
              component: ContactFormModal,
              props: {
                isOpen: true,
                contact: null,
                workspaceId: workspaceId(),
                defaultOwnerId: defaultOwnerId(),
                preselectedCompany: preselectedCompanyRef,
                onCreateCompany: () =>
                  new Promise<Company | null>((resolveCompany) => {
                    openModal<{ id?: string; data: CreateCompanyDto }>({
                      component: CompanyFormModal,
                      props: { isOpen: true, company: null },
                      onConfirm: async (result) => {
                        if (result?.data && workspaceId()) {
                          const company = await createCompany(result.data)
                          preselectedCompanyRef.value = company
                          resolveCompany(company)
                        } else {
                          resolveCompany(null)
                        }
                      },
                      onClose: () => resolveCompany(null),
                    })
                  }),
              },
              onConfirm: async (result) => {
                if (result?.data && workspaceId()) {
                  const contact = await createContact(result.data)
                  preselectedContactRef.value = contact
                  resolve(contact)
                } else {
                  resolve(null)
                }
              },
              onClose: () => resolve(null),
            })
          }),
      },
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
