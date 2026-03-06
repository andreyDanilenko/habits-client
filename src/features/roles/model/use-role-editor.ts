import { ref, computed, watchEffect } from 'vue'
import type { Role, PermissionString } from '@/entities/role'
import { useRolesPage } from './use-roles-page'

interface RoleEditorOptions {
  role?: Role | null | (() => Role | null | undefined)
  initialPermissions?: PermissionString[]
}

export function useRoleEditor(options: RoleEditorOptions = {}) {
  const { role: roleOrGetter, initialPermissions } = options
  const { createRole, updateRole } = useRolesPage()

  const getCurrentRole = (): Role | null | undefined =>
    typeof roleOrGetter === 'function' ? roleOrGetter() : roleOrGetter

  const currentRole = getCurrentRole()
  const name = ref(currentRole?.name ?? '')
  const description = ref<string | null | undefined>(currentRole?.description ?? null)
  const permissions = ref<PermissionString[]>(initialPermissions ?? [])

  const isSystem = computed(() => getCurrentRole()?.isSystem ?? false)
  const isValid = computed(() => name.value.trim().length > 0)

  watchEffect(() => {
    const r = getCurrentRole()
    if (r) {
      name.value = r.name
      description.value = r.description
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
    const role = getCurrentRole()
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
