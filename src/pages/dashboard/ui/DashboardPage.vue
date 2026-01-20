<template>
  <div class="max-w-7xl mx-auto space-y-6">
    <div class="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6">
      <h1 class="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
        {{ greeting }}, {{ userName }}!
      </h1>
      <p class="text-gray-600">Сегодня {{ formattedDate }}</p>
    </div>
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
  import { computed } from 'vue'
  import { format } from 'date-fns'
  import { ru } from 'date-fns/locale'
  import { TodayHabitsWidget } from '@/widgets/habits'
  import { CalendarWidget } from '@/widgets/calendar'
  import { StatsOverviewWidget } from '@/widgets/stats-overview'
  import { QuickJournalWidget } from '@/widgets/journal'
  import { RecentActivityWidget } from '@/widgets/activity'
  import { useUserStore } from '@/entities/user'

  const userStore = useUserStore()

  const userName = computed(() => {
    return userStore.currentUser?.email?.split('@')[0] || 'Друг'
  })

  const greeting = computed(() => {
    const hour = new Date().getHours()
    if (hour < 12 && hour > 4) return 'Доброе утро'
    if (hour < 18 && hour > 12) return 'Добрый день'
    if (hour < 4 && hour > 0) return 'Доброй ночи'
    return 'Добрый вечер'
  })

  const formattedDate = computed(() => {
    return format(new Date(), 'd MMMM, EEEE', { locale: ru })
  })
</script>
