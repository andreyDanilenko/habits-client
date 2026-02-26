<template>
  <span
    class="px-2 py-1 text-xs font-medium rounded-full"
    :class="[
      variant === 'default' && 'bg-badge-default-bg text-badge-default-text',
      variant === 'blue' && 'bg-badge-blue-bg text-badge-blue-text',
      variant === 'green' && 'bg-badge-green-bg text-badge-green-text',
      variant === 'indigo' && 'bg-badge-indigo-bg text-badge-indigo-text',
      variant === 'purple' && 'bg-badge-purple-bg text-badge-purple-text',
      variant === 'outline' && 'border border-border-default bg-bg-primary text-text-primary',
    ]"
  >
    <slot />
  </span>
</template>

<script setup lang="ts">
  withDefaults(
    defineProps<{
      variant?: 'default' | 'blue' | 'green' | 'indigo' | 'purple' | 'outline'
    }>(),
    {
      variant: 'default',
    },
  )
</script>
