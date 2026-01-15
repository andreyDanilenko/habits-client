<template>
  <div class="flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-lg">
    <div class="text-center">
      <div class="text-xs text-gray-500">Сегодня</div>
      <div class="text-sm font-bold text-gray-900">{{ completed }}/{{ total }}</div>
    </div>
    <div class="h-6 w-px bg-gray-300"></div>
    <div class="text-center">
      <div class="text-xs text-gray-500">Серия</div>
      <div class="text-sm font-bold text-indigo-600">{{ streak }} дн.</div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { useHabitStore } from '@/entities/habit'

  const habitStore = useHabitStore()

  const completed = computed(() => habitStore.completedToday)
  const total = computed(() => habitStore.totalToday)
  const streak = computed(() => 7)
</script>
