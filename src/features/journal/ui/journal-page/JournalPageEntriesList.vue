<template>
  <div class="space-y-8">
    <div v-for="group in groupedEntries" :key="group.date" class="space-y-4">
      <div class="flex items-center gap-3 sticky top-0 bg-gray-50 py-2 z-10 -mx-2 px-2 rounded-lg">
        <div class="h-px flex-1 bg-gray-300"></div>
        <h2 class="text-sm font-semibold text-gray-700 whitespace-nowrap">
          {{ group.dateLabel }}
        </h2>
        <div class="h-px flex-1 bg-gray-300"></div>
        <Badge variant="outline" size="sm" class="bg-gray-100">
          {{ group.entries.length }}
        </Badge>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <JournalEntryCard
          v-for="entry in group.entries"
          :key="entry.id"
          :entry="entry"
          @click="$emit('select-entry', entry)"
          @edit="$emit('edit-entry', entry)"
          @delete="$emit('delete-entry', entry)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { Badge } from '@/shared/ui'
  import { JournalEntryCard } from '@/features/journal/ui'
  import type { JournalEntry } from '@/entities/journal'
  import type { GroupedEntry } from '@/features/journal/model/use-journal-page'

  defineProps<{
    groupedEntries: GroupedEntry[]
  }>()

  defineEmits<{
    'select-entry': [entry: JournalEntry]
    'edit-entry': [entry: JournalEntry]
    'delete-entry': [entry: JournalEntry]
  }>()
</script>
