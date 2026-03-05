<template>
  <div class="space-y-3">
    <div class="flex items-center justify-between">
      <span class="text-sm font-medium text-text-secondary"> Индивидуальные права </span>
      <div class="flex items-center gap-2">
        <select
          v-model="selectedPermissionId"
          class="border border-border-default rounded-md px-2 py-1 text-sm bg-bg-primary text-text-primary"
        >
          <option value="">Выберите право</option>
          <option v-for="perm in availablePermissions" :key="perm.id" :value="perm.id">
            {{ perm.name }}
          </option>
        </select>
        <Button size="md" :disabled="!selectedPermissionId" @click="onGrant"> Выдать право </Button>
      </div>
    </div>

    <div v-if="isLoading" class="text-sm text-text-secondary">Загрузка индивидуальных прав…</div>

    <div v-else>
      <div v-if="!userPermissions.length" class="text-xs text-text-secondary">
        Индивидуальные права не выданы.
      </div>
      <ul v-else class="space-y-1 text-sm">
        <li
          v-for="perm in userPermissions"
          :key="perm.id"
          class="flex items-center justify-between gap-2"
        >
          <div class="flex flex-col">
            <span class="text-text-primary">
              {{ perm.permission }}
            </span>
            <span v-if="perm.expiresAt" class="text-xs text-text-secondary">
              до {{ perm.expiresAt }}
            </span>
          </div>
          <Button size="md" variant="secondary" @click="onRevoke(perm.permissionId)">
            Отозвать
          </Button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { Button } from '@/shared/ui'
  import { useUserPermissions } from '@/features/user-permissions/model/use-user-permissions'

  const props = defineProps<{
    userId: string
  }>()

  const { userPermissions, availablePermissions, isLoading, grantPermission, revokePermission } =
    useUserPermissions(props.userId)

  const selectedPermissionId = ref('')

  const onGrant = async () => {
    if (!selectedPermissionId.value) return
    await grantPermission(selectedPermissionId.value)
    selectedPermissionId.value = ''
  }

  const onRevoke = async (permissionId: string) => {
    await revokePermission(permissionId)
  }
</script>
