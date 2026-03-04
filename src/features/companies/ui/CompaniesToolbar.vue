<template>
  <div class="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
    <div class="flex-1 min-w-0">
      <SearchInput
        :model-value="searchQuery"
        placeholder="Поиск по названию, ИНН, email..."
        size="lg"
        @update:model-value="$emit('update:searchQuery', $event)"
      />
    </div>
    <div class="flex gap-2 flex-shrink-0">
      <PermissionGuard :permission="CRM_PERMISSIONS.companyCreate">
        <Button variant="primary" size="lg" @click="$emit('create')">
          <PlusIcon class="size-5 mr-2" />
          Создать компанию
        </Button>
      </PermissionGuard>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { Button, SearchInput } from '@/shared/ui'
  import { PlusIcon } from '@/shared/ui/icon'
  import { PermissionGuard } from '@/features/permissions'
  import { CRM_PERMISSIONS } from '@/features/permissions/config'

  defineProps<{ searchQuery: string }>()
  defineEmits<{ 'update:searchQuery': [value: string]; create: [] }>()
</script>
