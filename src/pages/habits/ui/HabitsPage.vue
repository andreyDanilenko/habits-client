<template>
  <div class="max-w-7xl mx-auto space-y-6 pb-8">
    <HabitsPageHeader @add-habit="handleAddHabit" />

    <HabitsPageStats
      v-if="!isLoading && habits.length > 0"
      :total-count="totalCount"
      :completed-today="completedToday"
      :completion-rate="completionRate"
    />

    <HabitsPageFilters
      :selected-date="selectedDate"
      :show-all="showAll"
      :has-active-filters="hasActiveFilters"
      @date-change="handleDateChange"
      @show-all="handleShowAll"
      @reset-filter="handleResetFilter"
    />

    <div v-if="isLoading" class="text-center py-12">
      <Spinner />
      <p class="text-gray-500 mt-4">Загрузка привычек...</p>
    </div>

    <HabitsEmptyState
      v-else-if="habits.length === 0"
      :has-active-filters="hasActiveFilters"
      @add-habit="handleAddHabit"
      @clear-filters="handleResetFilter"
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
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { Spinner } from '@/shared/ui'
  import {
    HabitsPageHeader,
    HabitsPageStats,
    HabitsPageFilters,
    HabitsEmptyState,
    HabitsList,
  } from '@/features/habit/ui'
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
