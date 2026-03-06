<template>
  <div class="rounded-2xl p-6 bg-gradient-to-r from-primary-light to-secondary-light">
    <h1 class="text-text-primary mb-2">{{ greeting }}, {{ userName }}!</h1>
    <p class="text-text-secondary">Сегодня {{ formattedDate }}</p>
  </div>
</template>

<script setup lang="ts">
  defineProps<{
    greeting: string
    userName: string
    formattedDate: string
  }>()
</script>
