<template>
  <div class="bg-white rounded-xl border shadow-sm p-6">
    <h2 class="text-xl font-bold text-gray-900 mb-4">Статистика</h2>

    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-gray-600">Выполнено сегодня</p>
          <p class="text-2xl font-bold text-gray-900">{{ completedToday }}/{{ totalToday }}</p>
        </div>
        <Icon>
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </Icon>
      </div>

      <ProgressBar :percentage="progressPercentage" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { useHabitStore } from '@/entities/habit'
  import { ProgressBar, Icon } from '@/shared/ui'

  const habitStore = useHabitStore()

  const completedToday = computed(() => habitStore.completedToday)
  const totalToday = computed(() => habitStore.totalToday)

  const progressPercentage = computed(() => {
    if (totalToday.value === 0) return 0
    return Math.round((completedToday.value / totalToday.value) * 100)
  })
</script>
