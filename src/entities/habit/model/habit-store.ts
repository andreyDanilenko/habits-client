import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { habitService } from '@/entities/habit/api/habit-service'
import type { Habit, HabitCompletion, CreateHabitDto } from '@/entities/habit'

export const useHabitStore = defineStore('habit', () => {
  // State
  const habits = ref<Habit[]>([])
  const completions = ref<HabitCompletion[]>([])
  const isLoading = ref(false)
  const selectedDate = ref<Date>(new Date())

  // Getters
  const todayHabits = computed((): Array<Habit & { completed: boolean }> => {
    const today = selectedDate.value.toISOString().split('T')[0]
    return habits.value.map((habit) => ({
      ...habit,
      completed: completions.value.some((c) => c.habitId === habit.id && c.date === today),
    }))
  })

  const completedToday = computed(() => todayHabits.value.filter((h) => h.completed).length)

  const totalToday = computed(() => todayHabits.value.length)

  // Actions
  const fetchHabits = async () => {
    isLoading.value = true
    try {
      const data = await habitService.getHabits()
      habits.value = data
      completions.value = []
    } catch (error) {
      console.error('Failed to fetch habits:', error)
    } finally {
      isLoading.value = false
    }
  }

  const createHabit = async (data: CreateHabitDto): Promise<Habit> => {
    try {
      const habit = await habitService.createHabit(data)
      habits.value.push(habit)
      return habit
    } catch (error) {
      console.error('Failed to create habit:', error)
      throw error
    }
  }

  const toggleCompletion = async (habitId: string) => {
    try {
      const response = await habitService.toggleCompletion(habitId)

      const today = selectedDate.value.toISOString().split('T')[0]

      if (response.completed && response.completion) {
        completions.value.push(response.completion)
      } else {
        completions.value = completions.value.filter(
          (c) => !(c.habitId === habitId && c.date === today),
        )
      }
    } catch (error) {
      console.error('Failed to toggle completion:', error)
      throw error
    }
  }

  const setSelectedDate = (date: Date) => {
    selectedDate.value = date
  }

  return {
    // State
    habits,
    completions,
    isLoading,
    selectedDate,

    // Getters
    todayHabits,
    completedToday,
    totalToday,

    // Actions
    fetchHabits,
    createHabit,
    toggleCompletion,
    setSelectedDate,
  }
})
