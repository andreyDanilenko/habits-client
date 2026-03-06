import { companyService } from '@/entities/company'
import type { Company, CreateCompanyDto, UpdateCompanyDto } from '@/entities/company'

const noop = () => {}
const noopAsync = async () => {}

export function useCompaniesCrud(
  getWorkspaceId: () => string,
  fetchCompanies: () => Promise<void> = noopAsync,
  clearSelection: () => void = noop,
) {
  const createCompany = async (data: CreateCompanyDto): Promise<Company> => {
    const workspaceId = getWorkspaceId()
    if (!workspaceId) throw new Error('Workspace not selected')
    const company = await companyService.create(workspaceId, data)
    await fetchCompanies()
    return company
  }

  const updateCompany = async (id: string, data: UpdateCompanyDto): Promise<Company> => {
    const workspaceId = getWorkspaceId()
    if (!workspaceId) throw new Error('Workspace not selected')
    const company = await companyService.update(workspaceId, id, data)
    await fetchCompanies()
    return company
  }

  const deleteCompany = async (id: string): Promise<void> => {
    const workspaceId = getWorkspaceId()
    if (!workspaceId) throw new Error('Workspace not selected')
    await companyService.delete(workspaceId, id)
    clearSelection()
    await fetchCompanies()
  }

  return {
    createCompany,
    updateCompany,
    deleteCompany,
  }
}
