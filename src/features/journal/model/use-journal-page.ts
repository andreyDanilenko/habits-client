import { ref, computed, watch, onMounted } from 'vue'
import { format, isToday, isYesterday, isThisWeek, isThisMonth, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'
import type { JournalEntry, CreateJournalEntryDto } from '@/entities/journal'
import { journalService } from '@/entities/journal'
import { useWorkspaceStore } from '@/entities/workspace'
import {
  DEFAULT_JOURNAL_CONTENT_TYPE,
  MOOD_DEFINITIONS,
  getTodayDateString,
} from '@/features/journal/model/journal-constants'

export const moodOptions = MOOD_DEFINITIONS.map(({ value, emoji, label }) => ({
  value,
  label: `${emoji} ${label}`,
}))

export const dateOptions = [
  { value: 'today', label: 'Сегодня' },
  { value: 'week', label: 'Эта неделя' },
  { value: 'month', label: 'Этот месяц' },
]

export interface GroupedEntry {
  date: string
  dateLabel: string
  entries: JournalEntry[]
}

export const useJournalPage = () => {
  const workspaceStore = useWorkspaceStore()
  const searchQuery = ref('')
  const selectedMood = ref<number | null>(null)
  const selectedDate = ref<string | null>(null)
  const isLoading = ref(false)
  const entries = ref<JournalEntry[]>([])

  async function fetchEntries() {
    const workspaceId = workspaceStore.currentWorkspace?.id
    if (!workspaceId) {
      entries.value = []
      return
    }
    isLoading.value = true
    try {
      entries.value = await journalService.getList(workspaceId)
    } catch (e) {
      console.error('Failed to fetch journal entries:', e)
      entries.value = []
    } finally {
      isLoading.value = false
    }
  }

  onMounted(fetchEntries)
  watch(() => workspaceStore.currentWorkspace?.id, fetchEntries)

  const filteredEntries = computed(() => {
    let result = entries.value

    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      result = result.filter((entry) => {
        const matchesDesc = entry.description?.toLowerCase().includes(query)
        const matchesTags = entry.tags?.some((tag) => tag.toLowerCase().includes(query))
        return matchesDesc || matchesTags
      })
    }

    if (selectedMood.value) {
      result = result.filter((entry) => entry.mood === selectedMood.value)
    }

    if (selectedDate.value) {
      const now = new Date()
      result = result.filter((entry) => {
        const entryDate = new Date(entry.date)
        if (selectedDate.value === 'today') return entryDate.toDateString() === now.toDateString()
        if (selectedDate.value === 'week') {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          return entryDate >= weekAgo
        }
        if (selectedDate.value === 'month') {
          return entryDate.getMonth() === now.getMonth() && entryDate.getFullYear() === now.getFullYear()
        }
        return true
      })
    }

    return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  })

  const handleSaveEntry = async (entryData: CreateJournalEntryDto & { id?: string }) => {
    const workspaceId = workspaceStore.currentWorkspace?.id
    if (!workspaceId) return

    try {
      if (entryData.id) {
        const updated = await journalService.update(workspaceId, entryData.id, {
          description: entryData.description,
          mood: entryData.mood,
          date: entryData.date,
          tags: entryData.tags,
          contentType: entryData.contentType,
          metadata: entryData.metadata,
        })
        const index = entries.value.findIndex((e) => e.id === entryData.id)
        if (index !== -1) entries.value[index] = updated
      } else {
        const created = await journalService.create(workspaceId, {
          description: entryData.description,
          mood: entryData.mood,
          date: entryData.date || getTodayDateString(),
          tags: entryData.tags,
          contentType: entryData.contentType || DEFAULT_JOURNAL_CONTENT_TYPE,
          metadata: entryData.metadata,
        })
        entries.value = [created, ...entries.value]
      }
    } catch (e) {
      console.error('Failed to save entry:', e)
      throw e
    }
  }

  const handleDeleteEntry = async (entry: JournalEntry) => {
    const workspaceId = workspaceStore.currentWorkspace?.id
    if (!workspaceId) return

    try {
      await journalService.delete(workspaceId, entry.id)
      entries.value = entries.value.filter((e) => e.id !== entry.id)
    } catch (e) {
      console.error('Failed to delete entry:', e)
      throw e
    }
  }

  const monthlyCount = computed(() => {
    const now = new Date()
    return filteredEntries.value.filter((entry) => {
      const entryDate = parseISO(entry.date)
      return entryDate.getMonth() === now.getMonth() && entryDate.getFullYear() === now.getFullYear()
    }).length
  })

  const averageMood = computed(() => {
    const withMood = filteredEntries.value.filter((e) => e.mood != null)
    if (withMood.length === 0) return '—'
    const sum = withMood.reduce((acc, e) => acc + (e.mood ?? 0), 0)
    return (sum / withMood.length).toFixed(1)
  })

  const averageMoodEmoji = computed(() => {
    const avg = parseFloat(averageMood.value)
    if (isNaN(avg)) return '😐'
    if (avg >= 4.5) return '😊'
    if (avg >= 3.5) return '🙂'
    if (avg >= 2.5) return '😐'
    if (avg >= 1.5) return '😔'
    return '😢'
  })

  const groupedEntries = computed<GroupedEntry[]>(() => {
    const groups = new Map<string, JournalEntry[]>()
    filteredEntries.value.forEach((entry) => {
      const dateKey = entry.date
      if (!groups.has(dateKey)) groups.set(dateKey, [])
      groups.get(dateKey)!.push(entry)
    })
    return Array.from(groups.entries())
      .map(([date, list]) => {
        const entryDate = parseISO(date)
        let dateLabel = ''
        if (isToday(entryDate)) dateLabel = 'Сегодня'
        else if (isYesterday(entryDate)) dateLabel = 'Вчера'
        else if (isThisWeek(entryDate)) dateLabel = format(entryDate, 'EEEE, d MMMM', { locale: ru })
        else if (isThisMonth(entryDate)) dateLabel = format(entryDate, 'd MMMM', { locale: ru })
        else dateLabel = format(entryDate, 'd MMMM yyyy', { locale: ru })
        if (dateLabel) dateLabel = dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1)
        return {
          date,
          dateLabel,
          entries: list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
        }
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  })

  const hasActiveFilters = computed(
    () => !!selectedMood.value || !!selectedDate.value || !!searchQuery.value,
  )

  const clearFilters = () => {
    selectedMood.value = null
    selectedDate.value = null
    searchQuery.value = ''
  }

  return {
    searchQuery,
    selectedMood,
    selectedDate,
    isLoading,
    entries,
    filteredEntries,
    moodOptions,
    dateOptions,
    monthlyCount,
    averageMood,
    averageMoodEmoji,
    groupedEntries,
    hasActiveFilters,
    clearFilters,
    handleSaveEntry,
    handleDeleteEntry,
    fetchEntries,
  }
}
