import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { habitService } from '@/entities/habit'
import type { Habit, HabitCompletion, CreateHabitDto, UpdateHabitDto } from '@/entities/habit'

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
      habits.value = data || []
      completions.value = []
    } catch (error) {
      console.error('Failed to fetch habits:', error)
    } finally {
      isLoading.value = false
    }
  }

  const createHabit = async (data: CreateHabitDto | Partial<Habit>): Promise<Habit> => {
    try {
      // Convert Partial<Habit> to CreateHabitDto
      const habitData: CreateHabitDto = {
        title: data.title || '',
        description: data.description,
        color: data.color,
        icon: data.icon,
        targetDays: data.targetDays,
        dailyGoal: data.dailyGoal,
        preferredTime: data.preferredTime,
        category: data.category,
      }
      const habit = await habitService.createHabit(habitData)
      habits.value.push(habit)
      return habit
    } catch (error) {
      console.error('Failed to create habit:', error)
      throw error
    }
  }

  const updateHabit = async (id: string, data: UpdateHabitDto | Partial<Habit>): Promise<Habit> => {
    try {
      // Convert Partial<Habit> to UpdateHabitDto
      const habitData: UpdateHabitDto = {
        title: data.title,
        description: data.description,
        color: data.color,
        icon: data.icon,
        targetDays: data.targetDays,
        dailyGoal: data.dailyGoal,
        preferredTime: data.preferredTime,
        category: data.category,
      }
      const habit = await habitService.updateHabit(id, habitData)
      const index = habits.value.findIndex((h) => h.id === id)
      if (index !== -1) {
        habits.value[index] = habit
      }
      return habit
    } catch (error) {
      console.error('Failed to update habit:', error)
      throw error
    }
  }

  const deleteHabit = async (id: string): Promise<void> => {
    try {
      await habitService.deleteHabit(id)
      habits.value = habits.value.filter((h) => h.id !== id)
      completions.value = completions.value.filter((c) => c.habitId !== id)
    } catch (error) {
      console.error('Failed to delete habit:', error)
      throw error
    }
  }

  const markCompletion = async (data: {
    habitId: string
    count: number
    time?: string
    note?: string
    feeling?: string
  }): Promise<void> => {
    try {
      // For now, create multiple completions based on count
      // This should be handled by the backend, but we'll do it on frontend for now
      for (let i = 0; i < data.count; i++) {
        // In a real implementation, this would call an API endpoint
        // For now, we'll just toggle the completion
        await toggleCompletion(data.habitId)
      }
    } catch (error) {
      console.error('Failed to mark completion:', error)
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
    updateHabit,
    deleteHabit,
    markCompletion,
    toggleCompletion,
    setSelectedDate,
  }
})
