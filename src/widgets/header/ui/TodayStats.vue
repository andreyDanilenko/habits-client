<template>
  <div class="flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-lg">
    <template v-for="(stat, index) in statItems" :key="stat.id">
      <div v-if="index > 0" class="h-6 w-px bg-gray-300" aria-hidden="true" />
      <div class="text-center">
        <div class="text-xs text-gray-500">{{ stat.label }}</div>
        <div class="text-sm font-bold" :class="stat.valueClass">
          {{ stat.value }}{{ stat.suffix }}
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { useHabitStore } from '@/entities/habit'

  const habitStore = useHabitStore()

  const statItems = computed(() => [
    {
      id: 'today',
      label: 'Сегодня',
      value: `${habitStore.completedToday}/${habitStore.totalToday}`,
      suffix: '',
      valueClass: 'text-gray-900',
    },
    {
      id: 'streak',
      label: 'Серия',
      value: habitStore.currentStreak,
      suffix: ' дн.',
      valueClass: 'text-indigo-600',
    },
  ])
</script>
