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
    <div class="grid grid-cols-7 gap-1">
      <div
        v-for="day in calendarDays"
        :key="day.dateStr"
        :class="[
          'h-10 rounded-lg flex items-center justify-center text-sm font-medium relative',
          'cursor-pointer transition-colors',
          day.isToday ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-gray-50',
          day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400',
        ]"
        @click="selectDate(day.date)"
      >
        {{ day.day }}

        <!-- Индикатор привычек -->
        <div
          v-if="day.habitCount > 0"
          class="absolute bottom-1 w-1 h-1 rounded-full"
          :class="day.allCompleted ? 'bg-green-500' : 'bg-gray-300'"
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

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd }).map((date) => {
      const dateStr = format(date, 'yyyy-MM-dd')
      const dayData = calendarMap.get(dateStr) || { habitCount: 0, allCompleted: false }

      return {
        date,
        dateStr,
        day: format(date, 'd'),
        isToday: isToday(date),
        isCurrentMonth: isSameMonth(date, currentDate.value),
        habitCount: dayData.habitCount,
        allCompleted: dayData.allCompleted,
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
