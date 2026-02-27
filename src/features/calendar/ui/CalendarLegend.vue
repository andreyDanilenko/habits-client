<template>
  <Card :border="true" :padding="true">
    <div class="flex items-center gap-6 flex-wrap">
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 rounded-full bg-regular-dot"></div>
        <span class="text-sm text-text-primary">Регулярная</span>
      </div>

      <div class="flex items-center gap-2">
        <div class="w-3 h-3 rounded-full bg-special-dot"></div>
        <span class="text-sm text-text-primary">Разовая</span>
      </div>

      <div class="flex items-center gap-2">
        <div class="w-3 h-3 rounded-full bg-success-dot"></div>
        <span class="text-sm text-text-primary">Выполнено</span>
      </div>

      <div class="flex items-center gap-2">
        <div class="w-3 h-3 rounded-full bg-muted-dot"></div>
        <span class="text-sm text-text-primary">Не выполнено</span>
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
  import { Card } from '@/shared/ui'
</script>
