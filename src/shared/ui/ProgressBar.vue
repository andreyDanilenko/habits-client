<template>
  <div class="pt-4 border-t">
    <div class="flex items-center justify-between mb-2">
      <span class="text-sm text-gray-600">{{ label }}</span>
      <span class="text-sm font-medium text-gray-900"> {{ percentage }}% </span>
    </div>
    <div class="w-full bg-gray-200 rounded-full h-2">
      <div
        class="bg-indigo-600 h-2 rounded-full transition-all"
        :style="{ width: `${percentage}%` }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  withDefaults(
    defineProps<{
      percentage: number
      label?: string
    }>(),
    {
      label: 'Прогресс',
    },
  )
</script>
