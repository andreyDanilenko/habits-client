<template>
  <div :class="variant === 'detailed' ? '' : 'pt-4 border-t border-border-light'">
    <div :class="variant === 'detailed' ? '' : 'mb-3'">
      <!-- Default вариант -->
      <div v-if="variant === 'default'" class="flex justify-between text-xs text-text-muted mb-1">
        <span>{{ label }}</span>
        <span v-if="current !== undefined && total !== undefined">
          {{ current }} / {{ total }}
        </span>
        <span v-else class="text-sm font-medium text-text-primary">
          {{ computedPercentage }}%
        </span>
      </div>

      <!-- Detailed вариант -->
      <div v-else class="flex justify-between items-center mb-2">
        <p class="text-sm font-medium text-text-secondary">{{ label }}</p>
        <p
          class="text-sm font-semibold"
          :class="isCompleted ? 'text-success-default' : 'text-text-muted'"
        >
          {{ Math.round(computedPercentage) }}%
        </p>
      </div>

      <!-- Полоса прогресса -->
      <div
        class="bg-bg-tertiary rounded-full overflow-hidden"
        :class="variant === 'detailed' ? 'h-3' : 'h-2'"
      >
        <div
          class="h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2"
          :class="isCompleted && variant === 'detailed' ? 'bg-success-default' : ''"
          :style="{
            width: `${Math.min(computedPercentage, 100)}%`,
            backgroundColor:
              isCompleted && variant === 'detailed'
                ? undefined
                : color || 'var(--color-primary-default)',
          }"
        >
          <span v-if="isCompleted && variant === 'detailed'" class="text-xs text-white font-bold"
            >✓</span
          >
        </div>
      </div>

      <!-- Описание для detailed варианта -->
      <p v-if="variant === 'detailed' && description" class="text-xs text-text-muted mt-1">
        {{ description }}
      </p>
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
      variant?: 'default' | 'detailed'
      description?: string
    }>(),
    {
      label: 'Прогресс',
      variant: 'default',
    },
  )

  const computedPercentage = computed(() => {
    if (props.current !== undefined && props.total !== undefined) {
      return Math.min((props.current / props.total) * 100, 100)
    }
    return props.percentage || 0
  })

  const isCompleted = computed(() => {
    if (props.current !== undefined && props.total !== undefined) {
      return props.current >= props.total
    }
    return false
  })
</script>
