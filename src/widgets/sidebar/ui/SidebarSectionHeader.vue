<template>
  <h3
    v-if="title && !collapsed"
    class="text-xs font-semibold text-text-muted uppercase tracking-wider px-3 mb-3"
  >
    {{ title }}
  </h3>
</template>

<script setup lang="ts">
  interface Props {
    title?: string
    collapsed?: boolean
  }

  withDefaults(defineProps<Props>(), {
    collapsed: false,
  })
</script>
