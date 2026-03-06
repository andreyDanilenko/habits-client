import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useModal } from '@/shared/lib/modal'
import { ConfirmModal } from '@/shared/ui'
import ContactFormModal from '../ui/ContactFormModal.vue'
import ContactQuickViewModal from '../ui/ContactQuickViewModal.vue'
import { CompanyFormModal } from '@/features/companies'
import DealsAttachContactModal from '@/features/deals/ui/DealsAttachContactModal.vue'
import type { Contact, CreateContactDto } from '@/entities/contact'
import type { Company, CreateCompanyDto } from '@/entities/company'

interface UseContactActionsParams {
  workspaceId: () => string
  defaultOwnerId: () => string
  createContact: (data: CreateContactDto) => Promise<unknown>
  updateContact: (id: string, data: CreateContactDto) => Promise<unknown>
  deleteContact: (id: string) => Promise<void>
  createCompany: (data: CreateCompanyDto) => Promise<Company>
  onSuccess?: () => void | Promise<void>
}

export function useContactActions({
  workspaceId,
  defaultOwnerId,
  createContact,
  updateContact,
  deleteContact,
  createCompany,
  onSuccess,
}: UseContactActionsParams) {
  const router = useRouter()
  const { openModal } = useModal()
  const preselectedCompanyRef = ref<Company | null>(null)

  const openAddContact = () => {
    preselectedCompanyRef.value = null
    return openModal<{ id?: string; data: CreateContactDto }>({
      component: ContactFormModal,
      props: {
        isOpen: true,
        contact: null,
        workspaceId: workspaceId(),
        defaultOwnerId: defaultOwnerId(),
        preselectedCompany: preselectedCompanyRef,
        onCreateCompany: () =>
          new Promise<Company | null>((resolve) => {
            openModal<{ id?: string; data: CreateCompanyDto }>({
              component: CompanyFormModal,
              props: { isOpen: true, company: null },
              onConfirm: async (result) => {
                if (result?.data && workspaceId()) {
                  const company = await createCompany(result.data)
                  preselectedCompanyRef.value = company
                  resolve(company)
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
            await updateContact(result.id, result.data)
          } else {
            await createContact(result.data)
          }
          await onSuccess?.()
        }
      },
    })
  }

  const openEditContact = (contact: Contact) => {
    preselectedCompanyRef.value = null
    return openModal<{ id?: string; data: CreateContactDto }>({
      component: ContactFormModal,
      props: {
        isOpen: true,
        contact,
        workspaceId: workspaceId(),
        defaultOwnerId: defaultOwnerId(),
        preselectedCompany: preselectedCompanyRef,
        onCreateCompany: () =>
          new Promise<Company | null>((resolve) => {
            openModal<{ id?: string; data: CreateCompanyDto }>({
              component: CompanyFormModal,
              props: { isOpen: true, company: null },
              onConfirm: async (result) => {
                if (result?.data && workspaceId()) {
                  const company = await createCompany(result.data)
                  preselectedCompanyRef.value = company
                  resolve(company)
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
          await updateContact(result.id, result.data)
          await onSuccess?.()
        }
      },
    })
  }

  const openDeleteConfirm = (contact: Contact) => {
    return openModal<boolean>({
      component: ConfirmModal,
      props: {
        title: 'Удалить контакт?',
        message: 'Контакт будет удалён без возможности восстановления.',
        confirmText: 'Удалить',
        confirmVariant: 'danger',
      },
      onConfirm: async () => {
        await deleteContact(contact.id)
        await onSuccess?.()
      },
    })
  }

  const openQuickView = (contact: Contact) => {
    return openModal({
      component: ContactQuickViewModal,
      props: {
        contact,
        onEdit: (c: Contact) => openEditContact(c),
        onOpenCard: (c: Contact) => {
          router.push(`/crm/contacts/${c.id}`)
        },
        onCreateDeal: (c: Contact) => openAttachToDeal(c),
      },
    })
  }

  const openAttachToDeal = (contact: Contact) => {
    return openModal({
      component: DealsAttachContactModal,
      props: {
        isOpen: true,
        workspaceId: workspaceId(),
        contact,
      },
      onConfirm: async () => {
        await onSuccess?.()
      },
    })
  }

  return {
    openAddContact,
    openEditContact,
    openDeleteConfirm,
    openQuickView,
    openAttachToDeal,
  }
}
