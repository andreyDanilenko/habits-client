<template>
  <BasePageLayout :title="t('habits.page.title')" :description="t('habits.page.description')">
    <template #header-actions>
      <Button class="w-full sm:w-auto" @click="handleAddHabit">{{
        t('common.actions.create')
      }}</Button>
    </template>

    <template #content>
      <HabitsPageStats
        v-if="!isLoading && habits.length > 0"
        :total-count="totalCount"
        :completed-today="completedToday"
        :completion-rate="completionRate"
      />

      <PageFilters
        :enabled-filters="[PageFiltersEnum.DATE, PageFiltersEnum.SHOW_ALL]"
        :has-active-filters="hasActiveFilters"
        :selected-date="selectedDate"
        :show-all="showAll"
        @date-change="handleDateChange"
        @show-all="handleShowAll"
        @reset-filter="handleResetFilter"
        @clear-filters="handleResetFilter"
      />

      <div v-if="isLoading" class="text-center py-12">
        <Spinner />
        <p class="text-gray-500 mt-4">{{ t('habits.page.loading') }}</p>
      </div>

      <EmptyState
        v-else-if="habits.length === 0"
        :title="hasActiveFilters ? t('habits.empty.filteredTitle') : t('habits.empty.noHabitsTitle')"
        :description="
          hasActiveFilters ? t('habits.empty.filteredHint') : t('habits.empty.noHabitsHint')
        "
        :action-button-text="t('common.actions.create')"
        :show-clear-filters="hasActiveFilters"
        @clear-filters="handleResetFilter"
        @action="handleAddHabit"
      />

      <HabitsList
        v-else
        :habits="habits"
        :progress-map="habitProgressMap"
        @select-habit="selectHabit"
        @edit-habit="editHabit"
        @delete-habit="deleteHabit"
        @mark-completion="markCompletion"
      />
    </template>
  </BasePageLayout>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { useAppI18n } from '@/shared/lib/i18n'
  import { BasePageLayout } from '@/shared/ui/common'

  const { t } = useAppI18n()
  import { Spinner, EmptyState, PageFilters, PageFiltersEnum, Button } from '@/shared/ui'
  import { HabitsPageStats, HabitsList } from '@/features/habit/ui'
  import { useHabitsPage } from '@/features/habit/model'

  const {
    habits,
    isLoading,
    habitProgressMap,
    selectedDate,
    showAll,
    totalCount,
    completedToday,
    completionRate,
    handleDateChange,
    handleShowAll,
    handleResetFilter,
    handleAddHabit,
    editHabit,
    deleteHabit,
    markCompletion,
    selectHabit,
  } = useHabitsPage()

  const hasActiveFilters = computed(() => {
    return !!(selectedDate.value || showAll.value)
  })
</script>
