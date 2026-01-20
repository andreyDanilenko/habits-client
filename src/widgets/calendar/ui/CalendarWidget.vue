<template>
  <Card class="p-4">
    <div class="flex items-center justify-between mb-4">
      <h3 class="font-semibold text-gray-900">Календарь привычек</h3>
      <div class="flex items-center space-x-2">
        <button @click="prevMonth" class="p-1 hover:bg-gray-100 rounded">
          <svg
            class="w-5 h-5 size-6"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
        </button>
        <span class="font-medium">{{ formattedMonth }}</span>
        <button @click="nextMonth" class="p-1 hover:bg-gray-100 rounded">
          <svg
            class="w-5 h-5 size-6"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
          </svg>
        </button>
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
  import { ref, computed } from 'vue'
  import { Card } from '@/shared/ui'
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

  const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

  const calendarDays = computed(() => {
    const monthStart = startOfMonth(currentDate.value)
    const monthEnd = endOfMonth(currentDate.value)
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd }).map((date) => ({
      date,
      dateStr: format(date, 'yyyy-MM-dd'),
      day: format(date, 'd'),
      isToday: isToday(date),
      isCurrentMonth: isSameMonth(date, currentDate.value),
      habitCount: 3, // TODO: Реальная логика
      allCompleted: false, // TODO: Реальная логика
    }))
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
    // TODO: Реализовать логику выбора даты
  }
</script>
