import { ref, computed } from 'vue'
import { useModal } from '@/shared/lib/modal'
import { JournalEntryModal } from '@/features/journal/ui'
import type { JournalEntry, CreateJournalEntryDto } from '@/entities/journal'

const moodOptions = [
  { value: 5, label: '😊 Отлично' },
  { value: 4, label: '🙂 Хорошо' },
  { value: 3, label: '😐 Нормально' },
  { value: 2, label: '😔 Плохо' },
  { value: 1, label: '😢 Очень плохо' },
]

const dateOptions = [
  { value: 'today', label: 'Сегодня' },
  { value: 'week', label: 'Эта неделя' },
  { value: 'month', label: 'Этот месяц' },
]

export const useJournalPage = () => {
  const { openModal } = useModal()
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

  const handleCreateEntry = () => {
    return openModal<CreateJournalEntryDto & { id?: string }>({
      component: JournalEntryModal,
      props: {
        entry: null,
      },
      onConfirm: async (entryData?: CreateJournalEntryDto & { id?: string }) => {
        if (entryData) {
          handleSaveEntry(entryData)
        }
      },
    })
  }

  const handleSelectEntry = (entry: JournalEntry) => {
    return openModal<CreateJournalEntryDto & { id?: string }>({
      component: JournalEntryModal,
      props: {
        entry,
      },
      onConfirm: async (entryData?: CreateJournalEntryDto & { id?: string }) => {
        if (entryData) {
          handleSaveEntry(entryData)
        }
      },
    })
  }

  const handleEditEntry = (entry: JournalEntry) => {
    return openModal<CreateJournalEntryDto & { id?: string }>({
      component: JournalEntryModal,
      props: {
        entry,
      },
      onConfirm: async (entryData?: CreateJournalEntryDto & { id?: string }) => {
        if (entryData) {
          handleSaveEntry(entryData)
        }
      },
    })
  }

  const handleDeleteEntry = (entry: JournalEntry) => {
    console.log('Delete entry:', entry.id)
    entries.value = entries.value.filter((e) => e.id !== entry.id)
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

    // Methods
    handleCreateEntry,
    handleSelectEntry,
    handleEditEntry,
    handleDeleteEntry,
  }
}
