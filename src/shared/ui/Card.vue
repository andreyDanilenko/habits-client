<template>
  <div
    :class="[
      'bg-bg-primary rounded-(--radius-lg)',
      shadow ? 'shadow-card' : '',
      padding ? 'p-(--spacing-6)' : '',
      border ? 'border border-border-default' : '',
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
    padding: true,
    border: true,
  })
</script>
