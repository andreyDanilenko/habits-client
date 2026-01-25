<template>
  <div class="max-w-7xl mx-auto space-y-6 pb-8">
    <JournalPageHeader @create-entry="handleCreateEntry" />

    <JournalPageStats
      v-if="!isLoading && filteredEntries.length > 0"
      :total-count="filteredEntries.length"
      :monthly-count="monthlyCount"
      :average-mood="averageMood"
      :average-mood-emoji="averageMoodEmoji"
    />

    <JournalPageFilters
      :search-query="searchQuery"
      :selected-mood="selectedMood"
      :selected-date="selectedDate"
      :mood-options="moodOptions"
      :date-options="dateOptions"
      :has-active-filters="hasActiveFilters"
      @update:search-query="searchQuery = $event"
      @update:selected-mood="selectedMood = $event"
      @update:selected-date="selectedDate = $event"
      @clear-filters="clearFilters"
    />

    <div v-if="isLoading" class="text-center py-12">
      <Spinner />
      <p class="text-gray-500 mt-4">Загрузка записей...</p>
    </div>

    <JournalPageEmptyState
      v-else-if="filteredEntries.length === 0"
      :has-active-filters="hasActiveFilters"
      @clear-filters="clearFilters"
      @create-entry="handleCreateEntry"
    />

    <JournalPageEntriesList
      v-else
      :grouped-entries="groupedEntries"
      @select-entry="handleSelectEntry"
      @edit-entry="handleEditEntry"
      @delete-entry="handleDeleteEntry"
    />
  </div>
</template>

<script setup lang="ts">
  import { useRouter } from 'vue-router'
  import { Spinner } from '@/shared/ui'
  import {
    JournalPageHeader,
    JournalPageStats,
    JournalPageFilters,
    JournalPageEmptyState,
    JournalPageEntriesList,
  } from '@/features/journal/ui'
  import { useJournalPage } from '@/features/journal/model'
  import type { JournalEntry } from '@/entities/journal'

  const router = useRouter()

  const {
    searchQuery,
    selectedMood,
    selectedDate,
    isLoading,
    filteredEntries,
    moodOptions,
    dateOptions,
    monthlyCount,
    averageMood,
    averageMoodEmoji,
    groupedEntries,
    hasActiveFilters,
    clearFilters,
    handleDeleteEntry,
  } = useJournalPage()

  const handleCreateEntry = () => {
    router.push({ name: 'JournalNew' })
  }

  const handleSelectEntry = (entry: JournalEntry) => {
    router.push({ name: 'JournalView', params: { id: entry.id } })
  }

  const handleEditEntry = (entry: JournalEntry) => {
    router.push({ name: 'JournalEdit', params: { id: entry.id } })
  }
</script>
