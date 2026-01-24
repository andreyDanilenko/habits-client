<template>
  <Card
    :border="true"
    :padding="true"
    class="cursor-pointer hover:shadow-lg transition-all duration-200 group border-gray-200 hover:border-indigo-300 relative overflow-hidden"
    @click="$emit('click')"
  >
    <!-- Акцентная полоска слева -->
    <div
      class="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity"
    ></div>

    <!-- Заголовок и настроение -->
    <div class="flex items-start justify-between mb-3">
      <div class="flex-1 min-w-0">
        <h3 class="text-lg font-semibold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors line-clamp-2">
          {{ entry.title }}
        </h3>
        <div class="flex items-center gap-2 text-sm text-gray-500">
          <span>{{ formatDate(entry.date) }}</span>
          <span v-if="entry.mood" class="flex items-center gap-1">
            <span class="text-gray-300">•</span>
            <span class="text-lg">{{ getMoodEmoji(entry.mood) }}</span>
          </span>
        </div>
      </div>
      <div
        v-if="entry.mood"
        class="ml-3 flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center border-2 border-indigo-100 group-hover:border-indigo-200 transition-colors"
      >
        <span class="text-2xl">{{ getMoodEmoji(entry.mood) }}</span>
      </div>
    </div>

    <!-- Превью контента -->
    <div class="mb-4">
      <p class="text-gray-700 line-clamp-3 leading-relaxed">
        {{ getPreview(entry.content) }}
      </p>
    </div>

    <!-- Теги -->
    <div v-if="entry.tags && entry.tags.length > 0" class="flex flex-wrap gap-2 mb-4">
      <Badge
        v-for="tag in entry.tags"
        :key="tag"
        variant="outline"
        size="sm"
        class="bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100 transition-colors"
      >
        {{ tag }}
      </Badge>
    </div>

    <!-- Футер с метаданными и действиями -->
    <div class="flex items-center justify-between pt-3 border-t border-gray-100">
      <div class="flex items-center gap-3 text-xs text-gray-500">
        <span class="flex items-center gap-1">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {{ getContentTypeLabel(entry.contentType) }}
        </span>
        <span class="text-gray-300">•</span>
        <span>{{ formatTime(entry.updatedAt) }}</span>
      </div>
      <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          @click.stop="$emit('edit')"
          class="p-2 hover:bg-indigo-50 rounded-lg transition-colors"
          title="Редактировать"
        >
          <CogIcon class="w-4 h-4 text-indigo-600" />
        </button>
        <button
          @click.stop="$emit('delete')"
          class="p-2 hover:bg-red-50 rounded-lg transition-colors"
          title="Удалить"
        >
          <DeleteIcon class="w-4 h-4 text-red-500" />
        </button>
      </div>
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
    return content.replace(/[#*_`[\]]/g, '').substring(0, 150)
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
