<template>
  <div
    class="bg-indigo-100 rounded-full flex items-center justify-center"
    :style="{ width: `${size}px`, height: `${size}px` }"
  >
    <svg
      class="text-indigo-600"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      :style="{ width: `${iconSize}px`, height: `${iconSize}px` }"
    >
      <slot />
    </svg>
  </div>
</template>

<script setup lang="ts">
  withDefaults(
    defineProps<{
      size?: number
      iconSize?: number
    }>(),
    {
      size: 48,
      iconSize: 24,
    },
  )
</script>
