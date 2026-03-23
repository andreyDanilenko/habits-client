<template>
  <BasePageLayout :title="t('habits.calendar.pageTitle')" :description="t('habits.calendar.pageDescription')">
    <template #header-actions>
      <div class="flex items-center gap-2">
        <Button
          icon-only
          variant="icon"
          :left-icon="ArrowLeftIcon"
          :aria-label="t('habits.calendar.prevMonth')"
          @click="prevMonth"
        />
        <span class="font-medium min-w-[140px] text-center text-text-primary">
          {{ formattedMonth }}
        </span>
        <Button
          icon-only
          variant="icon"
          :left-icon="ArrowRightIcon"
          :aria-label="t('habits.calendar.nextMonth')"
          @click="nextMonth"
        />
      </div>
    </template>

    <template #content>
      <CalendarLegend />
      <CalendarGrid :calendar-days="calendarDays" :week-days="weekDays" :is-loading="isLoading" />
    </template>
  </BasePageLayout>
</template>

<script setup lang="ts">
  import { useAppI18n } from '@/shared/lib/i18n'
  import { BasePageLayout } from '@/shared/ui/common'
  import { Button } from '@/shared/ui'
  import { ArrowLeftIcon, ArrowRightIcon } from '@/shared/ui/icon'
  import { CalendarLegend, CalendarGrid } from '@/features/calendar'
  import { useCalendarPage } from '@/features/calendar/model'

  const { t } = useAppI18n()
  const { calendarDays, formattedMonth, weekDays, isLoading, prevMonth, nextMonth } =
    useCalendarPage()
</script>
