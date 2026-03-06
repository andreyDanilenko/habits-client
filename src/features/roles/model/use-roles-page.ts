import { ref, computed, watch } from 'vue'
import { useWorkspaceStore } from '@/entities/workspace'
import { roleService } from '@/entities/role'
import type { Role, PermissionString } from '@/entities/role'

export function useRolesPage() {
  const workspaceStore = useWorkspaceStore()

  const roles = ref<Role[]>([])
  const isLoading = ref(false)
  const isError = ref(false)

  const workspaceId = computed(() => workspaceStore.currentWorkspace?.id ?? '')

  const systemRoles = computed(() => roles.value.filter((r) => r.isSystem))
  const customRoles = computed(() => roles.value.filter((r) => !r.isSystem))

  const fetchRoles = async () => {
    if (!workspaceId.value) {
      roles.value = []
      return
    }
    isLoading.value = true
    isError.value = false
    try {
      roles.value = await roleService.list(workspaceId.value)
    } catch {
      isError.value = true
      roles.value = []
    } finally {
      isLoading.value = false
    }
  }

  const createRole = async (payload: {
    name: string
    description?: string | null
    permissions: PermissionString[]
  }): Promise<Role> => {
    if (!workspaceId.value) {
      throw new Error('Workspace not selected')
    }
    const role = await roleService.create(workspaceId.value, payload)
    await fetchRoles()
    return role
  }

  const updateRole = async (
    roleId: string,
    payload: { name?: string; description?: string | null; permissions: PermissionString[] },
  ): Promise<Role> => {
    if (!workspaceId.value) {
      throw new Error('Workspace not selected')
    }
    const role = await roleService.update(workspaceId.value, roleId, payload)
    await fetchRoles()
    return role
  }

  const deleteRole = async (roleId: string): Promise<void> => {
    if (!workspaceId.value) {
      throw new Error('Workspace not selected')
    }
    await roleService.delete(workspaceId.value, roleId)
    await fetchRoles()
  }

  watch(
    () => workspaceId.value,
    (newId, oldId) => {
      if (newId && newId !== oldId) {
        fetchRoles()
      }
    },
  )

  return {
    workspaceId,
    roles,
    systemRoles,
    customRoles,
    isLoading,
    isError,
    fetchRoles,
    createRole,
    updateRole,
    deleteRole,
  }
}
