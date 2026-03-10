import { ref } from 'vue'
import { projectService } from '@/entities/project'

export function useProjectCounts(workspaceId: string) {
  const counts = ref<Record<string, { contacts: number; companies: number; deals: number }>>({})
  const isLoading = ref(false)

  const fetchCounts = async (projectIds: string[]) => {
    if (!workspaceId || projectIds.length === 0) return

    isLoading.value = true
    const next: Record<string, { contacts: number; companies: number; deals: number }> = {}

    try {
      /// Убоать этот костыль и добавить метод для получения сущностей в проекте для дешборда проекта
      await Promise.all(
        projectIds.map(async (projectId) => {
          const [contactIds, companyIds, dealIds] = await Promise.all([
            projectService.listEntityIds(workspaceId, projectId, 'crm_contact'),
            projectService.listEntityIds(workspaceId, projectId, 'crm_company'),
            projectService.listEntityIds(workspaceId, projectId, 'crm_deal'),
          ])
          next[projectId] = {
            contacts: contactIds.length,
            companies: companyIds.length,
            deals: dealIds.length,
          }
        }),
      )
      counts.value = next
    } finally {
      isLoading.value = false
    }
  }

  const getCount = (projectId: string, type: 'contacts' | 'companies' | 'deals') => {
    return counts.value[projectId]?.[type] ?? 0
  }

  return {
    counts,
    isLoading: isLoading,
    fetchCounts,
    getCount,
  }
}
