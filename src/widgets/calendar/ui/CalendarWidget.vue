<template>
  <Card :border="true" :padding="true">
    <div class="flex items-center justify-between mb-4">
      <h3 class="font-semibold text-gray-900">Календарь привычек</h3>
      <div class="flex items-center space-x-2">
        <Button icon-only variant="icon" :left-icon="ArrowLeftIcon" @click="prevMonth" />
        <span class="font-medium">{{ formattedMonth }}</span>
        <Button icon-only variant="icon" :left-icon="ArrowRightIcon" @click="nextMonth" />
      </div>
    </div>

    <!-- Дни недели -->
    <div class="grid grid-cols-7 gap-1 mb-2">
      <div
        v-for="day in weekDays"
        :key="day"
        class="text-center text-xs font-medium text-gray-500 py-1"
      >
        {{ day }}
      </div>
    </div>

    <!-- Календарь -->
    <div class="grid grid-cols-7 gap-1 relative">
      <div
        v-for="(day, index) in calendarDays"
        :key="day.dateStr"
        :class="[
          'h-10 rounded-lg flex items-center justify-center text-sm font-medium relative z-10',
          'cursor-pointer transition-all duration-200',
          day.isToday ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'hover:bg-gray-50',
          day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400',
          day.isInStreak ? 'bg-gradient-to-br from-green-50 to-emerald-50' : '',
        ]"
        @click="selectDate(day.date)"
      >
        {{ day.day }}

        <!-- Streak индикатор - полоска снизу -->
        <div
          v-if="day.isInStreak"
          class="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 via-emerald-400 to-green-400 rounded-b-lg"
        />

        <!-- Индикатор привычек (если не в streak) -->
        <div
          v-if="day.habitCount > 0 && !day.isInStreak"
          class="absolute bottom-1 w-1.5 h-1.5 rounded-full"
          :class="day.allCompleted ? 'bg-green-500' : 'bg-gray-300'"
        />

        <!-- Соединительные линии для streak -->
        <!-- Горизонтальная линия вправо -->
        <div
          v-if="day.streakConnections?.right"
          class="absolute top-1/2 -right-0.5 w-1 h-1 bg-gradient-to-r from-green-400 to-emerald-400 rounded-r-full z-0"
          style="transform: translateY(-50%)"
        />
        <!-- Горизонтальная линия влево -->
        <div
          v-if="day.streakConnections?.left"
          class="absolute top-1/2 -left-0.5 w-1 h-1 bg-gradient-to-r from-emerald-400 to-green-400 rounded-l-full z-0"
          style="transform: translateY(-50%)"
        />
        <!-- Вертикальная линия вниз -->
        <div
          v-if="day.streakConnections?.down"
          class="absolute -bottom-0.5 left-1/2 h-1 w-1 bg-gradient-to-b from-green-400 to-emerald-400 rounded-b-full z-0"
          style="transform: translateX(-50%)"
        />
        <!-- Вертикальная линия вверх -->
        <div
          v-if="day.streakConnections?.up"
          class="absolute -top-0.5 left-1/2 h-1 w-1 bg-gradient-to-b from-emerald-400 to-green-400 rounded-t-full z-0"
          style="transform: translateX(-50%)"
        />
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
  import { ref, computed, watch, onMounted } from 'vue'
  import { Card, Button } from '@/shared/ui'
  import { ArrowLeftIcon, ArrowRightIcon } from '@/shared/ui/icon'
  import { habitService } from '@/entities/habit'
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
    isSameDay,
  } from 'date-fns'
  import { ru } from 'date-fns/locale'

  const currentDate = ref(new Date())
  const calendarData = ref<CalendarResponse | null>(null)
  const isLoading = ref(false)

  const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

  const loadCalendar = async () => {
    isLoading.value = true
    try {
      const monthStart = startOfMonth(currentDate.value)
      const monthEnd = endOfMonth(currentDate.value)

      const startStr = format(monthStart, 'yyyy-MM-dd')
      const endStr = format(monthEnd, 'yyyy-MM-dd')

      const response = await habitService.getCalendar(startStr, endStr)
      calendarData.value = response
    } catch (error) {
      console.error('Failed to load calendar:', error)
    } finally {
      isLoading.value = false
    }
  }

  const calendarDays = computed(() => {
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
    return allDays.map((date, index) => {
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
        if (nextDayIndex !== undefined && nextDayIndex < allDays.length && streakDays.has(nextDay)) {
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

  // Загружаем календарь при изменении месяца
  watch(
    currentDate,
    () => {
      loadCalendar()
    },
    { immediate: false },
  )

  onMounted(() => {
    loadCalendar()
  })
</script>
