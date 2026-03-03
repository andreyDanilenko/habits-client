<template>
  <div class="border border-border-light rounded-lg p-4 flex items-start justify-between gap-4">
    <div>
      <div class="font-medium text-text-primary">
        {{ role.name }}
        <span v-if="role.isSystem" class="ml-2 text-xs px-2 py-0.5 rounded-full bg-bg-tertiary text-text-secondary">
          Системная
        </span>
      </div>
      <p v-if="role.description" class="mt-1 text-sm text-text-secondary">
        {{ role.description }}
      </p>
    </div>
    <div class="flex items-center gap-2">
      <Button size="sm" variant="secondary" @click="$emit('edit', role)">
        Редактировать
      </Button>
      <Button
        v-if="!role.isSystem"
        size="sm"
        variant="danger"
        @click="$emit('delete', role)"
      >
        Удалить
      </Button>
    </div>
  </div>
</template>


<script setup lang="ts">
import { Button } from '@/shared/ui'
import type { Role } from '@/entities/role'

defineProps<{
  role: Role
}>()

defineEmits<{
  (e: 'edit', role: Role): void
  (e: 'delete', role: Role): void
}>()
</script>

