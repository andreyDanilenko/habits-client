import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { workspaceService } from '@/entities/workspace'
import type { Workspace, CreateWorkspaceDto } from '@/entities/workspace'

export const useWorkspaceStore = defineStore('workspace', () => {
  // State
  const workspaces = ref<Workspace[]>([])
  const currentWorkspace = ref<Workspace | null>(null)
  const isLoading = ref(false)

  // Getters
  const hasWorkspaces = computed(() => workspaces.value.length > 0)

  // Actions
  const fetchWorkspaces = async () => {
    isLoading.value = true
    try {
      const data = await workspaceService.getWorkspaces()
      workspaces.value = data
      if (data.length > 0 && !currentWorkspace.value) {
        currentWorkspace.value = data[0]
      }
    } catch (error) {
      console.error('Failed to fetch workspaces:', error)
    } finally {
      isLoading.value = false
    }
  }

  const createWorkspace = async (data: CreateWorkspaceDto): Promise<Workspace> => {
    try {
      const workspace = await workspaceService.createWorkspace(data)
      workspaces.value.push(workspace)
      if (!currentWorkspace.value) {
        currentWorkspace.value = workspace
      }
      return workspace
    } catch (error) {
      console.error('Failed to create workspace:', error)
      throw error
    }
  }

  const setCurrentWorkspace = (workspace: Workspace) => {
    currentWorkspace.value = workspace
  }

  const clearWorkspaces = () => {
    workspaces.value = []
    currentWorkspace.value = null
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
    clearWorkspaces,
  }
})
