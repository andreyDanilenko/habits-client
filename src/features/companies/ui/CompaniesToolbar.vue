<template>
  <div class="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
    <div class="relative flex-1 min-w-0">
      <SearchIcon class="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-text-muted pointer-events-none" />
      <input
        :value="searchQuery"
        type="search"
        placeholder="Поиск по названию, ИНН, email..."
        class="w-full pl-10 pr-4 py-2 border border-border-default rounded-lg bg-bg-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-default focus:border-primary-default"
        @input="$emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
      />
    </div>
    <div class="flex gap-2 flex-shrink-0">
      <PermissionGuard :permission="CRM_PERMISSIONS.companyCreate">
        <Button variant="primary" size="md" @click="$emit('create')">
          <PlusIcon class="size-5 mr-2" />
          Создать компанию
        </Button>
      </PermissionGuard>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { Button } from '@/shared/ui'
  import { PlusIcon, SearchIcon } from '@/shared/ui/icon'
  import { PermissionGuard } from '@/features/permissions'
  import { CRM_PERMISSIONS } from '@/features/permissions/config'

  defineProps<{ searchQuery: string }>()
  defineEmits<{ 'update:searchQuery': [value: string]; create: [] }>()
</script>
