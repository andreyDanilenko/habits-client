<template>
  <Card :border="true" :padding="true">
    <CalendarWidgetHeader
      :formatted-month="formattedMonth"
      @prev-month="prevMonth"
      @next-month="nextMonth"
    />

    <CalendarWidgetGrid
      :calendar-days="calendarDays"
      :week-days="weekDays"
      @select-date="selectDate"
    />
  </Card>
</template>

<script setup lang="ts">
  import { Card } from '@/shared/ui'
  import CalendarWidgetHeader from './CalendarWidgetHeader.vue'
  import CalendarWidgetGrid from './CalendarWidgetGrid.vue'
  import { useCalendarWidget } from '../model'

  const {
    calendarDays,
    formattedMonth,
    weekDays,
    prevMonth,
    nextMonth,
    selectDate,
  } = useCalendarWidget()
</script>
