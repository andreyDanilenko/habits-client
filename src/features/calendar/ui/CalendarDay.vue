<template>
  <div
    :class="[
      'min-h-[120px] rounded-lg border-2 p-2 transition-all duration-200',
      day.isToday
        ? 'border-primary-default bg-primary-light'
        : day.isCurrentMonth
          ? 'border-border-light bg-bg-primary hover:border-border-hover'
          : 'border-border-light bg-bg-secondary',
    ]"
  >
    <!-- Номер дня -->
    <div
      :class="[
        'text-sm font-medium mb-2',
        day.isToday
          ? 'text-primary-dark'
          : day.isCurrentMonth
            ? 'text-text-primary'
            : 'text-text-muted',
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
          'text-xs px-2 py-1 rounded flex items-center gap-1 border',
          habit.completed
            ? 'bg-success-bg text-success-text border-success-border'
            : habit.scheduleType === 'one_time'
              ? 'bg-special-bg text-special-text border-special-border'
              : 'bg-regular-bg text-regular-text border-regular-border',
        ]"
        :title="habit.title"
      >
        <span class="flex-shrink-0">{{ habit.icon || '📝' }}</span>
        <span class="truncate flex-1">{{ habit.title }}</span>
        <span
          v-if="habit.completed"
          class="flex-shrink-0 text-success-icon font-bold"
          title="Выполнено"
        >
          ✓
        </span>
      </div>
    </div>

    <!-- Индикатор если нет привычек -->
    <div v-if="day.habits.length === 0" class="text-xs text-text-muted text-center py-2">
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
