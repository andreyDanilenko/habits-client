<template>
  <div class="max-w-7xl mx-auto space-y-6">
    <HabitsPageHeader
      :selected-date="selectedDate"
      :show-all="showAll"
      @add-habit="handleAddHabit"
      @date-change="handleDateChange"
      @show-all="handleShowAll"
      @reset-filter="handleResetFilter"
    />

    <div v-if="isLoading" class="text-center py-12">
      <p class="text-gray-500">Загрузка...</p>
    </div>

    <HabitsEmptyState v-else-if="habits.length === 0" @add-habit="handleAddHabit" />

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
  import { HabitsPageHeader, HabitsEmptyState, HabitsList } from '@/features/habit/ui'
  import { useHabitsPage } from '@/features/habit/model'

  const {
    habits,
    isLoading,
    habitProgressMap,
    selectedDate,
    showAll,
    handleDateChange,
    handleShowAll,
    handleResetFilter,
    handleAddHabit,
    editHabit,
    deleteHabit,
    markCompletion,
    selectHabit,
  } = useHabitsPage()
</script>
