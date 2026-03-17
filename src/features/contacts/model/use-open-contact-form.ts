import type { Ref } from 'vue'
import { useModal } from '@/shared/lib/modal'
import ContactFormModal from '../ui/ContactFormModal.vue'
import type { Contact, CreateContactDto } from '@/entities/contact'
import type { Company, CreateCompanyDto } from '@/entities/company'

type OpenCompanyFormFn = (params: {
  workspaceId: string
  createCompany: (data: CreateCompanyDto) => Promise<Company>
  preselectedCompanyRef: Ref<Company | null>
}) => Promise<Company | null>

interface UseOpenContactFormParams {
  workspaceId: () => string
  defaultOwnerId: () => string
  createContact: (data: CreateContactDto) => Promise<Contact>
  createCompany: (data: CreateCompanyDto) => Promise<Company>
  openCompanyForm: OpenCompanyFormFn
}

export function useOpenContactForm({
  workspaceId,
  defaultOwnerId,
  createContact,
  createCompany,
  openCompanyForm,
}: UseOpenContactFormParams) {
  const { openModal } = useModal()

  return function openContactFormForCreate(params: {
    preselectedCompanyRef: Ref<Company | null>
    onContactCreated?: (contact: Contact | null) => void
  }): Promise<Contact | null> {
    return new Promise((resolve) => {
      params.preselectedCompanyRef.value = null
      openModal<{ id?: string; data: CreateContactDto }>({
        component: ContactFormModal,
        fullscreenOnMobile: true,
        contentClass: 'lg:max-w-[min(40rem,calc(100vw-2rem))]',
        props: {
          isOpen: true,
          contact: null,
          workspaceId: workspaceId(),
          defaultOwnerId: defaultOwnerId(),
          preselectedCompany: params.preselectedCompanyRef,
          onCreateCompany: () =>
            openCompanyForm({
              workspaceId: workspaceId(),
              createCompany,
              preselectedCompanyRef: params.preselectedCompanyRef,
            }),
        },
        onConfirm: async (result) => {
          if (result?.data && workspaceId()) {
            const contact = await createContact(result.data)
            params.onContactCreated?.(contact)
            resolve(contact)
          } else {
            resolve(null)
          }
        },
        onClose: () => resolve(null),
      })
    })
  }
}
