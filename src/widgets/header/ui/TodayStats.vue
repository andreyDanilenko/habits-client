<template>
  <div class="flex items-center space-x-2 px-3 py-2 bg-bg-secondary rounded-lg">
    <template v-for="(stat, index) in statItems" :key="stat.id">
      <div v-if="index > 0" class="h-6 w-px bg-border-light" aria-hidden="true" />
      <div class="text-center">
        <div class="text-xs text-text-muted">{{ stat.label }}</div>
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
      valueClass: 'text-text-primary',
    },
    {
      id: 'streak',
      label: 'Серия',
      value: habitStore.currentStreak,
      suffix: ' дн.',
      valueClass: 'text-primary-default',
    },
  ])
</script>
