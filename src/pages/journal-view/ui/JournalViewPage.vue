<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Навигация -->
      <Button
        @click="router.push('/journal')"
        variant="ghost"
        size="md"
        class="mb-6"
        :left-icon="ArrowLeftIcon"
      >
        Назад к дневнику
      </Button>

      <!-- Заголовок -->
      <div class="mb-6">
        <h1 class="mb-2">{{ entry?.title || 'Загрузка...' }}</h1>
        <div class="flex items-center gap-4 text-sm text-gray-500">
          <span>{{ formatDate(entry?.date || '') }}</span>
          <span v-if="entry?.mood" class="text-xl">{{ getMoodEmoji(entry.mood) }}</span>
          <Badge variant="outline">{{ getContentTypeLabel(entry?.contentType || 'text') }}</Badge>
        </div>
      </div>

      <!-- Теги -->
      <div v-if="entry?.tags && entry.tags.length > 0" class="flex flex-wrap gap-2 mb-6">
        <Badge
          v-for="tag in entry.tags"
          :key="tag"
          variant="outline"
          class="bg-indigo-50 text-indigo-700 border-indigo-200"
        >
          {{ tag }}
        </Badge>
      </div>

      <!-- Контент -->
      <Card :border="true" :padding="true" class="mb-6">
        <div
          v-if="entry?.contentType === 'markdown'"
          class="prose max-w-none markdown-content"
          v-html="renderedContent"
        />
        <div v-else class="whitespace-pre-wrap text-gray-700">{{ entry?.content }}</div>
      </Card>

      <!-- Действия -->
      <div class="flex items-center justify-between">
        <div class="text-sm text-gray-500">
          <span>Обновлено: {{ formatTime(entry?.updatedAt || '') }}</span>
        </div>
        <Button @click="handleEdit"> Редактировать </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import { formatDateRu, formatDateTimeRu } from '@/shared/lib'
  import { Card, Button, Badge } from '@/shared/ui'
  import { ArrowLeftIcon } from '@/shared/ui/icon'
  import { marked } from 'marked'
  import DOMPurify from 'dompurify'
  import type { JournalEntry } from '@/entities/journal'

  const router = useRouter()
  const route = useRoute()
  const entry = ref<JournalEntry | null>(null)

  // Настройка marked
  marked.setOptions({
    gfm: true,
    breaks: true,
  })

  onMounted(async () => {
    const entryId = route.params.id as string
    // TODO: Загрузить запись из API
    // entry.value = await journalStore.getEntry(entryId)

    entry.value = {
      id: '1',
      title: 'Отличный день!',
      content: '### Сегодня выполнил все привычки и чувствую себя прекрасно.',
      mood: 5,
      date: '2026-01-24',
      tags: ['привычки', 'успех'],
      contentType: 'markdown',
      createdAt: '2026-01-24T10:00:00Z',
      updatedAt: '2026-01-24T10:00:00Z',
      userId: 'current-user-id',
      workspaceId: 'current-workspace-id',
    }
  })

  const formatDate = (dateStr: string) => {
    if (!dateStr) return ''
    return formatDateRu(dateStr)
  }

  const formatTime = (dateStr: string) => {
    if (!dateStr) return ''
    return formatDateTimeRu(dateStr)
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

  const getContentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      text: 'Текст',
      markdown: 'Markdown',
    }
    return labels[type] || type
  }

  const renderedContent = computed(() => {
    if (entry.value?.contentType === 'markdown' && entry.value?.content) {
      try {
        const rawHtml = marked(entry.value.content) as string
        return DOMPurify.sanitize(rawHtml)
      } catch (error) {
        console.error('Markdown rendering error:', error)
        return ''
      }
    }
    return ''
  })

  const handleEdit = () => {
    router.push({ name: 'JournalEdit', params: { id: route.params.id } })
  }
</script>

<style scoped>
  .markdown-content :deep(h1) {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 1rem;
    margin-top: 1.5rem;
  }
  .markdown-content :deep(h2) {
    font-size: 1.25rem;
    font-weight: 700;
    margin-bottom: 0.75rem;
    margin-top: 1.25rem;
  }
  .markdown-content :deep(h3) {
    font-size: 1.125rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    margin-top: 1rem;
  }
  .markdown-content :deep(ul),
  .markdown-content :deep(ol) {
    margin-bottom: 1rem;
    padding-left: 1.5rem;
  }
  .markdown-content :deep(li) {
    margin-top: 0.25rem;
  }
  .markdown-content :deep(p) {
    margin-bottom: 1rem;
  }
  .markdown-content :deep(strong) {
    font-weight: 600;
  }
  .markdown-content :deep(em) {
    font-style: italic;
  }
  .markdown-content :deep(code) {
    background-color: #f3f4f6;
    padding: 0.125rem 0.25rem;
    border-radius: 0.25rem;
    font-family: monospace;
    font-size: 0.875em;
  }
  .markdown-content :deep(pre) {
    background-color: #1f2937;
    color: #f9fafb;
    padding: 1rem;
    border-radius: 0.5rem;
    overflow-x: auto;
    margin-bottom: 1rem;
  }
  .markdown-content :deep(pre code) {
    background-color: transparent;
    color: inherit;
    padding: 0;
  }
</style>
