import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useModal } from '@/shared/lib/modal'
import { ConfirmModal } from '@/shared/ui'
import { useWorkspaceStore, usePermissions, workspaceService } from '@/entities/workspace'
import { useTelegramIntegrationLink } from '@/features/workspace/model/use-telegram-integration-link'

export const useWorkspaceSettingsPage = () => {
  const router = useRouter()
  const workspaceStore = useWorkspaceStore()
  const { isOwner, isAdmin } = usePermissions()
  const canEditWorkspace = computed(() => isOwner.value || isAdmin.value)
  const { openModal } = useModal()

  const {
    isConnectingTelegram,
    telegramConnectLink,
    telegramConnectError,
    connectTelegram,
  } = useTelegramIntegrationLink()

  const isSaving = ref(false)
  const isDeleting = ref(false)
  const isUploadingLogo = ref(false)
  const isClearingLogo = ref(false)

  const workspaceData = reactive({
    name: '',
    description: '',
    color: '#6366f1',
    logoScale: 1,
    logoUrl: null as string | null,
  })

  const initializeWorkspaceData = () => {
    if (!workspaceStore.currentWorkspace) {
      router.push('/')
      return
    }

    workspaceData.name = workspaceStore.currentWorkspace.name
    workspaceData.description = workspaceStore.currentWorkspace.description || ''
    workspaceData.color = workspaceStore.currentWorkspace.color || '#6366f1'
    workspaceData.logoScale = workspaceStore.currentWorkspace.logoScale ?? 1
    workspaceData.logoUrl = workspaceStore.currentWorkspace.logoUrl ?? null
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
        logoScale: workspaceData.logoScale ?? undefined,
      })
    } catch (error) {
      console.error('Failed to save workspace:', error)
    } finally {
      isSaving.value = false
    }
  }

  const uploadLogo = async (file: File) => {
    if (!canEditWorkspace.value || !workspaceStore.currentWorkspace) return
    isUploadingLogo.value = true
    try {
      const updated = await workspaceService.uploadWorkspaceLogo(workspaceStore.currentWorkspace.id, file)
      workspaceStore.setCurrentWorkspace(updated)

      const idx = workspaceStore.workspaces.findIndex((w) => w.id === updated.id)
      if (idx !== -1) workspaceStore.workspaces[idx] = updated

      // Лого обновляем сразу, а масштаб остается как у пользователя локально,
      // чтобы не затирать несохраненные изменения ползунка.
      workspaceData.logoUrl = updated.logoUrl ?? null
    } catch (error) {
      console.error('Failed to upload workspace logo:', error)
    } finally {
      isUploadingLogo.value = false
    }
  }

  const clearLogoToSystem = async () => {
    if (!canEditWorkspace.value || !workspaceStore.currentWorkspace) return
    isClearingLogo.value = true
    try {
      const updated = await workspaceService.clearWorkspaceLogo(workspaceStore.currentWorkspace.id)
      workspaceStore.setCurrentWorkspace(updated)

      const idx = workspaceStore.workspaces.findIndex((w) => w.id === updated.id)
      if (idx !== -1) workspaceStore.workspaces[idx] = updated

      workspaceData.logoUrl = updated.logoUrl ?? null
      workspaceData.logoScale = updated.logoScale ?? 1
    } catch (error) {
      console.error('Failed to clear workspace logo:', error)
    } finally {
      isClearingLogo.value = false
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
    isUploadingLogo,
    isClearingLogo,
    isConnectingTelegram,
    telegramConnectLink,
    telegramConnectError,
    workspaceData,
    isOwner,
    canEditWorkspace,

    // Methods
    saveWorkspace,
    uploadLogo,
    clearLogoToSystem,
    connectTelegram,
    handleDeleteWorkspace,
  }
}
