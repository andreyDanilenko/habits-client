import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useModal } from '@/shared/lib/modal'
import { useOpenCompanyForm } from '@/features/companies'
import { ConfirmModal } from '@/shared/ui'
import ContactFormModal from '../ui/ContactFormModal.vue'
import ContactQuickViewModal from '../ui/ContactQuickViewModal.vue'
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
  const openCompanyForm = useOpenCompanyForm()
  const preselectedCompanyRef = ref<Company | null>(null)

  const getContactFormProps = (contact: Contact | null) => ({
    isOpen: true,
    contact,
    workspaceId: workspaceId(),
    defaultOwnerId: defaultOwnerId(),
    preselectedCompany: preselectedCompanyRef,
    onCreateCompany: () =>
      openCompanyForm({
        workspaceId: workspaceId(),
        createCompany,
        preselectedCompanyRef,
      }),
  })

  const openAddContact = () => {
    preselectedCompanyRef.value = null
    return openModal<{ id?: string; data: CreateContactDto }>({
      component: ContactFormModal,
      props: getContactFormProps(null),
      fullscreenOnMobile: true,
      contentClass: 'lg:max-w-[min(40rem,calc(100vw-2rem))]',
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
      props: getContactFormProps(contact),
      fullscreenOnMobile: true,
      contentClass: 'lg:max-w-[min(40rem,calc(100vw-2rem))]',
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
      fullscreenOnMobile: true,
      contentClass: 'lg:max-w-[min(40rem,calc(100vw-2rem))]',
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
      fullscreenOnMobile: true,
      contentClass: 'lg:max-w-[min(40rem,calc(100vw-2rem))]',
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
