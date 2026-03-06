import { useCompaniesPage } from './use-companies-page'
import { useCompanyActions } from './use-company-actions'

export function useCompaniesPageActions() {
  const page = useCompaniesPage()

  const actions = useCompanyActions({
    createCompany: page.createCompany,
    updateCompany: page.updateCompany,
    deleteCompany: page.deleteCompany,
    onSuccess: page.fetchCompanies,
  })

  return {
    ...page,
    openCreateModal: actions.openAddCompany,
    openEditModal: actions.openEditCompany,
    confirmDelete: actions.openDeleteConfirm,
    goToCompany: actions.goToCompany,
    goToContactsByCompany: actions.goToContactsByCompany,
  }
}
