<template>
  <div class="max-w-2xl mx-auto py-12 text-center">
    <h1 class="text-2xl font-semibold text-gray-800">{{ label }}</h1>
    <p class="mt-4 text-gray-600">
      Модуль «{{ label }}» в разработке. Включите его в настройках воркспейса, чтобы он появился в меню.
    </p>
    <p class="mt-2 text-sm text-gray-500">
      Скоро здесь будет полный функционал.
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const label = computed(() => (route.meta?.stubLabel as string) ?? 'Модуль')
</script>
