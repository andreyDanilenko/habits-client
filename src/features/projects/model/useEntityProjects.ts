import { ref, computed, watch, type Ref } from 'vue'
import { projectService } from '@/entities/project'
import type { Project, ProjectEntityType } from '@/entities/project'

/**
 * Составной слой для отображения и управления проектами сущности (контакт, компания, сделка).
 * Используется во вкладке «Проекты» карточек CRM.
 */
export function useEntityProjects(
  workspaceId: Ref<string>,
  entityType: Ref<ProjectEntityType> | ProjectEntityType,
  entityId: Ref<string> | string,
) {
  const getWorkspaceId = () => (typeof workspaceId === 'object' ? workspaceId.value : workspaceId)
  const getEntityType = () => (typeof entityType === 'object' ? entityType.value : entityType)
  const getEntityId = () => (typeof entityId === 'object' ? entityId.value : entityId)

  const projectIds = ref<string[]>([])
  const allProjects = ref<Project[]>([])
  const loading = ref(false)
  const loadingList = ref(false)
  const error = ref<string | null>(null)

  const entityProjects = computed<Project[]>(() => {
    const ids = new Set(projectIds.value)
    return allProjects.value.filter((p) => ids.has(p.id))
  })

  const availableToAdd = computed<Project[]>(() => {
    const ids = new Set(projectIds.value)
    return allProjects.value.filter((p) => !ids.has(p.id))
  })

  async function fetchProjectIds() {
    const ws = getWorkspaceId()
    const type = getEntityType()
    const id = getEntityId()
    if (!ws || !id) {
      projectIds.value = []
      return
    }
    loading.value = true
    error.value = null
    try {
      projectIds.value = await projectService.getProjectIdsForEntity(ws, type, id)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Не удалось загрузить проекты'
      projectIds.value = []
    } finally {
      loading.value = false
    }
  }

  async function fetchAllProjects() {
    const ws = getWorkspaceId()
    if (!ws) {
      allProjects.value = []
      return
    }
    loadingList.value = true
    try {
      allProjects.value = await projectService.getList(ws)
    } catch {
      allProjects.value = []
    } finally {
      loadingList.value = false
    }
  }

  async function fetch() {
    await Promise.all([fetchProjectIds(), fetchAllProjects()])
  }

  async function addToProjects(selectedProjectIds: string[]) {
    const ws = getWorkspaceId()
    const type = getEntityType()
    const id = getEntityId()
    if (!ws || !id || !selectedProjectIds.length) return
    error.value = null
    try {
      for (const projectId of selectedProjectIds) {
        await projectService.attachEntity(ws, projectId, { entityType: type, entityId: id })
      }
      await fetchProjectIds()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Не удалось добавить в проект'
    }
  }

  async function removeFromProject(projectId: string) {
    const ws = getWorkspaceId()
    const type = getEntityType()
    const id = getEntityId()
    if (!ws || !id) return
    error.value = null
    try {
      await projectService.detachEntity(ws, projectId, type, id)
      await fetchProjectIds()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Не удалось удалить из проекта'
    }
  }

  watch(
    [workspaceId, entityId],
    () => {
      fetch()
    },
    { immediate: true },
  )

  return {
    entityProjects,
    availableToAdd,
    projectIds,
    allProjects,
    loading,
    loadingList,
    error,
    fetch,
    addToProjects,
    removeFromProject,
  }
}
