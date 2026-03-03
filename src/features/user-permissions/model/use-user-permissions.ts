import { ref, computed, watch } from 'vue'
import type { Ref } from 'vue'
import { useWorkspaceStore } from '@/entities/workspace'
import { assignmentService } from '@/entities/assignment'
import { permissionService } from '@/entities/permission'
import type { UserPermission } from '@/entities/assignment'
import type { Permission } from '@/entities/permission'

type MaybeRef<T> = T | Ref<T>

export function useUserPermissions(userIdSource: MaybeRef<string>) {
  const workspaceStore = useWorkspaceStore()

  const userPermissions = ref<UserPermission[]>([])
  const catalog = ref<Permission[]>([])

  const isLoading = ref(false)
  const isError = ref(false)

  const workspaceId = computed(() => workspaceStore.currentWorkspace?.id ?? '')
  const userId = computed(() =>
    typeof userIdSource === 'object' ? userIdSource.value : userIdSource,
  )

  const loadCatalog = async () => {
    if (!workspaceId.value) {
      catalog.value = []
      return
    }
    catalog.value = await permissionService.getCatalog(workspaceId.value)
  }

  const loadPermissions = async () => {
    if (!workspaceId.value || !userId.value) {
      userPermissions.value = []
      return
    }
    isLoading.value = true
    isError.value = false
    try {
      userPermissions.value = await assignmentService.getUserPermissions(
        workspaceId.value,
        userId.value,
      )
    } catch {
      isError.value = true
      userPermissions.value = []
    } finally {
      isLoading.value = false
    }
  }

  const grantPermission = async (permissionId: string, expiresAt?: string) => {
    if (!workspaceId.value || !userId.value) return
    await assignmentService.grantPermission(workspaceId.value, userId.value, {
      permissionId,
      expiresAt,
    })
    await loadPermissions()
  }

  const revokePermission = async (permissionId: string) => {
    if (!workspaceId.value || !userId.value) return
    await assignmentService.revokePermission(workspaceId.value, userId.value, permissionId)
    await loadPermissions()
  }

  const availablePermissions = computed(() => {
    const assignedIds = new Set(userPermissions.value.map((p) => p.permissionId))
    return catalog.value.filter((perm) => !assignedIds.has(perm.id))
  })

  watch(
    [workspaceId, userId],
    () => {
      loadCatalog()
      loadPermissions()
    },
    { immediate: true },
  )

  return {
    workspaceId,
    userId,
    userPermissions,
    catalog,
    availablePermissions,
    isLoading,
    isError,
    reload: loadPermissions,
    grantPermission,
    revokePermission,
  }
}

