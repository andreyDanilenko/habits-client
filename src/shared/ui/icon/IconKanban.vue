<template>
  <BaseIcon v-bind="$attrs">
    <!-- View columns / Kanban board -->
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M9 4.5v15m6-15v15M3.75 4.5h4.5v15h-4.5V4.5zm11.25 0h4.5v15h-4.5V4.5z"
    />
  </BaseIcon>
</template>

<script setup lang="ts">
  import BaseIcon from './BaseIcon.vue'
</script>
