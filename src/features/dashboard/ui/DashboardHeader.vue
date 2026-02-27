<template>
  <div 
    class="rounded-2xl p-6"
    :style="{ background: `linear-gradient(to right, var(--color-primary-light), var(--color-secondary-light))` }"
  >
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
