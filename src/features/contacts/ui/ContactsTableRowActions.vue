<template>
  <div class="flex items-center justify-center gap-2">
    <template v-if="canEdit">
      <Button
        variant="icon"
        size="md"
        icon-color="info"
        aria-label="Редактировать"
        @click="$emit('edit', contact)"
      >
        <CogIcon class="size-4" />
      </Button>
    </template>
    <template v-if="canAddToDeal">
      <Button
        variant="icon"
        size="md"
        aria-label="Добавить в сделку"
        @click="$emit('add-to-deal', contact)"
      >
        <PlusIcon class="size-4" />
      </Button>
    </template>
    <template v-if="canDelete">
      <Button
        variant="icon"
        size="md"
        icon-color="danger"
        aria-label="Удалить"
        @click="$emit('delete', contact)"
      >
        <DeleteIcon class="size-4" />
      </Button>
    </template>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { Button } from '@/shared/ui'
  import { CogIcon, DeleteIcon, PlusIcon } from '@/shared/ui/icon'
  import { usePermissions } from '@/features/permissions'
  import { CRM_PERMISSIONS } from '@/features/permissions/config'
  import type { Contact } from '@/entities/contact'

  defineProps<{ contact: Contact }>()
  defineEmits<{
    edit: [contact: Contact]
    delete: [contact: Contact]
    'add-to-deal': [contact: Contact]
  }>()

  const { can } = usePermissions()
  const canEdit = computed(() => can(CRM_PERMISSIONS.contactUpdate))
  const canDelete = computed(() => can(CRM_PERMISSIONS.contactDelete))
  const canAddToDeal = computed(() => can(CRM_PERMISSIONS.dealCreate))
</script>
