<template>
  <ul class="space-y-3">
    <li
      v-for="note in notes"
      :key="note.id"
      class="p-4 rounded-lg border border-gray-200 hover:bg-gray-50 flex justify-between items-start gap-4"
    >
      <div class="min-w-0 flex-1 cursor-pointer" @click="$emit('edit-note', note)">
        <h3 class="font-medium text-gray-900 truncate">{{ note.title }}</h3>
        <p v-if="note.content" class="mt-1 text-sm text-gray-600 line-clamp-2">{{ note.content }}</p>
        <p class="mt-1 text-xs text-gray-400">{{ formatDate(note.updatedAt) }}</p>
      </div>
      <div class="flex items-center gap-2 flex-shrink-0">
        <Button variant="ghost" size="sm" @click="$emit('edit-note', note)">Изменить</Button>
        <Button variant="ghost" size="sm" class="text-red-600" @click="$emit('delete-note', note)">
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
