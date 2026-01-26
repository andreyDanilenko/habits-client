<template>
  <div
    :class="[
      'min-h-[120px] rounded-lg border-2 p-2 transition-all duration-200',
      day.isToday
        ? 'border-indigo-500 bg-indigo-50'
        : day.isCurrentMonth
          ? 'border-gray-200 bg-white hover:border-gray-300'
          : 'border-gray-100 bg-gray-50',
    ]"
  >
    <!-- Номер дня -->
    <div
      :class="[
        'text-sm font-medium mb-2',
        day.isToday ? 'text-indigo-700' : day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400',
      ]"
    >
      {{ day.day }}
    </div>

    <!-- Список привычек -->
    <div class="space-y-1">
      <div
        v-for="habit in day.habits"
        :key="habit.id"
        :class="[
          'text-xs px-2 py-1 rounded flex items-center gap-1',
          habit.completed
            ? 'bg-green-100 text-green-800 border border-green-300'
            : habit.scheduleType === 'one_time'
              ? 'bg-purple-100 text-purple-800 border border-purple-300'
              : 'bg-indigo-100 text-indigo-800 border border-indigo-300',
        ]"
        :title="habit.title"
      >
        <span class="flex-shrink-0">{{ habit.icon || '📝' }}</span>
        <span class="truncate flex-1">{{ habit.title }}</span>
        <span
          v-if="habit.completed"
          class="flex-shrink-0 text-green-600 font-bold"
          title="Выполнено"
        >
          ✓
        </span>
      </div>
    </div>

    <!-- Индикатор если нет привычек -->
    <div v-if="day.habits.length === 0" class="text-xs text-gray-400 text-center py-2">
      Нет привычек
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { CalendarDay } from '../model'

  defineProps<{
    day: CalendarDay
  }>()
</script>
