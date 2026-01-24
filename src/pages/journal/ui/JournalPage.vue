<template>
  <div class="max-w-7xl mx-auto space-y-6">
    <!-- Заголовок страницы -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Дневник</h1>
        <p class="text-gray-600 mt-1">Записывайте свои мысли, достижения и планы</p>
      </div>
      <Button @click="handleCreateEntry">
        <PlusIcon class="w-5 h-5 mr-2" />
        Новая запись
      </Button>
    </div>

    <!-- Фильтры и поиск -->
    <Card :border="true" :padding="true">
      <div class="flex flex-col md:flex-row gap-4">
        <div class="flex-1">
          <Input
            v-model="searchQuery"
            placeholder="Поиск по записям..."
            class="w-full"
          />
        </div>
        <div class="flex gap-2">
          <select
            v-model="selectedMood"
            class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option :value="null">Все настроения</option>
            <option v-for="mood in moodOptions" :key="mood.value" :value="mood.value">
              {{ mood.label }}
            </option>
          </select>
          <select
            v-model="selectedDate"
            class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option :value="null">Все даты</option>
            <option v-for="date in dateOptions" :key="date.value" :value="date.value">
              {{ date.label }}
            </option>
          </select>
        </div>
      </div>
    </Card>

    <!-- Список записей -->
    <div v-if="isLoading" class="text-center py-12">
      <Spinner />
    </div>

    <div v-else-if="filteredEntries.length === 0" class="text-center py-12">
      <Card :border="true" :padding="true">
        <p class="text-gray-500 mb-4">Нет записей</p>
        <Button variant="outline" @click="handleCreateEntry">
          Создать первую запись
        </Button>
      </Card>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <JournalEntryCard
        v-for="entry in filteredEntries"
        :key="entry.id"
        :entry="entry"
        @click="handleSelectEntry(entry)"
        @edit="handleEditEntry(entry)"
        @delete="handleDeleteEntry(entry)"
      />
    </div>

    <JournalEntryModal
      :is-open="isModalOpen"
      :entry="selectedEntry"
      @update:is-open="isModalOpen = $event"
      @close="handleCloseModal"
      @save="handleSaveEntry"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  import { Card, Button, Input, Spinner } from '@/shared/ui'
  import { PlusIcon } from '@/shared/ui/icon'
  import { JournalEntryCard } from '@/features/journal/ui'
  import { JournalEntryModal } from '@/features/journal/ui'
  import type { JournalEntry } from '@/entities/journal'

  const searchQuery = ref('')
  const selectedMood = ref<number | null>(null)
  const selectedDate = ref<string | null>(null)
  const isLoading = ref(false)
  const isCreating = ref(false)
  const selectedEntry = ref<JournalEntry | null>(null)
  const isModalOpen = ref(false)

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
    },
  ])

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

  const handleCreateEntry = () => {
    isCreating.value = true
    selectedEntry.value = null
    isModalOpen.value = true
  }

  const handleSelectEntry = (entry: JournalEntry) => {
    selectedEntry.value = entry
    isModalOpen.value = true
  }

  const handleEditEntry = (entry: JournalEntry) => {
    selectedEntry.value = entry
    isCreating.value = false
    isModalOpen.value = true
  }

  const handleDeleteEntry = (entry: JournalEntry) => {
    // TODO: Реализовать удаление
    console.log('Delete entry:', entry.id)
    entries.value = entries.value.filter((e) => e.id !== entry.id)
  }

  const handleCloseModal = () => {
    selectedEntry.value = null
    isCreating.value = false
    isModalOpen.value = false
  }

  const handleSaveEntry = (entryData: JournalEntry & { id?: string }) => {
    if (entryData.id) {
      // Обновление существующей записи
      const index = entries.value.findIndex((e) => e.id === entryData.id)
      if (index !== -1) {
        entries.value[index] = {
          ...entryData,
          id: entryData.id,
          updatedAt: new Date().toISOString(),
        } as JournalEntry
      }
    } else {
      // Создание новой записи
      const newEntry: JournalEntry = {
        ...entryData,
        id: Date.now().toString(),
        userId: 'current-user-id', // TODO: получить из store
        workspaceId: 'current-workspace-id', // TODO: получить из store
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      entries.value.push(newEntry)
    }
    handleCloseModal()
  }
</script>
