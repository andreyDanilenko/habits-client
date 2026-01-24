<template>
  <div class="rounded-lg p-4" :class="cardClasses">
    <p class="text-sm mb-1" :class="labelClasses">
      {{ label }}
    </p>
    <p class="font-semibold" :class="valueClasses">
      {{ value }}
    </p>
    <p v-if="description" class="text-xs mt-1" :class="descriptionClasses">
      {{ description }}
    </p>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'

  const props = withDefaults(
    defineProps<{
      label: string
      value: string | number
      description?: string
      variant?: 'default' | 'gradient'
      color?: 'indigo' | 'purple' | 'blue' | 'green' | 'red' | 'yellow'
    }>(),
    {
      variant: 'default',
      color: 'indigo',
    },
  )

  const cardClasses = computed(() => {
    if (props.variant === 'gradient') {
      const colorMap = {
        indigo: 'bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200',
        purple: 'bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200',
        blue: 'bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200',
        green: 'bg-gradient-to-br from-green-50 to-green-100 border border-green-200',
        red: 'bg-gradient-to-br from-red-50 to-red-100 border border-red-200',
        yellow: 'bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200',
      }
      return colorMap[props.color]
    }
    return 'bg-gray-50'
  })

  const labelClasses = computed(() => {
    if (props.variant === 'gradient') {
      const colorMap = {
        indigo: 'text-indigo-600',
        purple: 'text-purple-600',
        blue: 'text-blue-600',
        green: 'text-green-600',
        red: 'text-red-600',
        yellow: 'text-yellow-600',
      }
      return colorMap[props.color]
    }
    return 'text-gray-500'
  })

  const valueClasses = computed(() => {
    if (props.variant === 'gradient') {
      const colorMap = {
        indigo: 'text-3xl font-bold text-indigo-900',
        purple: 'text-3xl font-bold text-purple-900',
        blue: 'text-3xl font-bold text-blue-900',
        green: 'text-3xl font-bold text-green-900',
        red: 'text-3xl font-bold text-red-900',
        yellow: 'text-3xl font-bold text-yellow-900',
      }
      return colorMap[props.color]
    }
    return 'text-2xl text-gray-900'
  })

  const descriptionClasses = computed(() => {
    if (props.variant === 'gradient') {
      const colorMap = {
        indigo: 'text-indigo-500',
        purple: 'text-purple-500',
        blue: 'text-blue-500',
        green: 'text-green-500',
        red: 'text-red-500',
        yellow: 'text-yellow-500',
      }
      return colorMap[props.color]
    }
    return 'text-gray-400'
  })
</script>
