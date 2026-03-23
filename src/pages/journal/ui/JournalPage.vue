<template>
  <BasePageLayout :title="t('journal.page.title')" :description="t('journal.page.description')">
    <template #header-actions>
      <Button class="w-full sm:w-auto" @click="openCreateModal">
        {{ t('journal.page.addEntry') }}
      </Button>
    </template>

    <template #content>
      <JournalPageStats
        v-if="!isLoading && filteredEntries.length > 0"
        :total-count="filteredEntries.length"
        :monthly-count="monthlyCount"
        :average-mood="averageMood"
        :average-mood-emoji="averageMoodEmoji"
      />

      <PageFilters
        :enabled-filters="[PageFiltersEnum.SEARCH, PageFiltersEnum.MOOD, PageFiltersEnum.PERIOD]"
        :has-active-filters="hasActiveFilters"
        :search-query="searchQuery"
        :selected-mood="selectedMood"
        :selected-period="selectedDate"
        :mood-options="moodOptions"
        :period-options="dateOptions"
        :search-placeholder="t('journal.page.searchPlaceholder')"
        @update:search-query="searchQuery = $event"
        @update:selected-mood="selectedMood = $event"
        @update:selected-period="selectedDate = $event"
        @clear-filters="clearFilters"
      />

      <div v-if="isLoading" class="text-center py-12">
        <Spinner />
        <p class="text-gray-500 mt-4">{{ t('journal.page.loadingEntries') }}</p>
      </div>

      <EmptyState
        v-else-if="filteredEntries.length === 0"
        :title="hasActiveFilters ? t('journal.page.emptyFilteredTitle') : t('journal.page.emptyTitle')"
        :description="
          hasActiveFilters
            ? t('journal.page.emptyFilteredHint')
            : t('journal.page.emptyHint')
        "
        :action-button-text="t('journal.page.createEntryAction')"
        :show-clear-filters="hasActiveFilters"
        @clear-filters="clearFilters"
        @action="openCreateModal"
      />

      <JournalPageEntriesList
        v-else
        :grouped-entries="groupedEntries"
        @edit-entry="editEntry"
        @delete-entry="deleteEntry"
      />
    </template>
  </BasePageLayout>
</template>

<script setup lang="ts">
  import { BasePageLayout } from '@/shared/ui/common'
  import { Spinner, EmptyState, PageFilters, PageFiltersEnum, Button } from '@/shared/ui'
  import { JournalPageStats, JournalPageEntriesList } from '@/features/journal/ui'
  import { useJournalPage, useJournalActions } from '@/features/journal/model'
  import { useAppI18n } from '@/shared/lib/i18n'

  const { t } = useAppI18n()

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
    handleSaveEntry,
  } = useJournalPage()

  const {
    handleCreateEntry: openCreateModal,
    editEntry,
    deleteEntry,
  } = useJournalActions({
    handleSaveEntry,
    handleDeleteEntry,
  })
</script>
