<template>
  <div class="flex items-center justify-center gap-2">
    <Button
      variant="icon"
      size="md"
      icon-color="info"
      aria-label="Редактировать"
      @click="$emit('edit', contact)"
    >
      <CogIcon class="size-4" />
    </Button>
    <Button
      variant="icon"
      size="md"
      aria-label="Добавить в сделку"
      @click="$emit('add-to-deal', contact)"
    >
      <PlusIcon class="size-4" />
    </Button>
    <Button
      variant="icon"
      size="md"
      icon-color="danger"
      aria-label="Удалить"
      @click="$emit('delete', contact)"
    >
      <DeleteIcon class="size-4" />
    </Button>
  </div>
</template>

<script setup lang="ts">
  import { Button } from '@/shared/ui'
  import { CogIcon, DeleteIcon, PlusIcon } from '@/shared/ui/icon'
  import type { Contact } from '@/entities/contact'

  defineProps<{ contact: Contact }>()
  defineEmits<{
    edit: [contact: Contact]
    delete: [contact: Contact]
    'add-to-deal': [contact: Contact]
  }>()
</script>
