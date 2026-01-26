<template>
  <Card :border="true" :padding="true">
    <div v-if="isLoading" class="text-center py-12">
      <p class="text-gray-500">Загрузка календаря...</p>
    </div>

    <div v-else>
      <!-- Дни недели -->
      <div class="grid grid-cols-7 gap-2 mb-4">
        <div
          v-for="day in weekDays"
          :key="day"
          class="text-center text-sm font-semibold text-gray-600 py-2"
        >
          {{ day }}
        </div>
      </div>

      <!-- Календарная сетка -->
      <div class="grid grid-cols-7 gap-2">
        <CalendarDay v-for="day in calendarDays" :key="day.dateStr" :day="day" />
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
  import { Card } from '@/shared/ui'
  import CalendarDay from './CalendarDay.vue'
  import type { CalendarDay as CalendarDayType } from '../model'

  defineProps<{
    calendarDays: CalendarDayType[]
    weekDays: string[]
    isLoading: boolean
  }>()
</script>
