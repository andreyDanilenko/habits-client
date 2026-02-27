<template>
  <Card :border="true" :padding="true">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-text-primary">Привычки на сегодня</h2>
    </div>

    <div v-if="isLoading" class="text-center py-8">
      <p class="text-text-secondary">Загрузка...</p>
    </div>

    <div v-else-if="habits.length === 0" class="text-center py-8">
      <p class="text-text-secondary mb-4">Нет привычек на сегодня</p>
      <Button variant="link" size="sm" @click="$emit('add-habit')">
        Создать первую привычку
      </Button>
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="habit in habits"
        :key="habit.id"
        class="flex items-center justify-between p-4 border border-border-default rounded-lg hover:bg-bg-secondary transition-colors"
      >
        <div class="flex-1">
          <div class="flex items-center space-x-3">
            <div
              class="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
              :style="{ backgroundColor: habit.color || 'var(--color-primary-default)' }"
            >
              {{ habit.icon || '📝' }}
            </div>
            <div class="flex-1">
              <h3 class="text-text-primary">{{ habit.title }}</h3>
              <div v-if="(habit.dailyGoal || 1) > 1" class="mt-2 flex items-center space-x-2">
                <span class="text-xs text-text-secondary">
                  Прогресс: {{ getProgress(habit.id) }}/{{ habit.dailyGoal || 1 }}
                </span>
                <div class="flex-1 h-1.5 bg-bg-tertiary rounded-full overflow-hidden max-w-24">
                  <div
                    class="h-full rounded-full transition-all"
                    :style="{
                      width: `${Math.min((getProgress(habit.id) / (habit.dailyGoal || 1)) * 100, 100)}%`,
                      backgroundColor: habit.color || 'var(--color-primary-default)',
                    }"
                  />
                </div>
              </div>
              <div v-else class="mt-2">
                <span
                  class="text-xs"
                  :class="
                    getProgress(habit.id) >= 1 ? 'text-success-default font-medium' : 'text-text-muted'
                  "
                >
                  {{ getProgress(habit.id) >= 1 ? '✓ Выполнено' : 'Не выполнено' }}
                </span>
              </div>
            </div>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          @click="markCompletion(habit)"
          :disabled="getProgress(habit.id) >= (habit.dailyGoal || 1)"
        >
          {{ getProgress(habit.id) >= (habit.dailyGoal || 1) ? '✓ Выполнено' : 'Отметить' }}
        </Button>
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { useHabitStore } from '@/entities/habit'
  import { useHabitActions } from '@/features/habit/model/use-habit-actions'
  import { useHabitProgress } from '@/features/habit/model/use-habit-progress'
  import { Button, Card } from '@/shared/ui'
  import type { Habit } from '@/entities/habit'

  const habitStore = useHabitStore()
  const habitActions = useHabitActions()
  const { habitProgressMap } = useHabitProgress()

  const habits = computed(() => habitStore.todayHabits)
  const isLoading = computed(() => habitStore.isLoading)

  const getProgress = (habitId: string) => {
    return habitProgressMap.value[habitId] || 0
  }

  const markCompletion = (habit: Habit) => {
    habitActions.markCompletion(habit)
  }
</script>
