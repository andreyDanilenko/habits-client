<template>
  <ul class="space-y-3">
    <li
      v-for="note in notes"
      :key="note.id"
      class="p-4 rounded-lg border border-border-light hover:bg-bg-secondary flex justify-between items-start gap-4"
    >
      <div class="min-w-0 flex-1 cursor-pointer" @click="$emit('edit-note', note)">
        <h3 class="font-medium text-text-primary truncate">{{ note.title }}</h3>
        <p v-if="note.content" class="mt-1 text-sm text-text-secondary line-clamp-2">
          {{ note.content }}
        </p>
        <p class="mt-1 text-xs text-text-muted">{{ formatDate(note.updatedAt) }}</p>
      </div>
      <div class="flex items-center gap-2 flex-shrink-0">
        <Button variant="ghost" size="md" @click="$emit('edit-note', note)">Изменить</Button>
        <Button
          variant="ghost"
          size="md"
          class="text-error-default"
          @click="$emit('delete-note', note)"
        >
          Удалить
        </Button>
      </div>
    </li>
  </ul>
</template>

<script setup lang="ts">
  import { Button } from '@/shared/ui'
  import type { Note } from '@/features/notes/model'

  defineProps<{
    notes: Note[]
    formatDate: (s: string) => string
  }>()

  defineEmits<{
    'edit-note': [note: Note]
    'delete-note': [note: Note]
  }>()
</script>
