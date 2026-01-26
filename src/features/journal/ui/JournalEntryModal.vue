<template>
  <div class="max-w-4xl">
    <ModalContent
      :title="
        mode === 'view' && entry ? entry.title : entry ? 'Редактировать запись' : 'Новая запись'
      "
      @close="handleClose"
    >
      <div v-if="mode === 'view' && entry" class="space-y-6">
        <!-- Метаданные -->
        <div class="flex items-center gap-4 text-sm text-gray-600">
          <span>{{ formatDate(entry.date) }}</span>
          <span v-if="entry.mood" class="text-2xl">{{ getMoodEmoji(entry.mood) }}</span>
          <Badge variant="outline">{{ getContentTypeLabel(entry.contentType) }}</Badge>
        </div>

        <!-- Теги -->
        <div v-if="entry.tags && entry.tags.length > 0" class="flex flex-wrap gap-2">
          <Badge v-for="tag in entry.tags" :key="tag" variant="outline">
            {{ tag }}
          </Badge>
        </div>

        <!-- Контент -->
        <div class="prose max-w-none">
          <div
            v-if="entry.contentType === 'markdown'"
            class="markdown-content"
            v-html="renderedMarkdown"
          />
          <div v-else class="whitespace-pre-wrap text-gray-700">{{ entry.content }}</div>
        </div>

        <!-- Действия -->
        <div class="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" @click="handleClose"> Закрыть </Button>
          <Button @click="mode = 'edit'"> Редактировать </Button>
        </div>
      </div>

      <!-- Режим редактирования/создания -->
      <form v-else @submit.prevent="handleSubmit" class="space-y-4">
        <!-- Заголовок -->
        <FormField label="Заголовок" required>
          <Input v-model="form.title" type="text" required placeholder="Название записи..." />
        </FormField>

        <!-- Дата -->
        <FormField label="Дата">
          <Input v-model="form.date" type="date" required />
        </FormField>

        <!-- Настроение -->
        <FormField label="Настроение">
          <div class="flex gap-2">
            <SelectButton
              v-for="mood in moods"
              :key="mood.value"
              :is-selected="form.mood === mood.value"
              size="md"
              @click="form.mood = mood.value"
              :title="mood.label"
            >
              <span class="text-2xl">{{ mood.emoji }}</span>
            </SelectButton>
            <Button v-if="form.mood" variant="ghost" size="sm" @click="form.mood = undefined">
              Убрать
            </Button>
          </div>
        </FormField>

        <!-- Тип контента -->
        <FormField label="Тип контента">
          <div class="flex gap-2">
            <SelectButton
              v-for="option in contentTypeOptions"
              :key="option.value"
              :is-selected="form.contentType === option.value"
              size="sm"
              @click="form.contentType = option.value"
            >
              {{ option.label }}
            </SelectButton>
          </div>
        </FormField>

        <!-- Markdown редактор с preview -->
        <FormField v-if="form.contentType === 'markdown'" label="Содержание (Markdown)" required>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <textarea
                v-model="form.content"
                rows="15"
                required
                placeholder="Начните писать в формате Markdown..."
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none font-mono text-sm"
              />
            </div>
            <div
              class="border border-gray-200 rounded-lg p-4 bg-gray-50 overflow-auto max-h-[400px]"
            >
              <div
                class="prose prose-sm max-w-none markdown-content"
                v-html="renderedFormMarkdown"
              />
            </div>
          </div>
        </FormField>

        <!-- Обычный текстовый редактор -->
        <FormField v-else label="Содержание" required>
          <textarea
            v-model="form.content"
            rows="15"
            required
            placeholder="Начните писать..."
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
          />
        </FormField>

        <!-- Теги -->
        <FormField label="Теги">
          <div class="flex flex-wrap gap-2">
            <Badge
              v-for="tag in form.tags"
              :key="tag"
              variant="outline"
              class="cursor-pointer"
              @click="removeTag(tag)"
            >
              {{ tag }} ×
            </Badge>
            <Input
              v-model="newTag"
              type="text"
              placeholder="Добавить тег..."
              class="inline-block w-auto min-w-[120px]"
              @keydown.enter.prevent="addTag"
            />
          </div>
        </FormField>

        <!-- Действия -->
        <div class="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" type="button" @click="handleClose"> Отмена </Button>
          <Button type="submit">
            {{ entry ? 'Сохранить' : 'Создать' }}
          </Button>
        </div>
      </form>
    </ModalContent>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch, onMounted, computed } from 'vue'
  import { format } from 'date-fns'
  import { ru } from 'date-fns/locale'
  import { marked } from 'marked'
  import DOMPurify from 'dompurify' // Для безопасного рендеринга HTML
  import { ModalContent, FormField, Input, Button, Badge, SelectButton } from '@/shared/ui'
  import type { JournalEntry, CreateJournalEntryDto } from '@/entities/journal'

  interface Props {
    entry?: JournalEntry | null
  }

  const props = defineProps<Props>()

  const emit = defineEmits<{
    close: []
    confirm: [entry: CreateJournalEntryDto & { id?: string }]
    save: [entry: CreateJournalEntryDto & { id?: string }]
  }>()

  const mode = ref<'view' | 'edit' | 'create'>('view')

  const moods = [
    { emoji: '😊', value: 5, label: 'Отлично' },
    { emoji: '🙂', value: 4, label: 'Хорошо' },
    { emoji: '😐', value: 3, label: 'Нормально' },
    { emoji: '😔', value: 2, label: 'Плохо' },
    { emoji: '😢', value: 1, label: 'Очень плохо' },
  ]

  const contentTypeOptions = [
    { value: 'text', label: 'Текст' },
    { value: 'markdown', label: 'Markdown' },
    { value: 'rich-text', label: 'Rich Text' },
    { value: 'document', label: 'Документ' },
  ] as const

  // Настройка marked
  marked.setOptions({
    gfm: true, // GitHub Flavored Markdown
    breaks: true, // Переносы строк становятся <br>
  })

  // Безопасный рендеринг Markdown
  const renderMarkdown = (text: string): string => {
    if (!text) return ''
    const rawHtml = marked(text)
    return DOMPurify.sanitize(rawHtml)
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

  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), 'd MMMM yyyy', { locale: ru })
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

  // Computed свойства для рендеринга markdown
  const renderedMarkdown = computed(() => {
    if (props.entry?.contentType === 'markdown' && props.entry?.content) {
      return renderMarkdown(props.entry.content)
    }
    return ''
  })

  const renderedFormMarkdown = computed(() => {
    if (form.value.contentType === 'markdown') {
      return renderMarkdown(form.value.content || '')
    }
    return ''
  })

  const form = ref<CreateJournalEntryDto & { id?: string; date: string }>({
    title: '',
    content: '',
    mood: undefined,
    date: new Date().toISOString().split('T')[0],
    tags: [],
    contentType: 'text',
  })

  const newTag = ref('')

  const resetForm = () => {
    form.value = {
      title: '',
      content: '',
      mood: undefined,
      date: new Date().toISOString().split('T')[0],
      tags: [],
      contentType: 'text',
    }
  }

  watch(
    () => props.entry,
    (entry) => {
      if (entry) {
        form.value = {
          id: entry.id,
          title: entry.title,
          content: entry.content,
          mood: entry.mood,
          date: entry.date || new Date().toISOString().split('T')[0],
          tags: entry.tags || [],
          contentType: entry.contentType,
        }
        mode.value = 'view'
      } else {
        resetForm()
        mode.value = 'create'
      }
    },
    { immediate: true },
  )

  onMounted(() => {
    if (!props.entry) {
      resetForm()
      mode.value = 'create'
    } else {
      mode.value = 'view'
    }
  })

  const addTag = () => {
    const tag = newTag.value.trim()
    if (tag && !form.value.tags?.includes(tag)) {
      form.value.tags = [...(form.value.tags || []), tag]
      newTag.value = ''
    }
  }

  const removeTag = (tag: string) => {
    form.value.tags = form.value.tags?.filter((t) => t !== tag) || []
  }

  const handleClose = () => {
    emit('close')
  }

  const handleSubmit = () => {
    emit('confirm', form.value)
    emit('save', form.value)
    handleClose()
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
  .markdown-content :deep(ul) {
    list-style-type: disc;
    list-style-position: inside;
    margin-bottom: 1rem;
  }
  .markdown-content :deep(ul li) {
    margin-top: 0.25rem;
  }
  .markdown-content :deep(ol) {
    list-style-type: decimal;
    list-style-position: inside;
    margin-bottom: 1rem;
  }
  .markdown-content :deep(ol li) {
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
  .markdown-content :deep(a) {
    color: #4f46e5;
    text-decoration: none;
  }
  .markdown-content :deep(a:hover) {
    text-decoration: underline;
  }
</style>
