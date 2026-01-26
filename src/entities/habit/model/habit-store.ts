import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { habitService } from '@/entities/habit'
import type { Habit, HabitCompletion, CreateHabitDto, UpdateHabitDto } from '@/entities/habit'
import { getLocalDateString } from '@/shared/lib'

export const useHabitStore = defineStore('habit', () => {
  // State
  const habits = ref<Habit[]>([])
  const completions = ref<HabitCompletion[]>([])
  const isLoading = ref(false)
  const selectedDate = ref<Date>(new Date())

  // Getters
  const todayHabits = computed((): Array<Habit & { completed: boolean }> => {
    const today = getLocalDateString(selectedDate.value)
    return habits.value.map((habit) => ({
      ...habit,
      completed: completions.value.some((c) => c.habitId === habit.id && c.date === today),
    }))
  })

  const completedToday = computed(() => todayHabits.value.filter((h) => h.completed).length)

  const totalToday = computed(() => todayHabits.value.length)

  // Actions
  const fetchHabits = async (targetDate?: Date) => {
    isLoading.value = true
    try {
      const dateToFetch = targetDate || selectedDate.value
      const dateString = getLocalDateString(dateToFetch)
      const data = await habitService.getHabits(dateString)
      habits.value = data || []
      await fetchCompletions()
    } catch (error) {
      console.error('Failed to fetch habits:', error)
    } finally {
      isLoading.value = false
    }
  }

  const fetchAllHabits = async () => {
    isLoading.value = true
    try {
      const data = await habitService.getHabits()
      habits.value = data || []
      await fetchCompletions()
    } catch (error) {
      console.error('Failed to fetch all habits:', error)
    } finally {
      isLoading.value = false
    }
  }

  const fetchCompletions = async () => {
    try {
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - 90)

      const allCompletions = await habitService.getHabitCompletionsForHabit(
        '',
        getLocalDateString(startDate),
        getLocalDateString(endDate),
      )
      completions.value = allCompletions
    } catch (error) {
      console.error('Failed to fetch completions:', error)
    }
  }

  const createHabit = async (data: CreateHabitDto | Partial<Habit>): Promise<Habit> => {
    try {
      const habitData: CreateHabitDto = {
        title: data.title || '',
        description: data.description,
        color: data.color,
        icon: data.icon,
        targetDays: data.targetDays,
        dailyGoal: data.dailyGoal,
        preferredTime: data.preferredTime,
        category: data.category,
        scheduleType: (data as any).scheduleType || 'recurring',
        recurringDays: (data as any).recurringDays,
        oneTimeDate: (data as any).oneTimeDate,
        isActive: (data as any).isActive ?? true,
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
      const habitData: any = {}

      if (data.title !== undefined) habitData.title = data.title
      if (data.description !== undefined) habitData.description = data.description
      if (data.color !== undefined) habitData.color = data.color
      if (data.icon !== undefined) habitData.icon = data.icon
      if (data.targetDays !== undefined) habitData.targetDays = data.targetDays
      if (data.dailyGoal !== undefined) habitData.dailyGoal = data.dailyGoal
      if (data.preferredTime !== undefined) habitData.preferredTime = data.preferredTime
      if (data.category !== undefined) habitData.category = data.category
      if ((data as any).scheduleType !== undefined)
        habitData.scheduleType = (data as any).scheduleType
      if ((data as any).recurringDays !== undefined)
        habitData.recurringDays = (data as any).recurringDays
      if ((data as any).oneTimeDate !== undefined) habitData.oneTimeDate = (data as any).oneTimeDate
      if ((data as any).isActive !== undefined) habitData.isActive = (data as any).isActive

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
    time?: string
    note?: string
  }): Promise<void> => {
    try {
      const today = getLocalDateString(selectedDate.value)
      // Создаем одно completion при каждом нажатии "Отметить"
      const completion = await habitService.createCompletion(data.habitId, {
        date: today,
        notes: data.note || '',
        rating: 0, // Рейтинг не используется, передаем 0
        time: data.time,
      })
      completions.value.push(completion)

      await fetchCompletions()
    } catch (error) {
      console.error('Failed to mark completion:', error)
      throw error
    }
  }

  const toggleCompletion = async (habitId: string) => {
    try {
      const today = getLocalDateString(selectedDate.value)
      const response = await habitService.toggleCompletion(habitId, today)

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
    fetchAllHabits,
    fetchCompletions,
    createHabit,
    updateHabit,
    deleteHabit,
    markCompletion,
    toggleCompletion,
    setSelectedDate,
  }
})
