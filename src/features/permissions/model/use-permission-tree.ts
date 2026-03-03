import { ref, computed, watch } from 'vue'
import { useWorkspaceStore } from '@/entities/workspace'
import { permissionService } from '@/entities/permission'
import type { Permission, PermissionTree } from '@/entities/permission'

export function usePermissionTree() {
  const workspaceStore = useWorkspaceStore()

  const catalog = ref<Permission[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const workspaceId = computed(() => workspaceStore.currentWorkspace?.id ?? '')

  const loadCatalog = async () => {
    if (!workspaceId.value) {
      catalog.value = []
      return
    }
    isLoading.value = true
    error.value = null
    try {
      catalog.value = await permissionService.getCatalog(workspaceId.value)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Не удалось загрузить каталог прав'
      catalog.value = []
    } finally {
      isLoading.value = false
    }
  }

  const tree = computed<PermissionTree>(() => {
    const modules: PermissionTree['modules'] = {}

    for (const perm of catalog.value) {
      if (!modules[perm.moduleCode]) {
        modules[perm.moduleCode] = {
          code: perm.moduleCode,
          name: perm.moduleCode,
          entities: {},
        }
      }
      const moduleNode = modules[perm.moduleCode]

      if (!moduleNode.entities[perm.entityType]) {
        moduleNode.entities[perm.entityType] = {
          code: perm.entityType,
          name: perm.entityType,
          actions: {},
        }
      }
      const entityNode = moduleNode.entities[perm.entityType]

      const key = perm.action
      if (!entityNode.actions[key]) {
        entityNode.actions[key] = {
          code: perm.action,
          name: perm.name,
          permission: perm,
          permissionString: `${perm.moduleCode}:${perm.entityType}:${perm.action}`,
        }
      }
    }

    return {
      modules,
      flat: catalog.value,
    }
  })

  watch(
    () => workspaceId.value,
    () => {
      loadCatalog()
    },
    { immediate: true },
  )

  return {
    workspaceId,
    catalog,
    tree,
    isLoading,
    error,
    reload: loadCatalog,
  }
}

