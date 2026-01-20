<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    :stroke-width="strokeWidth"
    stroke="currentColor"
    :class="`${iconColor} ${iconSize}`"
  >
    <slot />
  </svg>
</template>

<script setup lang="ts">
  import { computed } from 'vue'

  interface Props {
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
    color?: 'indigo' | 'blue' | 'green' | 'red' | 'gray' | 'yellow' | 'purple' | 'pink' | 'inherit'
    strokeWidth?: string | number
  }

  const props = withDefaults(defineProps<Props>(), {
    size: 'md',
    color: 'inherit',
    strokeWidth: '1.5',
  })

  const iconColor = computed(() => {
    if (props.color === 'inherit') return ''


    const colorMap = {
      indigo: 'text-indigo-600',
      blue: 'text-blue-600',
      green: 'text-green-600',
      red: 'text-red-600',
      gray: 'text-gray-600',
      yellow: 'text-yellow-600',
      purple: 'text-purple-600',
      pink: 'text-pink-600',
    }
    return colorMap[props.color] || 'text-indigo-600'
  })

  const iconSize = computed(() => {
    const sizeMap = {
      xs: 'size-4',
      sm: 'size-5',
      md: 'size-6',
      lg: 'size-8',
      xl: 'size-10',
    }
    return sizeMap[props.size] || 'size-6'
  })
</script>
