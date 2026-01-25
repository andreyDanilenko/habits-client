import { ref, computed } from 'vue'
import { format, isToday, isYesterday, isThisWeek, isThisMonth, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'
import type { JournalEntry, CreateJournalEntryDto } from '@/entities/journal'

export const moodOptions = [
  { value: 5, label: '😊 Отлично' },
  { value: 4, label: '🙂 Хорошо' },
  { value: 3, label: '😐 Нормально' },
  { value: 2, label: '😔 Плохо' },
  { value: 1, label: '😢 Очень плохо' },
]

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
  const searchQuery = ref('')
  const selectedMood = ref<number | null>(null)
  const selectedDate = ref<string | null>(null)
  const isLoading = ref(false)

  const entries = ref<JournalEntry[]>([
    {
      id: '1',
      title: 'Отличный день!',
      content: 'Сегодня выполнил все привычки и чувствую себя прекрасно.',
      mood: 5,
      date: '2026-01-24',
      tags: ['привычки', 'успех'],
      contentType: 'markdown',
      createdAt: '2026-01-24T10:00:00Z',
      updatedAt: '2026-01-24T10:00:00Z',
      userId: 'current-user-id',
      workspaceId: 'current-workspace-id',
    },
    {
      id: '2',
      title: 'Планы на неделю',
      content: 'Нужно сосредоточиться на работе и не забывать про спорт.',
      mood: 4,
      date: '2026-01-23',
      tags: ['планы'],
      contentType: 'text',
      createdAt: '2026-01-23T09:00:00Z',
      updatedAt: '2026-01-23T09:00:00Z',
      userId: 'current-user-id',
      workspaceId: 'current-workspace-id',
    },
  ])

  const filteredEntries = computed(() => {
    let result = entries.value

    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      result = result.filter(
        (entry) =>
          entry.title.toLowerCase().includes(query) ||
          entry.content.toLowerCase().includes(query) ||
          entry.tags?.some((tag) => tag.toLowerCase().includes(query)),
      )
    }

    if (selectedMood.value) {
      result = result.filter((entry) => entry.mood === selectedMood.value)
    }

    if (selectedDate.value) {
      const now = new Date()
      result = result.filter((entry) => {
        const entryDate = new Date(entry.date)
        if (selectedDate.value === 'today') {
          return entryDate.toDateString() === now.toDateString()
        }
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

  const handleSaveEntry = (entryData: CreateJournalEntryDto & { id?: string }) => {
    if (entryData.id) {
      const index = entries.value.findIndex((e) => e.id === entryData.id)
      if (index !== -1) {
        entries.value[index] = {
          ...entries.value[index],
          ...entryData,
          id: entryData.id,
          updatedAt: new Date().toISOString(),
        } as JournalEntry
      }
    } else {
      const newEntry: JournalEntry = {
        ...entryData,
        id: Date.now().toString(),
        userId: 'current-user-id', 
        workspaceId: 'current-workspace-id',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        date: entryData.date || new Date().toISOString().split('T')[0],
        contentType: entryData.contentType || 'text',
      }
      entries.value.push(newEntry)
    }
  }


  const handleDeleteEntry = (entry: JournalEntry) => {
    console.log('Delete entry:', entry.id)
    entries.value = entries.value.filter((e) => e.id !== entry.id)
  }

  // Статистика
  const monthlyCount = computed(() => {
    const now = new Date()
    return filteredEntries.value.filter((entry) => {
      const entryDate = parseISO(entry.date)
      return entryDate.getMonth() === now.getMonth() && entryDate.getFullYear() === now.getFullYear()
    }).length
  })

  const averageMood = computed(() => {
    const entriesWithMood = filteredEntries.value.filter((e) => e.mood)
    if (entriesWithMood.length === 0) return '—'
    const sum = entriesWithMood.reduce((acc, e) => acc + (e.mood || 0), 0)
    return (sum / entriesWithMood.length).toFixed(1)
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

  // Группировка по датам
  const groupedEntries = computed<GroupedEntry[]>(() => {
    const groups = new Map<string, JournalEntry[]>()
    
    filteredEntries.value.forEach((entry) => {
      const dateKey = entry.date
      if (!groups.has(dateKey)) {
        groups.set(dateKey, [])
      }
      groups.get(dateKey)!.push(entry)
    })

    return Array.from(groups.entries())
      .map(([date, entries]) => {
        const entryDate = parseISO(date)
        let dateLabel = ''
        
        if (isToday(entryDate)) {
          dateLabel = 'Сегодня'
        } else if (isYesterday(entryDate)) {
          dateLabel = 'Вчера'
        } else if (isThisWeek(entryDate)) {
          dateLabel = format(entryDate, 'EEEE, d MMMM', { locale: ru })
          dateLabel = dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1)
        } else if (isThisMonth(entryDate)) {
          dateLabel = format(entryDate, 'd MMMM', { locale: ru })
        } else {
          dateLabel = format(entryDate, 'd MMMM yyyy', { locale: ru })
        }

        return {
          date,
          dateLabel,
          entries: entries.sort((a, b) => 
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          ),
        }
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  })

  // Активные фильтры
  const hasActiveFilters = computed(() => {
    return !!selectedMood.value || !!selectedDate.value || !!searchQuery.value
  })

  const clearFilters = () => {
    selectedMood.value = null
    selectedDate.value = null
    searchQuery.value = ''
  }

  return {
    // State
    searchQuery,
    selectedMood,
    selectedDate,
    isLoading,
    entries,
    filteredEntries,
    moodOptions,
    dateOptions,

    // Statistics
    monthlyCount,
    averageMood,
    averageMoodEmoji,

    // Grouping
    groupedEntries,

    // Filters
    hasActiveFilters,
    clearFilters,

    // Methods
    handleDeleteEntry,
  }
}
