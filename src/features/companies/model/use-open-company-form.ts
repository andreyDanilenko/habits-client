import type { Ref } from 'vue'
import { useModal } from '@/shared/lib/modal'
import CompanyFormModal from '../ui/CompanyFormModal.vue'
import type { Company, CreateCompanyDto } from '@/entities/company'

export function useOpenCompanyForm() {
  const { openModal } = useModal()

  return function openCompanyForm(params: {
    workspaceId: string
    createCompany: (data: CreateCompanyDto) => Promise<Company>
    preselectedCompanyRef: Ref<Company | null>
  }): Promise<Company | null> {
    return new Promise((resolve) => {
      params.preselectedCompanyRef.value = null
      openModal<{ id?: string; data: CreateCompanyDto }>({
        component: CompanyFormModal,
        props: { isOpen: true, company: null },
        fullscreenOnMobile: true,
        contentClass: 'lg:max-w-[min(52rem,calc(100vw-2rem))]',
        onConfirm: async (result) => {
          if (result?.data && params.workspaceId) {
            const company = await params.createCompany(result.data)
            params.preselectedCompanyRef.value = company
            resolve(company)
          } else {
            resolve(null)
          }
        },
        onClose: () => resolve(null),
      })
    })
  }
}
