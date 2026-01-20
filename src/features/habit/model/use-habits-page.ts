import { computed, onMounted } from 'vue'
import { useHabitStore } from '@/entities/habit'
import { useHabitActions } from '@/features/habit/model/use-habit-actions'
import { useHabitProgress } from '@/features/habit/model/use-habit-progress'

export const useHabitsPage = () => {
  const habitStore = useHabitStore()
  const habitActions = useHabitActions()
  const { habitProgressMap } = useHabitProgress()

  const habits = computed(() => habitStore.habits)
  const isLoading = computed(() => habitStore.isLoading)

  onMounted(() => {
    habitStore.fetchHabits()
  })

  return {
    habits,
    isLoading,
    habitProgressMap,

    ...habitActions,
  }
}
