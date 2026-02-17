import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import type { CreateJournalEntryDto } from '@/entities/journal'
import {
  DEFAULT_JOURNAL_CONTENT_TYPE,
  MOOD_DEFINITIONS,
  getTodayDateString,
} from '@/features/journal/model/journal-constants'

const moodOptions = MOOD_DEFINITIONS

export const useJournalEditor = (entryId?: string) => {
  const router = useRouter()
  const isEditMode = computed(() => !!entryId)

  const isSaving = ref(false)
  const isPublishing = ref(false)
  const lastSaved = ref<Date | null>(null)
  const newTag = ref('')
  const contentTextarea = ref<HTMLTextAreaElement | null>(null)

  const form = reactive<CreateJournalEntryDto & { id?: string; date: string }>({
    description: '',
    mood: undefined,
    date: getTodayDateString(),
    tags: [],
    contentType: DEFAULT_JOURNAL_CONTENT_TYPE,
  })

  // Загрузка существующей записи
  onMounted(async () => {
    if (entryId) {
      // TODO: Загрузить запись из API
      // const entry = await journalStore.getEntry(entryId)
      // Object.assign(form, entry)
    }
  })

  // Статистика
  const characterCount = computed(() => (form.description ?? '').length)
  const wordCount = computed(() => {
    if (!(form.description ?? '').trim()) return 0
    return (form.description ?? '').trim().split(/\s+/).length
  })
  const readingTime = computed(() => Math.ceil(wordCount.value / 200) || 1)

  // Валидация
  const canPreview = computed(() => (form.description ?? '').trim().length > 0)
  const canPublish = computed(() => (form.description ?? '').trim().length > 0)

  // Работа с тегами
  const addTag = () => {
    const tag = newTag.value.trim()
    if (tag && !form.tags?.includes(tag)) {
      form.tags = [...(form.tags || []), tag]
      newTag.value = ''
    }
  }

  const removeTag = (tag: string) => {
    form.tags = form.tags?.filter((t) => t !== tag) || []
  }

  // Вставка Markdown
  const insertMarkdown = (before: string, after: string) => {
    if (!contentTextarea.value) return

    const textarea = contentTextarea.value
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const desc = form.description ?? ''
    const selectedText = desc.substring(start, end)
    const newText = before + selectedText + after
    form.description = desc.substring(0, start) + newText + desc.substring(end)

    // Восстанавливаем фокус и позицию курсора
    nextTick(() => {
      if (contentTextarea.value) {
        contentTextarea.value.focus()
        const newPosition = start + before.length + selectedText.length
        contentTextarea.value.setSelectionRange(newPosition, newPosition)
      }
    })
  }

  // Автосохранение
  let autoSaveTimer: ReturnType<typeof setTimeout> | null = null
  const AUTO_SAVE_DELAY = 2000 // 2 секунды

  const handleAutoSave = () => {
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer)
    }

    autoSaveTimer = setTimeout(async () => {
      await saveDraft(true)
    }, AUTO_SAVE_DELAY)
  }

  // Сохранение черновика
  const saveDraft = async (silent = false) => {
    if (!silent) {
      isSaving.value = true
    }

    try {
      // TODO: Сохранить через API
      // if (isEditMode.value) {
      //   await journalStore.updateEntry(form.id!, form)
      // } else {
      //   const newEntry = await journalStore.createEntry(form)
      //   form.id = newEntry.id
      // }

      lastSaved.value = new Date()
    } catch (error) {
      console.error('Failed to save draft:', error)
    } finally {
      if (!silent) {
        isSaving.value = false
      }
    }
  }

  const handleSaveDraft = () => {
    saveDraft(false)
  }

  // Публикация
  const handlePublish = async () => {
    if (!canPublish.value) return

    isPublishing.value = true
    try {
      // TODO: Опубликовать через API
      // await journalStore.publishEntry(form.id || form)
      router.push('/journal')
    } catch (error) {
      console.error('Failed to publish:', error)
    } finally {
      isPublishing.value = false
    }
  }

  return {
    form,
    isEditMode,
    isSaving,
    isPublishing,
    lastSaved,
    newTag,
    moodOptions,
    characterCount,
    wordCount,
    readingTime,
    canPreview,
    canPublish,
    contentTextarea,
    addTag,
    removeTag,
    handleAutoSave,
    handleSaveDraft,
    handlePublish,
    insertMarkdown,
  }
}
