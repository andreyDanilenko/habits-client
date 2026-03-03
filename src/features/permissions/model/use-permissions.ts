import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/features/auth'
import type { PermissionString } from '@/entities/role'

export function usePermissions() {
  const authStore = useAuthStore()
  const { effectivePermissions } = storeToRefs(authStore)

  const permissionList = computed<PermissionString[]>(() => {
    return (effectivePermissions.value?.permissions ?? []) as PermissionString[]
  })

  const roles = computed(() => effectivePermissions.value?.roles ?? [])
  const systemRole = computed(() => effectivePermissions.value?.systemRole)

  const can = (permission: PermissionString): boolean => {
    return permissionList.value.includes(permission)
  }

  const canAny = (permissions: PermissionString[]): boolean => {
    return permissions.some((p) => can(p))
  }

  const canAll = (permissions: PermissionString[]): boolean => {
    return permissions.every((p) => can(p))
  }

  return {
    can,
    canAny,
    canAll,
    permissions: permissionList,
    roles,
    systemRole,
  }
}

