<template>
  <div>
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
      <CalendarWidgetDay
        v-for="day in calendarDays"
        :key="day.dateStr"
        :day="day"
        @select-date="$emit('select-date', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import CalendarWidgetDay from './CalendarWidgetDay.vue'
  import type { CalendarWidgetDay as CalendarWidgetDayType } from '../model'

  defineProps<{
    calendarDays: CalendarWidgetDayType[]
    weekDays: string[]
  }>()

  defineEmits<{
    'select-date': [date: Date]
  }>()
</script>
