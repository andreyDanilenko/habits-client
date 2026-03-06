<template>
  <div class="flex items-center justify-center gap-2">
    <template v-if="canEdit">
      <Button
        variant="icon"
        size="md"
        icon-color="info"
        aria-label="Редактировать"
        @click="$emit('edit', company)"
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
        @click="$emit('delete', company)"
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
  import type { Company } from '@/entities/company'

  defineProps<{ company: Company }>()
  defineEmits<{ edit: [company: Company]; delete: [company: Company] }>()

  const { can } = usePermissions()
  const canEdit = computed(() => can(CRM_PERMISSIONS.companyUpdate))
  const canDelete = computed(() => can(CRM_PERMISSIONS.companyDelete))
</script>
