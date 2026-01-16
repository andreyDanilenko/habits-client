import { computed } from 'vue'
import { useHabitStore } from '@/entities/habit'

export const useHabitProgress = () => {
  const habitStore = useHabitStore()

  const habitProgressMap = computed(() => {
    const today = new Date().toISOString().split('T')[0]
    const map: Record<string, number> = {}

    habitStore.completions.forEach((c) => {
      if (c.date === today) {
        map[c.habitId] = (map[c.habitId] || 0) + 1
      }
    })

    return map
  })

  return {
    habitProgressMap,
  }
}
