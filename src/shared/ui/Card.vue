<template>
  <div :class="['bg-white rounded-xl border', shadow ? 'shadow-sm' : '', padding ? 'p-6' : '']">
    <slot />
  </div>
</template>

<script setup lang="ts">
  interface Props {
    shadow?: boolean
    padding?: boolean
  }

  withDefaults(defineProps<Props>(), {
    shadow: true,
    padding: false,
  })
</script>
