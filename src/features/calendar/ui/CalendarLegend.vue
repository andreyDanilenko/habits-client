<template>
  <Card :border="true" :padding="true">
    <div class="flex items-center gap-6 flex-wrap">
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 rounded-full bg-regular-dot"></div>
        <span class="text-sm text-text-primary">{{ t('habits.calendar.legend.regular') }}</span>
      </div>

      <div class="flex items-center gap-2">
        <div class="w-3 h-3 rounded-full bg-special-dot"></div>
        <span class="text-sm text-text-primary">{{ t('habits.calendar.legend.oneTime') }}</span>
      </div>

      <div class="flex items-center gap-2">
        <div class="w-3 h-3 rounded-full bg-success-dot"></div>
        <span class="text-sm text-text-primary">{{ t('habits.calendar.legend.completed') }}</span>
      </div>

      <div class="flex items-center gap-2">
        <div class="w-3 h-3 rounded-full bg-muted-dot"></div>
        <span class="text-sm text-text-primary">{{ t('habits.calendar.legend.notCompleted') }}</span>
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
  import { useAppI18n } from '@/shared/lib/i18n'
  import { Card } from '@/shared/ui'

  const { t } = useAppI18n()
</script>
