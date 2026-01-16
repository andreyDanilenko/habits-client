import { onMounted } from 'vue'
import { useHabitStore } from '@/entities/habit'
import { useHabitActions } from '@/features/habit/model/use-habit-actions'
import { useHabitProgress } from '@/features/habit/model/use-habit-progress'

export const useHabitsPage = () => {
  const habitStore = useHabitStore()
  const habitActions = useHabitActions()
  const { habitProgressMap } = useHabitProgress()

  const habits = habitStore.habits
  const isLoading = habitStore.isLoading

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
