<template>
  <div class="max-w-7xl mx-auto space-y-6">
    <DashboardHeader :greeting="greeting" :user-name="userName" :formatted-date="formattedDate" />
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 space-y-6">
        <TodayHabitsWidget />
        <CalendarWidget />
      </div>

      <div class="space-y-6">
        <StatsOverviewWidget />
        <QuickJournalWidget />
        <RecentActivityWidget />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { TodayHabitsWidget } from '@/widgets/habits'
  import { CalendarWidget } from '@/widgets/calendar'
  import { StatsOverviewWidget } from '@/widgets/stats-overview'
  import { QuickJournalWidget } from '@/widgets/journal'
  import { RecentActivityWidget } from '@/widgets/activity'
  import { DashboardHeader } from '@/features/dashboard'
  import { useDashboardPage } from '@/features/dashboard/model'

  const { userName, greeting, formattedDate } = useDashboardPage()
</script>
