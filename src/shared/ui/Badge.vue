<template>
  <span
    class="px-2 py-1 text-xs font-medium rounded-full"
    :class="[
      variant === 'default' && 'bg-gray-100 text-gray-800',
      variant === 'blue' && 'bg-blue-50 text-blue-700',
      variant === 'green' && 'bg-green-50 text-green-700',
      variant === 'indigo' && 'bg-indigo-50 text-indigo-700',
      variant === 'purple' && 'bg-purple-50 text-purple-700',
    ]"
  >
    <slot />
  </span>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  variant?: 'default' | 'blue' | 'green' | 'indigo' | 'purple'
}>(), {
  variant: 'default',
})
</script>
