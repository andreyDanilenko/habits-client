<template>
  <BasePageLayout
    title="Мои привычки"
    description="Управляйте своими привычками и отслеживайте прогресс"
  >
    <template #header-actions>
      <Button class="w-full sm:w-auto" @click="handleAddHabit">Добавить привычку</Button>
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
        <p class="text-gray-500 mt-4">Загрузка привычек...</p>
      </div>

      <EmptyState
        v-else-if="habits.length === 0"
        :title="hasActiveFilters ? 'Привычки не найдены' : 'Нет привычек'"
        :description="
          hasActiveFilters
            ? 'Попробуйте изменить фильтры или сбросить их'
            : 'Создайте свою первую привычку, чтобы начать отслеживать прогресс'
        "
        action-button-text="Создать привычку"
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
  import { BasePageLayout } from '@/shared/ui/common'
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
