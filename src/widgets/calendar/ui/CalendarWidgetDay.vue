<template>
  <div
    :class="[
      'h-10 rounded-lg flex items-center justify-center text-sm font-medium relative z-10',
      'cursor-pointer transition-all duration-200',
      day.isToday ? 'bg-primary-light text-primary-dark font-semibold' : 'hover:bg-bg-tertiary',
      day.isCurrentMonth ? 'text-text-primary' : 'text-text-muted',
      day.isInStreak ? 'bg-success-light' : '',
    ]"
    @click="$emit('select-date', day.date)"
  >
    {{ day.day }}

    <div
      v-if="day.isInStreak"
      class="absolute bottom-0 left-0 right-0 h-1 bg-success-default rounded-b-lg"
    />

    <div
      v-if="day.habitCount > 0 && !day.isInStreak"
      class="absolute bottom-1 w-1.5 h-1.5 rounded-full"
      :class="day.allCompleted ? 'bg-success-default' : 'bg-border-default'"
    />

    <div
      v-if="day.streakConnections?.right"
      class="absolute top-1/2 -right-0.5 w-1 h-1 bg-success-default rounded-r-full z-0"
      style="transform: translateY(-50%)"
    />

    <div
      v-if="day.streakConnections?.left"
      class="absolute top-1/2 -left-0.5 w-1 h-1 bg-success-default rounded-l-full z-0"
      style="transform: translateY(-50%)"
    />

    <div
      v-if="day.streakConnections?.down"
      class="absolute -bottom-0.5 left-1/2 h-1 w-1 bg-success-default rounded-b-full z-0"
      style="transform: translateX(-50%)"
    />

    <div
      v-if="day.streakConnections?.up"
      class="absolute -top-0.5 left-1/2 h-1 w-1 bg-success-default rounded-t-full z-0"
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
