<template>
  <div class="space-y-3 min-w-0">
    <span class="text-sm font-medium text-text-secondary">Индивидуальные права</span>

    <div v-if="isLoading" class="text-sm text-text-secondary">Загрузка индивидуальных прав…</div>

    <div v-else>
      <div v-if="!userPermissions.length" class="text-xs text-text-secondary">
        Индивидуальные права не выданы.
      </div>
      <ul v-else class="space-y-1 text-sm">
        <li
          v-for="perm in userPermissions"
          :key="perm.id"
          class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
        >
          <div class="flex flex-col">
            <span class="text-text-primary">
              {{ perm.permission }}
            </span>
            <span v-if="perm.expiresAt" class="text-xs text-text-secondary">
              до {{ perm.expiresAt }}
            </span>
          </div>
          <Button
            size="md"
            variant="secondary"
            class="flex-shrink-0 sm:self-center"
            @click="onRevoke(perm.permissionId)"
          >
            Отозвать
          </Button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { Button } from '@/shared/ui'
  import { useUserPermissions } from '@/features/user-permissions/model/use-user-permissions'

  const props = defineProps<{
    userId: string
  }>()

  const { userPermissions, isLoading, revokePermission } = useUserPermissions(props.userId)

  const onRevoke = async (permissionId: string) => {
    await revokePermission(permissionId)
  }
</script>
