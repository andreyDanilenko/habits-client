<template>
  <h3
    v-if="title && !collapsed"
    class="text-(--text-xs) font-semibold text-text-muted uppercase tracking-wider px-(--spacing-3) mb-(--spacing-3) truncate min-w-0"
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
