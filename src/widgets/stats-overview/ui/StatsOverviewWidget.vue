<template>
  <Card :border="true" :padding="true">
    <h2 class="mb-4">Статистика</h2>

    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-gray-600">Выполнено сегодня</p>
          <p class="text-2xl font-bold text-gray-900">{{ completedToday }}/{{ totalToday }}</p>
        </div>
        <div class="bg-indigo-100 rounded-full flex items-center justify-center p-3">
          <CheckCircleIcon size="md" color="blue" stroke-width="2" />
        </div>
      </div>
      <ProgressBar :percentage="progressPercentage" />
    </div>
  </Card>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { useHabitStore } from '@/entities/habit'
  import { ProgressBar, Card } from '@/shared/ui'
  import { CheckCircleIcon } from '@/shared/ui/icon'

  const habitStore = useHabitStore()

  const completedToday = computed(() => habitStore.completedToday)
  const totalToday = computed(() => habitStore.totalToday)

  const progressPercentage = computed(() => {
    if (totalToday.value === 0) return 0
    return Math.round((completedToday.value / totalToday.value) * 100)
  })
</script>
