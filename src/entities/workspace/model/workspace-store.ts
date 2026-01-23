import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '@/shared/api'
import { workspaceService } from '@/entities/workspace'
import type { Workspace, CreateWorkspaceDto } from '@/entities/workspace'

function applyWorkspaceHeader(ws: Workspace | null) {
  api.setWorkspaceId(ws?.id ?? null)
}

export const useWorkspaceStore = defineStore('workspace', () => {
  const workspaces = ref<Workspace[]>([])
  const currentWorkspace = ref<Workspace | null>(null)
  const isLoading = ref(false)

  const hasWorkspaces = computed(() => workspaces.value.length > 0)

  const fetchWorkspaces = async () => {
    isLoading.value = true
    try {
      const list = await workspaceService.getWorkspaces()
      workspaces.value = list

      const current = await workspaceService.getCurrentWorkspace()
      if (current) {
        currentWorkspace.value = current
        applyWorkspaceHeader(current)
        return
      }
      if (list.length > 0) {
        await workspaceService.switchWorkspace(list[0].id)
        currentWorkspace.value = list[0]
        applyWorkspaceHeader(list[0])
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

  const setCurrentWorkspace = (workspace: Workspace) => {
    currentWorkspace.value = workspace
    applyWorkspaceHeader(workspace)
  }

  const switchWorkspace = async (workspaceId: string) => {
    await workspaceService.switchWorkspace(workspaceId)
    const workspace = workspaces.value.find((w) => w.id === workspaceId)
    if (workspace) {
      currentWorkspace.value = workspace
      applyWorkspaceHeader(workspace)
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
    isLoading,

    // Getters
    hasWorkspaces,

    // Actions
    fetchWorkspaces,
    createWorkspace,
    setCurrentWorkspace,
    switchWorkspace,
    addWorkspace,
    clearWorkspaces,
  }
})
