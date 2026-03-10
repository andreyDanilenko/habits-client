<template>
  <div class="flex items-center justify-center gap-2">
    <template v-if="canEdit">
      <Button
        variant="icon"
        size="md"
        icon-color="info"
        aria-label="Редактировать"
        @click="$emit('edit', deal)"
      >
        <CogIcon class="size-4" />
      </Button>
    </template>
    <template v-if="canDelete">
      <Button
        variant="icon"
        size="md"
        icon-color="danger"
        aria-label="Удалить"
        @click="$emit('delete', deal)"
      >
        <DeleteIcon class="size-4" />
      </Button>
    </template>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { Button } from '@/shared/ui'
  import { CogIcon, DeleteIcon } from '@/shared/ui/icon'
  import { usePermissions } from '@/features/permissions'
  import { CRM_PERMISSIONS } from '@/features/permissions/config'
  import type { Deal } from '@/entities/deal'

  defineProps<{ deal: Deal }>()
  defineEmits<{ edit: [deal: Deal]; delete: [deal: Deal] }>()

  const { can } = usePermissions()
  const canEdit = computed(() => can(CRM_PERMISSIONS.dealUpdate))
  const canDelete = computed(() => can(CRM_PERMISSIONS.dealDelete))
</script>
