import { computed } from 'vue'
import { useHabitStore } from '@/entities/habit'
import { getLocalDateString } from '@/shared/lib'

export const useHabitProgress = () => {
  const habitStore = useHabitStore()

  const habitProgressMap = computed(() => {
    const today = getLocalDateString()
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
