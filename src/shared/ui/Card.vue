<template>
  <div
    :class="[
      'bg-bg-primary rounded-xl',
      shadow ? 'shadow-card' : '',
      padding ? 'p-6' : '',
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
    padding: false,
    border: false,
  })
</script>
