<template>
  <div
    :class="[
      'h-10 rounded-lg flex items-center justify-center text-sm font-medium relative z-10',
      'cursor-pointer transition-all duration-200',
      day.isToday ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'hover:bg-gray-50',
      day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400',
      day.isInStreak ? 'bg-gradient-to-br from-green-50 to-emerald-50' : '',
    ]"
    @click="$emit('select-date', day.date)"
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
</template>

<script setup lang="ts">
  import type { CalendarWidgetDay } from '../model'

  defineProps<{
    day: CalendarWidgetDay
  }>()

  defineEmits<{
    'select-date': [date: Date]
  }>()
</script>
