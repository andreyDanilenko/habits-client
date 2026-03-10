<template>
  <div class="space-y-4">
    <div>
      <h2 class="text-sm font-semibold text-text-primary">Права системных ролей</h2>
      <p class="mt-1 text-sm text-text-secondary">
        Базовые права для OWNER, ADMIN, MEMBER и GUEST. Эти роли нельзя редактировать.
      </p>
    </div>

    <div v-if="isLoading" class="text-sm text-text-secondary">Загрузка…</div>

    <div v-else-if="Object.keys(systemRoles).length === 0" class="text-sm text-text-secondary">
      Нет данных о правах системных ролей.
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="(perms, roleName) in systemRoles"
        :key="roleName"
        class="border border-border-light rounded-lg p-4"
      >
        <div class="font-medium text-text-primary mb-2">{{ roleName }}</div>
        <div class="flex flex-wrap gap-1.5">
          <Badge v-for="perm in perms" :key="perm" variant="outline" class="text-xs font-mono">
            {{ perm }}
          </Badge>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, watch } from 'vue'
  import { Badge } from '@/shared/ui'
  import { permissionService, type SystemRolesPermissions } from '@/entities/permission'
  import { useWorkspaceStore } from '@/entities/workspace'

  const workspaceStore = useWorkspaceStore()
  const systemRoles = ref<SystemRolesPermissions>({})
  const isLoading = ref(false)

  const workspaceId = () => workspaceStore.currentWorkspace?.id ?? ''

  const fetch = async () => {
    const wsId = workspaceId()
    if (!wsId) return
    isLoading.value = true
    try {
      systemRoles.value = await permissionService.getSystemRoles(wsId)
    } catch {
      systemRoles.value = {}
    } finally {
      isLoading.value = false
    }
  }

  onMounted(() => void fetch())
  watch(
    () => workspaceStore.currentWorkspace?.id,
    () => void fetch(),
  )
</script>
