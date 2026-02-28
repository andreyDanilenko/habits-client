<template>
  <div class="flex items-center justify-center gap-2">
    <Button variant="icon" size="sm" icon-color="info" aria-label="Редактировать" @click="$emit('edit', company)">
      <CogIcon class="size-4" />
    </Button>
    <Button variant="icon" size="sm" icon-color="danger" aria-label="Удалить" @click="$emit('delete', company)">
      <DeleteIcon class="size-4" />
    </Button>
  </div>
</template>

<script setup lang="ts">
  import { Button } from '@/shared/ui'
  import { CogIcon, DeleteIcon } from '@/shared/ui/icon'
  import type { Company } from '@/entities/company'

  defineProps<{ company: Company }>()
  defineEmits<{ edit: [company: Company]; delete: [company: Company] }>()
</script>
