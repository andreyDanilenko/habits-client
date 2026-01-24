<template>
  <div
    :class="[
      'bg-white rounded-xl',
      shadow ? 'shadow-sm' : '',
      padding ? 'p-6' : '',
      border ? 'border border-gray-300' : '',
    ]"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
  interface Props {
    shadow?: boolean
    padding?: boolean
    border?: boolean
  }

  withDefaults(defineProps<Props>(), {
    shadow: true,
    padding: false,
    border: false,
  })
</script>
