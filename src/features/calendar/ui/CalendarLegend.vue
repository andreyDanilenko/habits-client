<template>
  <Card :border="true" :padding="true">
    <div class="flex items-center gap-6 flex-wrap">
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 rounded-full bg-indigo-500"></div>
        <span class="text-sm text-gray-700">Регулярная</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 rounded-full bg-purple-500"></div>
        <span class="text-sm text-gray-700">Разовая</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 rounded-full bg-green-500"></div>
        <span class="text-sm text-gray-700">Выполнено</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 rounded-full bg-gray-300"></div>
        <span class="text-sm text-gray-700">Не выполнено</span>
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
  import { Card } from '@/shared/ui'
</script>
