import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '@/shared/api'
import { workspaceService } from '@/entities/workspace'
import type {
  Workspace,
  CreateWorkspaceDto,
  UpdateWorkspaceDto,
  WorkspaceModule,
} from '@/entities/workspace'

function applyWorkspaceHeader(ws: Workspace | null) {
  api.setWorkspaceId(ws?.id ?? null)
}

export const useWorkspaceStore = defineStore('workspace', () => {
  const workspaces = ref<Workspace[]>([])
  const currentWorkspace = ref<Workspace | null>(null)
  const modules = ref<WorkspaceModule[]>([])
  const isLoading = ref(false)

  const hasWorkspaces = computed(() => workspaces.value.length > 0)

  const enabledModules = computed(() => {
    return modules.value.filter((m) => m.enabled).map((m) => m.moduleName)
  })

  const fetchWorkspaces = async () => {
    isLoading.value = true
    try {
      const list = await workspaceService.getWorkspaces()
      workspaces.value = list

      const current = await workspaceService.getCurrentWorkspace()
      if (current) {
        currentWorkspace.value = current
        applyWorkspaceHeader(current)
        await loadModules(current.id)
        return
      }
      if (list.length > 0) {
        await switchWorkspace(list[0].id)
      }
    } catch (error) {
      console.error('Failed to fetch workspaces:', error)
    } finally {
      isLoading.value = false
    }
  }

  const createWorkspace = async (data: CreateWorkspaceDto): Promise<Workspace> => {
    const workspace = await workspaceService.createWorkspace(data)
    workspaces.value.push(workspace)
    if (!currentWorkspace.value) {
      currentWorkspace.value = workspace
      applyWorkspaceHeader(workspace)
    }
    return workspace
  }

  const updateWorkspace = async (
    workspaceId: string,
    data: UpdateWorkspaceDto,
  ): Promise<Workspace> => {
    const workspace = await workspaceService.updateWorkspace(workspaceId, data)
    const index = workspaces.value.findIndex((w) => w.id === workspaceId)
    if (index !== -1) {
      workspaces.value[index] = workspace
    }
    if (currentWorkspace.value?.id === workspaceId) {
      currentWorkspace.value = workspace
    }
    return workspace
  }

  const deleteWorkspace = async (workspaceId: string): Promise<void> => {
    await workspaceService.deleteWorkspace(workspaceId)
    workspaces.value = workspaces.value.filter((w) => w.id !== workspaceId)
    if (currentWorkspace.value?.id === workspaceId) {
      if (workspaces.value.length > 0) {
        await switchWorkspace(workspaces.value[0].id)
      } else {
        currentWorkspace.value = null
        applyWorkspaceHeader(null)
      }
    }
  }

  const setCurrentWorkspace = (workspace: Workspace) => {
    currentWorkspace.value = workspace
    applyWorkspaceHeader(workspace)
  }

  const loadModules = async (workspaceId: string) => {
    try {
      const response = await workspaceService.getWorkspaceModules(workspaceId)
      // API возвращает { modules: WorkspaceModule[] }
      modules.value = response?.modules || []
    } catch (error) {
      console.error('Failed to load modules:', error)
      modules.value = []
    }
  }

  const switchWorkspace = async (workspaceId: string) => {
    await workspaceService.switchWorkspace(workspaceId)
    const workspace = workspaces.value.find((w) => w.id === workspaceId)
    if (workspace) {
      currentWorkspace.value = workspace
      applyWorkspaceHeader(workspace)

      // Загружаем модули для нового workspace
      await loadModules(workspaceId)

      // Перезагружаем данные модулей (привычки, журнал и т.д.)
      // Импортируем динамически, чтобы избежать циклических зависимостей
      const { useHabitStore } = await import('@/entities/habit')
      const habitStore = useHabitStore()
      await habitStore.fetchHabits()
    }
  }

  const addWorkspace = (workspace: Workspace) => {
    if (!workspaces.value.find((w) => w.id === workspace.id)) {
      workspaces.value.push(workspace)
    }
  }

  const clearWorkspaces = () => {
    workspaces.value = []
    currentWorkspace.value = null
    applyWorkspaceHeader(null)
  }

  return {
    // State
    workspaces,
    currentWorkspace,
    modules,
    isLoading,

    // Getters
    hasWorkspaces,
    enabledModules,

    // Actions
    fetchWorkspaces,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
    setCurrentWorkspace,
    switchWorkspace,
    loadModules,
    addWorkspace,
    clearWorkspaces,
  }
})
