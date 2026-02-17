import { ref, computed, watch, onMounted } from 'vue'
import { habitService } from '@/entities/habit'
import { useWorkspaceStore } from '@/entities/workspace'
import type { CalendarResponse } from '@/entities/habit'
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  startOfWeek,
  endOfWeek,
  addDays,
  subDays,
} from 'date-fns'
import { ru } from 'date-fns/locale'

export interface CalendarWidgetDay {
  date: Date
  dateStr: string
  day: string
  isToday: boolean
  isCurrentMonth: boolean
  habitCount: number
  allCompleted: boolean
  isInStreak: boolean
  streakConnections?: {
    left?: boolean
    right?: boolean
    up?: boolean
    down?: boolean
  }
}

export const useCalendarWidget = () => {
  const currentDate = ref(new Date())
  const calendarData = ref<CalendarResponse | null>(null)
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
      const workspaceId = workspaceStore.currentWorkspace.id

      const response = await habitService.getCalendar(workspaceId, startStr, endStr)
      calendarData.value = response
    } catch (error) {
      console.error('Failed to load calendar:', error)
    } finally {
      isLoading.value = false
    }
  }

  const calendarDays = computed((): CalendarWidgetDay[] => {
    const monthStart = startOfMonth(currentDate.value)
    const monthEnd = endOfMonth(currentDate.value)
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })

    // Создаем мапу данных календаря из API
    const calendarMap = new Map<string, { habitCount: number; allCompleted: boolean }>()

    if (calendarData.value) {
      calendarData.value.days.forEach((day) => {
        const completedHabits = day.habits.filter((h) => h.completed).length
        const totalHabits = day.habits.length
        calendarMap.set(day.date, {
          habitCount: totalHabits,
          allCompleted: totalHabits > 0 && completedHabits === totalHabits,
        })
      })
    }

    const allDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

    // Определяем streak'и (последовательные дни с выполненными привычками)
    const streakDays = new Set<string>()
    const dayIndexMap = new Map<string, number>()

    allDays.forEach((date, index) => {
      const dateStr = format(date, 'yyyy-MM-dd')
      dayIndexMap.set(dateStr, index)
      const dayData = calendarMap.get(dateStr)
      if (dayData?.allCompleted) {
        streakDays.add(dateStr)
      }
    })

    // Вычисляем соединения для streak'ов
    return allDays.map((date) => {
      const dateStr = format(date, 'yyyy-MM-dd')
      const dayData = calendarMap.get(dateStr) || { habitCount: 0, allCompleted: false }
      const isInStreak = streakDays.has(dateStr)

      // Проверяем соседние дни для соединений
      const prevDay = format(subDays(date, 1), 'yyyy-MM-dd')
      const nextDay = format(addDays(date, 1), 'yyyy-MM-dd')
      const prevDayIndex = dayIndexMap.get(prevDay)
      const nextDayIndex = dayIndexMap.get(nextDay)

      // Определяем направление соединений
      const connections: {
        left?: boolean
        right?: boolean
        up?: boolean
        down?: boolean
      } = {}

      if (isInStreak) {
        // Горизонтальные соединения (в пределах одной недели)
        const currentWeekDay = date.getDay() === 0 ? 7 : date.getDay()
        const isFirstInWeek = currentWeekDay === 1
        const isLastInWeek = currentWeekDay === 7

        if (!isFirstInWeek && streakDays.has(prevDay) && prevDayIndex !== undefined) {
          connections.left = true
        }
        if (!isLastInWeek && streakDays.has(nextDay) && nextDayIndex !== undefined) {
          connections.right = true
        }

        // Вертикальные соединения (между неделями)
        if (prevDayIndex !== undefined && prevDayIndex >= 0 && streakDays.has(prevDay)) {
          const prevDate = subDays(date, 1)
          const prevWeekDay = prevDate.getDay() === 0 ? 7 : prevDate.getDay()
          // Соединяем только если предыдущий день в той же колонке (день недели)
          if (prevWeekDay === currentWeekDay) {
            connections.up = true
          }
        }
        if (
          nextDayIndex !== undefined &&
          nextDayIndex < allDays.length &&
          streakDays.has(nextDay)
        ) {
          const nextDate = addDays(date, 1)
          const nextWeekDay = nextDate.getDay() === 0 ? 7 : nextDate.getDay()
          // Соединяем только если следующий день в той же колонке
          if (nextWeekDay === currentWeekDay) {
            connections.down = true
          }
        }
      }

      return {
        date,
        dateStr,
        day: format(date, 'd'),
        isToday: isToday(date),
        isCurrentMonth: isSameMonth(date, currentDate.value),
        habitCount: dayData.habitCount,
        allCompleted: dayData.allCompleted,
        isInStreak,
        streakConnections: Object.keys(connections).length > 0 ? connections : undefined,
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

  const selectDate = (date: Date) => {
    console.log('Selected date:', date)
    // TODO: Можно добавить логику выбора даты (например, показать модальное окно с привычками на эту дату)
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
    selectDate,
  }
}
