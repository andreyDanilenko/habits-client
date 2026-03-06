import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useModal } from '@/shared/lib/modal'
import { ConfirmModal } from '@/shared/ui'
import { useWorkspaceStore, usePermissions } from '@/entities/workspace'

export const useWorkspaceSettingsPage = () => {
  const router = useRouter()
  const workspaceStore = useWorkspaceStore()
  const { isOwner, isAdmin } = usePermissions()
  const canEditWorkspace = computed(() => isOwner.value || isAdmin.value)
  const { openModal } = useModal()

  const isSaving = ref(false)
  const isDeleting = ref(false)

  const workspaceData = reactive({
    name: '',
    description: '',
    color: '#6366f1',
  })

  const initializeWorkspaceData = () => {
    if (!workspaceStore.currentWorkspace) {
      router.push('/')
      return
    }

    workspaceData.name = workspaceStore.currentWorkspace.name
    workspaceData.description = workspaceStore.currentWorkspace.description || ''
    workspaceData.color = workspaceStore.currentWorkspace.color || '#6366f1'
  }

  onMounted(async () => {
    initializeWorkspaceData()
  })

  const saveWorkspace = async () => {
    if (!canEditWorkspace.value || !workspaceStore.currentWorkspace) {
      return
    }

    isSaving.value = true
    try {
      await workspaceStore.updateWorkspace(workspaceStore.currentWorkspace.id, {
        name: workspaceData.name,
        description: workspaceData.description || undefined,
        color: workspaceData.color || undefined,
      })
    } catch (error) {
      console.error('Failed to save workspace:', error)
    } finally {
      isSaving.value = false
    }
  }

  const handleDeleteWorkspace = () => {
    if (!isOwner.value || !workspaceStore.currentWorkspace) {
      return
    }

    return openModal<boolean>({
      component: ConfirmModal,
      props: {
        title: 'Удалить workspace?',
        message: 'Это действие нельзя отменить. Все данные workspace будут безвозвратно удалены.',
        confirmText: 'Удалить',
        confirmVariant: 'danger',
      },
      onConfirm: async () => {
        isDeleting.value = true
        try {
          await workspaceStore.deleteWorkspace(workspaceStore.currentWorkspace!.id)
          router.push('/')
        } catch (error) {
          console.error('Failed to delete workspace:', error)
        } finally {
          isDeleting.value = false
        }
      },
    })
  }

  return {
    // State
    isSaving,
    isDeleting,
    workspaceData,
    isOwner,
    canEditWorkspace,

    // Methods
    saveWorkspace,
    handleDeleteWorkspace,
  }
}
