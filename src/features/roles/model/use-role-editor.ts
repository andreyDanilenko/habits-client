import { ref, computed, watchEffect } from 'vue'
import type { Role, PermissionString } from '@/entities/role'
import { useRolesPage } from './use-roles-page'

interface RoleEditorOptions {
  role?: Role | null
  initialPermissions?: PermissionString[]
}

export function useRoleEditor(options: RoleEditorOptions = {}) {
  const { role, initialPermissions } = options
  const { createRole, updateRole } = useRolesPage()

  const name = ref(role?.name ?? '')
  const description = ref<string | null | undefined>(role?.description ?? null)
  const permissions = ref<PermissionString[]>(initialPermissions ?? [])

  const isSystem = computed(() => role?.isSystem ?? false)
  const isValid = computed(() => name.value.trim().length > 0)

  watchEffect(() => {
    if (role) {
      name.value = role.name
      description.value = role.description
    }
  })

  const setPermissions = (next: PermissionString[]) => {
    permissions.value = next
  }

  const save = async () => {
    if (!isValid.value) {
      throw new Error('Role name is required')
    }
    const payload = {
      name: name.value.trim(),
      description: description.value ?? null,
      permissions: permissions.value,
    }
    if (!role) {
      return createRole(payload)
    }
    return updateRole(role.id, payload)
  }

  return {
    name,
    description,
    permissions,
    isSystem,
    isValid,
    setPermissions,
    save,
  }
}
