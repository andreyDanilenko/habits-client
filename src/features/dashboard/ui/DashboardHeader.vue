<template>
  <div class="bg-gradient-to-r from-primary-light to-secondary-light rounded-2xl p-6">
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
