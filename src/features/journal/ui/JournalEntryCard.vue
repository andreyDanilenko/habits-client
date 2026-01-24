<template>
  <Card :border="true" :padding="true" class="cursor-pointer hover:shadow-md transition-shadow" @click="$emit('click')">
    <div class="flex items-start justify-between mb-3">
      <div class="flex-1">
        <h3 class="text-lg font-semibold text-gray-900 mb-1">{{ entry.title }}</h3>
        <p class="text-sm text-gray-500">{{ formatDate(entry.date) }}</p>
      </div>
      <div class="flex items-center gap-2">
        <span v-if="entry.mood" class="text-2xl">{{ getMoodEmoji(entry.mood) }}</span>
        <div class="flex gap-1">
          <button
            @click.stop="$emit('edit')"
            class="p-1 hover:bg-gray-100 rounded transition-colors"
            title="Редактировать"
          >
            <CogIcon class="w-4 h-4 text-gray-500" />
          </button>
          <button
            @click.stop="$emit('delete')"
            class="p-1 hover:bg-red-50 rounded transition-colors"
            title="Удалить"
          >
            <DeleteIcon class="w-4 h-4 text-red-500" />
          </button>
        </div>
      </div>
    </div>

    <p class="text-gray-700 mb-3 line-clamp-3">{{ getPreview(entry.content) }}</p>

    <div v-if="entry.tags && entry.tags.length > 0" class="flex flex-wrap gap-2 mb-2">
      <Badge v-for="tag in entry.tags" :key="tag" variant="outline" size="sm">
        {{ tag }}
      </Badge>
    </div>

    <div class="flex items-center justify-between text-xs text-gray-400">
      <span>{{ getContentTypeLabel(entry.contentType) }}</span>
      <span>{{ formatTime(entry.updatedAt) }}</span>
    </div>
  </Card>
</template>

<script setup lang="ts">
  import { format } from 'date-fns'
  import { ru } from 'date-fns/locale'
  import { Card, Badge } from '@/shared/ui'
  import { CogIcon, DeleteIcon } from '@/shared/ui/icon'
  import type { JournalEntry } from '@/entities/journal'

  interface Props {
    entry: JournalEntry
  }

  defineProps<Props>()
  defineEmits<{
    click: []
    edit: []
    delete: []
  }>()

  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), 'd MMMM yyyy', { locale: ru })
  }

  const formatTime = (dateStr: string) => {
    return format(new Date(dateStr), 'HH:mm', { locale: ru })
  }

  const getMoodEmoji = (mood: number) => {
    const emojis: Record<number, string> = {
      5: '😊',
      4: '🙂',
      3: '😐',
      2: '😔',
      1: '😢',
    }
    return emojis[mood] || '😐'
  }

  const getPreview = (content: string) => {
    // Убираем markdown разметку для preview
    return content.replace(/[#*_`\[\]]/g, '').substring(0, 150)
  }

  const getContentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      text: 'Текст',
      markdown: 'Markdown',
      'rich-text': 'Rich Text',
      document: 'Документ',
    }
    return labels[type] || type
  }
</script>
