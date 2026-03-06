<template>
  <div class="flex items-center justify-center gap-2">
    <Button
      variant="icon"
      size="md"
      icon-color="info"
      aria-label="Редактировать"
      @click="$emit('edit', deal)"
    >
      <CogIcon class="size-4" />
    </Button>
    <Button
      variant="icon"
      size="md"
      icon-color="danger"
      aria-label="Удалить"
      @click="$emit('delete', deal)"
    >
      <DeleteIcon class="size-4" />
    </Button>
  </div>
</template>

<script setup lang="ts">
  import { Button } from '@/shared/ui'
  import { CogIcon, DeleteIcon } from '@/shared/ui/icon'
  import type { Deal } from '@/entities/deal'

  defineProps<{ deal: Deal }>()
  defineEmits<{ edit: [deal: Deal]; delete: [deal: Deal] }>()
</script>
