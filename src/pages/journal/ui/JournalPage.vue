<template>
  <div class="max-w-7xl mx-auto space-y-6 pb-8">
    <!-- Заголовок страницы -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Дневник</h1>
        <p class="text-gray-600 mt-1">Записывайте свои мысли, достижения и планы</p>
      </div>
      <Button @click="handleCreateEntry" class="w-full sm:w-auto">
        <PlusIcon class="w-5 h-5 mr-2" />
        Новая запись
      </Button>
    </div>

    <!-- Статистика -->
    <div v-if="!isLoading && filteredEntries.length > 0" class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card :border="true" :padding="true" class="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 mb-1">Всего записей</p>
            <p class="text-2xl font-bold text-gray-900">{{ filteredEntries.length }}</p>
          </div>
          <div class="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
            <span class="text-2xl">📝</span>
          </div>
        </div>
      </Card>
      <Card :border="true" :padding="true" class="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 mb-1">За этот месяц</p>
            <p class="text-2xl font-bold text-gray-900">{{ monthlyCount }}</p>
          </div>
          <div class="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
            <span class="text-2xl">📅</span>
          </div>
        </div>
      </Card>
      <Card :border="true" :padding="true" class="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 mb-1">Среднее настроение</p>
            <p class="text-2xl font-bold text-gray-900">{{ averageMood }}</p>
          </div>
          <div class="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
            <span class="text-2xl">{{ averageMoodEmoji }}</span>
          </div>
        </div>
      </Card>
    </div>

    <!-- Фильтры и поиск -->
    <Card :border="true" :padding="true" class="bg-white">
      <div class="flex flex-col gap-4">
        <!-- Поиск -->
        <div class="relative">
          <Input
            v-model="searchQuery"
            placeholder="Поиск по записям, тегам, содержимому..."
            class="w-full pl-10"
          />
          <div class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <button
            v-if="searchQuery"
            @click="searchQuery = ''"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Фильтры -->
        <div class="flex flex-wrap gap-3">
          <!-- Фильтр по настроению -->
          <div class="flex-1 min-w-[200px]">
            <label class="block text-xs font-medium text-gray-700 mb-1">Настроение</label>
            <select
              v-model="selectedMood"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
            >
              <option :value="null">Все настроения</option>
              <option v-for="mood in moodOptions" :key="mood.value" :value="mood.value">
                {{ mood.label }}
              </option>
            </select>
          </div>

          <!-- Фильтр по дате -->
          <div class="flex-1 min-w-[200px]">
            <label class="block text-xs font-medium text-gray-700 mb-1">Период</label>
            <select
              v-model="selectedDate"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
            >
              <option :value="null">Все даты</option>
              <option v-for="date in dateOptions" :key="date.value" :value="date.value">
                {{ date.label }}
              </option>
            </select>
          </div>

          <!-- Сброс фильтров -->
          <div class="flex items-end">
            <Button
              v-if="hasActiveFilters"
              variant="outline"
              @click="clearFilters"
              class="whitespace-nowrap"
            >
              Сбросить фильтры
            </Button>
          </div>
        </div>

        <!-- Индикаторы активных фильтров -->
        <div v-if="hasActiveFilters" class="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
          <Badge
            v-if="selectedMood"
            variant="outline"
            class="bg-indigo-50 text-indigo-700 border-indigo-200"
          >
            Настроение: {{ moodOptions.find(m => m.value === selectedMood)?.label }}
            <button @click="selectedMood = null" class="ml-2 hover:text-indigo-900">×</button>
          </Badge>
          <Badge
            v-if="selectedDate"
            variant="outline"
            class="bg-emerald-50 text-emerald-700 border-emerald-200"
          >
            Период: {{ dateOptions.find(d => d.value === selectedDate)?.label }}
            <button @click="selectedDate = null" class="ml-2 hover:text-emerald-900">×</button>
          </Badge>
          <Badge
            v-if="searchQuery"
            variant="outline"
            class="bg-amber-50 text-amber-700 border-amber-200"
          >
            Поиск: "{{ searchQuery }}"
            <button @click="searchQuery = ''" class="ml-2 hover:text-amber-900">×</button>
          </Badge>
        </div>
      </div>
    </Card>

    <!-- Список записей -->
    <div v-if="isLoading" class="text-center py-12">
      <Spinner />
      <p class="text-gray-500 mt-4">Загрузка записей...</p>
    </div>

    <!-- Пустое состояние -->
    <div v-else-if="filteredEntries.length === 0" class="text-center py-16">
      <Card :border="true" :padding="true" class="max-w-md mx-auto">
        <div class="text-6xl mb-4">📔</div>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">
          {{ hasActiveFilters ? 'Ничего не найдено' : 'Пока нет записей' }}
        </h3>
        <p class="text-gray-600 mb-6">
          {{ hasActiveFilters 
            ? 'Попробуйте изменить фильтры или поисковый запрос' 
            : 'Начните вести дневник и записывайте свои мысли, достижения и планы' 
          }}
        </p>
        <div class="flex gap-3 justify-center">
          <Button v-if="hasActiveFilters" variant="outline" @click="clearFilters">
            Сбросить фильтры
          </Button>
          <Button @click="handleCreateEntry">
            <PlusIcon class="w-5 h-5 mr-2" />
            Создать первую запись
          </Button>
        </div>
      </Card>
    </div>

    <!-- Группированные записи по датам -->
    <div v-else class="space-y-8">
      <div v-for="group in groupedEntries" :key="group.date" class="space-y-4">
        <!-- Заголовок группы -->
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

        <!-- Записи группы -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <JournalEntryCard
            v-for="entry in group.entries"
            :key="entry.id"
            :entry="entry"
            @click="handleSelectEntry(entry)"
            @edit="handleEditEntry(entry)"
            @delete="handleDeleteEntry(entry)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { format, isToday, isYesterday, isThisWeek, isThisMonth, parseISO } from 'date-fns'
  import { ru } from 'date-fns/locale'
  import { JournalEntryCard } from '@/features/journal/ui'
  import { useJournalPage } from '@/features/journal/model'
  import { Card, Button, Input, Spinner, Badge } from '@/shared/ui'
  import { PlusIcon } from '@/shared/ui/icon'
  import type { JournalEntry } from '@/entities/journal'

  const {
    searchQuery,
    selectedMood,
    selectedDate,
    isLoading,
    filteredEntries,
    moodOptions,
    dateOptions,
    handleCreateEntry,
    handleSelectEntry,
    handleEditEntry,
    handleDeleteEntry,
  } = useJournalPage()

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
  interface GroupedEntry {
    date: string
    dateLabel: string
    entries: JournalEntry[]
  }

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
</script>
