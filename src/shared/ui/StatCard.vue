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
        indigo: 'bg-gradient-to-br from-primary-light to-primary-light/80 border border-primary-light',
        purple: 'bg-gradient-to-br from-secondary-light to-secondary-light/80 border border-secondary-light',
        blue: 'bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200',
        green: 'bg-gradient-to-br from-success-light to-success-light/80 border border-success-border',
        red: 'bg-gradient-to-br from-red-50 to-red-100 border border-red-200',
        yellow: 'bg-gradient-to-br from-amber-light to-amber-light/80 border border-amber-border',
      }
      return colorMap[props.color]
    }
    return 'bg-bg-tertiary'
  })

  const labelClasses = computed(() => {
    if (props.variant === 'gradient') {
      const colorMap = {
        indigo: 'text-primary-default',
        purple: 'text-secondary-default',
        blue: 'text-blue-500',
        green: 'text-success-default',
        red: 'text-red-500',
        yellow: 'text-amber-text',
      }
      return colorMap[props.color]
    }
    return 'text-text-muted'
  })

  const valueClasses = computed(() => {
    if (props.variant === 'gradient') {
      const colorMap = {
        indigo: 'text-3xl font-bold text-primary-dark',
        purple: 'text-3xl font-bold text-secondary-dark',
        blue: 'text-3xl font-bold text-blue-900',
        green: 'text-3xl font-bold text-success-dark',
        red: 'text-3xl font-bold text-red-900',
        yellow: 'text-3xl font-bold text-amber-900',
      }
      return colorMap[props.color]
    }
    return 'text-2xl font-bold text-text-primary'
  })

  const descriptionClasses = computed(() => {
    if (props.variant === 'gradient') {
      const colorMap = {
        indigo: 'text-primary-default/70',
        purple: 'text-secondary-default/70',
        blue: 'text-blue-500/70',
        green: 'text-success-default/70',
        red: 'text-red-500/70',
        yellow: 'text-amber-text/70',
      }
      return colorMap[props.color]
    }
    return 'text-text-muted'
  })
</script>
