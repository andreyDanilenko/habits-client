<template>
  <div class="max-w-7xl mx-auto space-y-6">
    <CalendarPageHeader
      :formatted-month="formattedMonth"
      @prev-month="prevMonth"
      @next-month="nextMonth"
    />

    <CalendarLegend />

    <CalendarGrid
      :calendar-days="calendarDays"
      :week-days="weekDays"
      :is-loading="isLoading"
    />
  </div>
</template>

<script setup lang="ts">
  import { CalendarPageHeader, CalendarLegend, CalendarGrid } from '@/features/calendar'
  import { useCalendarPage } from '@/features/calendar/model'

  const {
    calendarDays,
    formattedMonth,
    weekDays,
    isLoading,
    prevMonth,
    nextMonth,
  } = useCalendarPage()
</script>
