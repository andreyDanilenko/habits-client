import { ref, computed, watch } from 'vue'
import type { Ref } from 'vue'
import { useWorkspaceStore } from '@/entities/workspace'
import { assignmentService } from '@/entities/assignment'
import { roleService } from '@/entities/role'
import type { UserRole, UserPermission } from '@/entities/assignment'
import type { Role } from '@/entities/role'

type MaybeRef<T> = T | Ref<T>

export function useMemberRoles(userIdSource: MaybeRef<string>) {
  const workspaceStore = useWorkspaceStore()

  const userRoles = ref<UserRole[]>([])
  const userPermissions = ref<UserPermission[]>([])
  const availableRoles = ref<Role[]>([])

  const isLoading = ref(false)
  const isError = ref(false)

  const workspaceId = computed(() => workspaceStore.currentWorkspace?.id ?? '')
  const userId = computed(() =>
    typeof userIdSource === 'object' ? userIdSource.value : userIdSource,
  )

  const loadRolesForWorkspace = async () => {
    if (!workspaceId.value) {
      availableRoles.value = []
      return
    }
    availableRoles.value = await roleService.list(workspaceId.value)
  }

  const loadAssignments = async () => {
    if (!workspaceId.value || !userId.value) {
      userRoles.value = []
      userPermissions.value = []
      return
    }
    isLoading.value = true
    isError.value = false
    try {
      const [roles, permissions] = await Promise.all([
        assignmentService.getUserRoles(workspaceId.value, userId.value),
        assignmentService.getUserPermissions(workspaceId.value, userId.value),
      ])
      userRoles.value = roles
      userPermissions.value = permissions
    } catch {
      isError.value = true
      userRoles.value = []
      userPermissions.value = []
    } finally {
      isLoading.value = false
    }
  }

  const assignRole = async (roleId: string) => {
    if (!workspaceId.value || !userId.value) return
    await assignmentService.assignRole(workspaceId.value, userId.value, roleId)
    await loadAssignments()
  }

  const revokeRole = async (roleId: string) => {
    if (!workspaceId.value || !userId.value) return
    await assignmentService.revokeRole(workspaceId.value, userId.value, roleId)
    await loadAssignments()
  }

  const grantPermission = async (permissionId: string, expiresAt?: string) => {
    if (!workspaceId.value || !userId.value) return
    await assignmentService.grantPermission(workspaceId.value, userId.value, {
      permissionId,
      expiresAt,
    })
    await loadAssignments()
  }

  const revokePermission = async (permissionId: string) => {
    if (!workspaceId.value || !userId.value) return
    await assignmentService.revokePermission(workspaceId.value, userId.value, permissionId)
    await loadAssignments()
  }

  const customRoles = computed(() => userRoles.value.filter((r) => !r.isSystem))

  const systemRole = computed(() => userRoles.value.find((r) => r.isSystem)?.name ?? null)

  watch(
    [workspaceId, userId],
    () => {
      loadRolesForWorkspace()
      loadAssignments()
    },
    { immediate: true },
  )

  return {
    workspaceId,
    userId,
    availableRoles,
    userRoles,
    userPermissions,
    customRoles,
    systemRole,
    isLoading,
    isError,
    reload: loadAssignments,
    assignRole,
    revokeRole,
    grantPermission,
    revokePermission,
  }
}
