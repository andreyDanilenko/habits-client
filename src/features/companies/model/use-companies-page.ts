import { ref, watch, computed } from 'vue'
import { useWorkspaceStore } from '@/entities/workspace'
import { companyService } from '@/entities/company'
import type { Company, CreateCompanyDto, UpdateCompanyDto } from '@/entities/company'
import { useCompaniesTableState } from './use-companies-table-state'

export function useCompaniesPage() {
  const workspaceStore = useWorkspaceStore()
  const tableState = useCompaniesTableState()

  const searchQuery = ref('')
  const companies = ref<Company[]>([])
  const total = ref(0)
  const isLoading = ref(false)
  const isError = ref(false)

  const workspaceId = computed(() => workspaceStore.currentWorkspace?.id ?? '')

  const fetchCompanies = async () => {
    if (!workspaceId.value) {
      companies.value = []
      total.value = 0
      return
    }
    isLoading.value = true
    isError.value = false
    try {
      const res = await companyService.getList({
        workspaceId: workspaceId.value,
        search: searchQuery.value || undefined,
        page: tableState.page.value,
        limit: tableState.pageSize.value,
        sortBy: tableState.sortBy.value ?? undefined,
        sortOrder: tableState.sortOrder.value,
      })
      companies.value = res.companies
      total.value = res.total
    } catch {
      isError.value = true
      companies.value = []
      total.value = 0
    } finally {
      isLoading.value = false
    }
  }

  watch(
    [
      () => workspaceId.value,
      searchQuery,
      () => tableState.page.value,
      () => tableState.pageSize.value,
      () => tableState.sortBy.value,
      () => tableState.sortOrder.value,
    ],
    fetchCompanies,
    { immediate: true },
  )

  const createCompany = async (data: CreateCompanyDto): Promise<Company> => {
    if (!workspaceId.value) throw new Error('Workspace not selected')
    const company = await companyService.create(workspaceId.value, data)
    await fetchCompanies()
    return company
  }

  const updateCompany = async (id: string, data: UpdateCompanyDto): Promise<Company> => {
    if (!workspaceId.value) throw new Error('Workspace not selected')
    const company = await companyService.update(workspaceId.value, id, data)
    await fetchCompanies()
    return company
  }

  const deleteCompany = async (id: string): Promise<void> => {
    if (!workspaceId.value) throw new Error('Workspace not selected')
    await companyService.delete(workspaceId.value, id)
    tableState.clearSelection()
    await fetchCompanies()
  }

  return {
    ...tableState,
    searchQuery,
    companies,
    total,
    isLoading,
    isError,
    fetchCompanies,
    createCompany,
    updateCompany,
    deleteCompany,
  }
}
