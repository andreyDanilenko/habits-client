import { ref, computed, watch, onMounted } from 'vue'
import { habitService } from '@/entities/habit'
import { useWorkspaceStore } from '@/entities/workspace'
import type { CalendarResponse, Habit, CalendarDay as ApiCalendarDay } from '@/entities/habit'
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  startOfWeek,
  endOfWeek,
} from 'date-fns'
import { ru } from 'date-fns/locale'

export interface CalendarDay {
  date: Date
  dateStr: string
  day: string
  isToday: boolean
  isCurrentMonth: boolean
  habits: Array<{
    id: string
    title: string
    completed: boolean
    scheduleType: 'recurring' | 'one_time'
    icon?: string
  }>
}

export const useCalendarPage = () => {
  const currentDate = ref(new Date())
  const calendarData = ref<CalendarResponse | null>(null)
  const allHabits = ref<Habit[]>([])
  const isLoading = ref(false)
  const workspaceStore = useWorkspaceStore()

  const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

  const loadCalendar = async () => {
    if (!workspaceStore.currentWorkspace) {
      return
    }

    isLoading.value = true
    try {
      const monthStart = startOfMonth(currentDate.value)
      const monthEnd = endOfMonth(currentDate.value)

      const startStr = format(monthStart, 'yyyy-MM-dd')
      const endStr = format(monthEnd, 'yyyy-MM-dd')

      const [calendarResponse, habitsResponse] = await Promise.all([
        habitService.getCalendar(startStr, endStr),
        habitService.getHabits(),
      ])

      calendarData.value = calendarResponse
      allHabits.value = habitsResponse
    } catch (error) {
      console.error('Failed to load calendar:', error)
    } finally {
      isLoading.value = false
    }
  }

  const calendarDays = computed((): CalendarDay[] => {
    const monthStart = startOfMonth(currentDate.value)
    const monthEnd = endOfMonth(currentDate.value)
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })

    const habitsByDate = new Map<string, ApiCalendarDay['habits']>()

    if (calendarData.value) {
      calendarData.value.days.forEach((day) => {
        habitsByDate.set(day.date, day.habits)
      })
    }

    const habitsMap = new Map<string, Habit>()
    allHabits.value.forEach((habit) => {
      habitsMap.set(habit.id, habit)
    })

    const allDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

    return allDays.map((date) => {
      const dateStr = format(date, 'yyyy-MM-dd')
      const dayHabits = habitsByDate.get(dateStr) || []

      const enrichedHabits = dayHabits.map((habit) => {
        const fullHabit = habitsMap.get(habit.id)
        const scheduleType = fullHabit?.scheduleType ?? 'recurring'
        const icon = fullHabit?.icon

        return {
          ...habit,
          scheduleType,
          icon,
        }
      })

      return {
        date,
        dateStr,
        day: format(date, 'd'),
        isToday: isToday(date),
        isCurrentMonth: isSameMonth(date, currentDate.value),
        habits: enrichedHabits,
      }
    })
  })

  const formattedMonth = computed(() => {
    return format(currentDate.value, 'LLLL yyyy', { locale: ru })
  })

  const prevMonth = () => {
    currentDate.value = new Date(
      currentDate.value.getFullYear(),
      currentDate.value.getMonth() - 1,
      1,
    )
  }

  const nextMonth = () => {
    currentDate.value = new Date(
      currentDate.value.getFullYear(),
      currentDate.value.getMonth() + 1,
      1,
    )
  }

  watch(
    currentDate,
    () => {
      loadCalendar()
    },
    { immediate: false },
  )

  watch(
    () => workspaceStore.currentWorkspace?.id,
    () => {
      loadCalendar()
    },
  )

  onMounted(() => {
    loadCalendar()
  })

  return {
    currentDate,
    calendarDays,
    formattedMonth,
    weekDays,
    isLoading,
    prevMonth,
    nextMonth,
  }
}
