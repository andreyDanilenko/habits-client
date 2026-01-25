<template>
  <div class="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6">
    <h1 class="mb-2">{{ greeting }}, {{ userName }}!</h1>
    <p class="text-gray-600">Сегодня {{ formattedDate }}</p>
  </div>
</template>

<script setup lang="ts">
  defineProps<{
    greeting: string
    userName: string
    formattedDate: string
  }>()
</script>
