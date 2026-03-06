<template>
  <p class="text-text-muted text-(--text-sm)">
    {{ text }}
  </p>
</template>

<script setup lang="ts">
  defineProps<{
    text: string
  }>()
</script>
