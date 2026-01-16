<template>
  <div class="pt-4 border-t">
    <div class="mb-3">
      <div class="flex justify-between text-xs text-gray-500 mb-1">
        <span>{{ label }}</span>
        <span v-if="current !== undefined && total !== undefined">
          {{ current }} / {{ total }}
        </span>
        <span v-else class="text-sm font-medium text-gray-900"> {{ percentage }}% </span>
      </div>
      <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          class="h-full rounded-full transition-all duration-300"
          :style="{
            width: `${computedPercentage}%`,
            backgroundColor: color || '#6366f1',
          }"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'

  const props = withDefaults(
    defineProps<{
      percentage?: number
      current?: number
      total?: number
      label?: string
      color?: string
    }>(),
    {
      label: 'Прогресс',
    },
  )

  const computedPercentage = computed(() => {
    if (props.current !== undefined && props.total !== undefined) {
      return Math.min((props.current / props.total) * 100, 100)
    }
    return props.percentage || 0
  })
</script>
