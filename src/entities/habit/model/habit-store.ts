import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { habitService } from '@/entities/habit'
import type { Habit, HabitCompletion, CreateHabitDto, UpdateHabitDto } from '@/entities/habit'
import { getLocalDateString } from '@/shared/lib'
import { useWorkspaceStore } from '@/entities/workspace'

export const useHabitStore = defineStore('habit', () => {
  // State
  const habits = ref<Habit[]>([])
  const completions = ref<HabitCompletion[]>([])
  const isLoading = ref(false)
  const selectedDate = ref<Date>(new Date())
  const activityRefreshTrigger = ref(0)
  const workspaceStore = useWorkspaceStore()

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

  /** Текущая серия дней подряд (включая сегодня) с хотя бы одним выполненным действием по привычкам */
  const currentStreak = computed(() => {
    const dates = new Set<string>()
    completions.value.forEach((c) => dates.add(c.date))
    const sorted = Array.from(dates).sort()
    if (sorted.length === 0) return 0

    const todayStr = getLocalDateString(new Date())
    if (!dates.has(todayStr)) return 0

    let streak = 1
    const checkDate = new Date()
    checkDate.setDate(checkDate.getDate() - 1)

    while (true) {
      const dateStr = getLocalDateString(checkDate)
      if (dates.has(dateStr)) {
        streak++
        checkDate.setDate(checkDate.getDate() - 1)
      } else {
        break
      }
    }
    return streak
  })

  // Actions
  const fetchHabits = async (targetDate?: Date, options?: { background?: boolean }) => {
    if (!workspaceStore.currentWorkspace) {
      habits.value = []
      completions.value = []
      return
    }

    const isBackground = options?.background === true
    if (!isBackground) {
      isLoading.value = true
    }
    try {
      const dateToFetch = targetDate || selectedDate.value
      const dateString = getLocalDateString(dateToFetch)
      const workspaceId = workspaceStore.currentWorkspace.id
      const data = await habitService.getHabits(workspaceId, dateString)
      habits.value = data || []
      await fetchCompletions()
    } catch (error) {
      console.error('Failed to fetch habits:', error)
    } finally {
      if (!isBackground) {
        isLoading.value = false
      }
    }
  }

  const fetchAllHabits = async () => {
    if (!workspaceStore.currentWorkspace) {
      habits.value = []
      completions.value = []
      return
    }

    isLoading.value = true
    try {
      const workspaceId = workspaceStore.currentWorkspace.id
      const data = await habitService.getHabits(workspaceId)
      habits.value = data || []
      await fetchCompletions()
    } catch (error) {
      console.error('Failed to fetch all habits:', error)
    } finally {
      isLoading.value = false
    }
  }

  const fetchCompletions = async () => {
    if (!workspaceStore.currentWorkspace) {
      completions.value = []
      return
    }

    try {
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - 90)

      const workspaceId = workspaceStore.currentWorkspace.id
      const allCompletions = await habitService.getHabitCompletionsForHabit(
        workspaceId,
        '',
        getLocalDateString(startDate),
        getLocalDateString(endDate),
      )
      completions.value = allCompletions
    } catch (error) {
      console.error('Failed to fetch completions:', error)
    }
  }

  const createHabit = async (data: CreateHabitDto): Promise<Habit> => {
    const workspaceId = workspaceStore.currentWorkspace?.id
    if (!workspaceId) throw new Error('Workspace is not selected')

    try {
      const habitData: CreateHabitDto = {
        ...data,
        title: data.title ?? '',
        scheduleType: data.scheduleType ?? 'recurring',
        isActive: data.isActive ?? true,
      }

      const habit = await habitService.createHabit(workspaceId, habitData)
      habits.value.push(habit)
      activityRefreshTrigger.value++
      return habit
    } catch (error) {
      console.error('Failed to create habit:', error)
      throw error
    }
  }

  const updateHabit = async (id: string, data: UpdateHabitDto | Partial<Habit>): Promise<Habit> => {
    const workspaceId = workspaceStore.currentWorkspace?.id
    if (!workspaceId) throw new Error('Workspace is not selected')

    try {
      const habitData = Object.fromEntries(
        Object.entries(data).filter(([_, value]) => value !== undefined),
      )

      const updatedHabit = await habitService.updateHabit(workspaceId, id, habitData)

      const index = habits.value.findIndex((h) => h.id === id)
      if (index !== -1) habits.value[index] = updatedHabit
      activityRefreshTrigger.value++

      return updatedHabit
    } catch (error) {
      console.error('Failed to update habit:', error)
      throw error
    }
  }

  const deleteHabit = async (id: string): Promise<void> => {
    if (!workspaceStore.currentWorkspace) {
      throw new Error('Workspace is not selected')
    }

    try {
      const workspaceId = workspaceStore.currentWorkspace.id
      await habitService.deleteHabit(workspaceId, id)
      habits.value = habits.value.filter((h) => h.id !== id)
      completions.value = completions.value.filter((c) => c.habitId !== id)
      activityRefreshTrigger.value++
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
    if (!workspaceStore.currentWorkspace) {
      throw new Error('Workspace is not selected')
    }

    try {
      const today = getLocalDateString(selectedDate.value)
      const workspaceId = workspaceStore.currentWorkspace.id
      const completion = await habitService.createCompletion(workspaceId, data.habitId, {
        date: today,
        notes: data.note || '',
        rating: 0,
        time: data.time,
      })
      completions.value.push(completion)
      activityRefreshTrigger.value++

      await fetchCompletions()
    } catch (error) {
      console.error('Failed to mark completion:', error)
      throw error
    }
  }

  const toggleCompletion = async (habitId: string) => {
    if (!workspaceStore.currentWorkspace) {
      throw new Error('Workspace is not selected')
    }

    try {
      const today = getLocalDateString(selectedDate.value)
      const workspaceId = workspaceStore.currentWorkspace.id
      const response = await habitService.toggleCompletion(workspaceId, habitId, today)

      if (response.completed && response.completion) {
        completions.value.push(response.completion)
        activityRefreshTrigger.value++
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
    activityRefreshTrigger,

    // Getters
    todayHabits,
    completedToday,
    totalToday,
    currentStreak,

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
