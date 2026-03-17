import { useRouter } from 'vue-router'
import { useModal } from '@/shared/lib/modal'
import { ConfirmModal } from '@/shared/ui'
import CompanyFormModal from '../ui/CompanyFormModal.vue'
import type { Company, CreateCompanyDto } from '@/entities/company'

interface UseCompanyActionsParams {
  createCompany: (data: CreateCompanyDto) => Promise<Company>
  updateCompany: (id: string, data: CreateCompanyDto) => Promise<Company>
  deleteCompany: (id: string) => Promise<void>
  onSuccess?: () => void | Promise<void>
}

export function useCompanyActions({
  createCompany,
  updateCompany,
  deleteCompany,
  onSuccess,
}: UseCompanyActionsParams) {
  const router = useRouter()
  const { openModal } = useModal()

  const openAddCompany = () => {
    return openModal<{ id?: string; data: CreateCompanyDto }>({
      component: CompanyFormModal,
      props: { isOpen: true, company: null },
      fullscreenOnMobile: true,
      contentClass: 'lg:max-w-[min(52rem,calc(100vw-2rem))]',
      onConfirm: async (result) => {
        if (result?.data) {
          if (result.id) {
            await updateCompany(result.id, result.data)
          } else {
            await createCompany(result.data)
          }
          await onSuccess?.()
        }
      },
    })
  }

  const openEditCompany = (company: Company) => {
    return openModal<{ id?: string; data: CreateCompanyDto }>({
      component: CompanyFormModal,
      props: { isOpen: true, company },
      fullscreenOnMobile: true,
      contentClass: 'lg:max-w-[min(52rem,calc(100vw-2rem))]',
      onConfirm: async (result) => {
        if (result?.id && result?.data) {
          await updateCompany(result.id, result.data)
          await onSuccess?.()
        }
      },
    })
  }

  const openDeleteConfirm = (company: Company) => {
    return openModal<boolean>({
      component: ConfirmModal,
      props: {
        title: 'Удалить компанию?',
        message: 'Компания будет удалена без возможности восстановления.',
        confirmText: 'Удалить',
        confirmVariant: 'danger',
      },
      onConfirm: async () => {
        await deleteCompany(company.id)
        await onSuccess?.()
      },
    })
  }

  const goToCompany = (company: Company) => {
    router.push({ name: 'CrmCompanyDetail', params: { id: company.id } })
  }

  const goToContactsByCompany = (company: Company) => {
    router.push({ path: '/crm/contacts', query: { companyId: company.id } })
  }

  return {
    openAddCompany,
    openEditCompany,
    openDeleteConfirm,
    goToCompany,
    goToContactsByCompany,
  }
}
