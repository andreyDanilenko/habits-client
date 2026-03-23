<template>
  <Card :border="true" :padding="true">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-text-primary">{{ t('habits.widget.title') }}</h2>
    </div>

    <div v-if="isLoading" class="text-center py-8">
      <p class="text-text-secondary">{{ t('common.loading') }}</p>
    </div>

    <div v-else-if="habits.length === 0" class="text-center py-8">
      <p class="text-text-secondary mb-4">{{ t('habits.widget.empty') }}</p>
      <Button variant="link" size="md" @click="$emit('add-habit')">
        {{ t('common.actions.create') }}
      </Button>
    </div>

    <div v-else class="space-y-3" v-auto-animate>
      <div
        v-for="habit in habits"
        :key="habit.id"
        class="flex items-center justify-between flex-wrap gap-3 p-4 border border-border-default rounded-lg hover:bg-bg-secondary transition-colors"
      >
        <div class="flex-1 min-w-0">
          <div class="flex items-start gap-3 flex-wrap">
            <div
              class="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
              :style="{ backgroundColor: habit.color || 'var(--color-primary-default)' }"
            >
              {{ habit.icon || '📝' }}
            </div>
            <div class="flex-1">
              <div class="flex items-center gap-2 flex-wrap">
                <h3 class="text-text-primary break-words">
                  {{ habit.title }}
                </h3>
                <Badge
                  v-if="habit.ownerName && habit.ownerName !== 'null'"
                  variant="outline"
                  class="text-xs max-w-[120px] truncate"
                >
                  {{ habit.ownerName }}
                </Badge>
              </div>
              <div v-if="(habit.dailyGoal || 1) > 1" class="mt-2 flex items-center space-x-2">
                <span class="text-xs text-text-secondary">
                  {{ t('habits.widget.progress') }} {{ getProgress(habit.id) }}/{{ habit.dailyGoal || 1 }}
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
            </div>
          </div>
        </div>
        <div class="shrink-0 w-full sm:w-auto sm:ml-auto text-right">
          <Button
            v-if="getProgress(habit.id) < (habit.dailyGoal || 1)"
            variant="outline"
            size="md"
            @click="markCompletion(habit)"
          >
            {{ t('common.actions.mark') }}
          </Button>

          <span v-else class="text-success-default font-medium text-sm">{{ t('habits.widget.done') }}</span>
        </div>
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { useAppI18n } from '@/shared/lib/i18n'
  import { Badge } from '@/shared/ui'

  const { t } = useAppI18n()
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
