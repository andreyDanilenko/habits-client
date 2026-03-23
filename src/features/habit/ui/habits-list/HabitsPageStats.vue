<template>
  <StatsCards :items="statItems" />
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { useAppI18n } from '@/shared/lib/i18n'
  import { StatsCards } from '@/shared/ui'
  import type { StatsCardItem } from '@/shared/ui'

  const { t } = useAppI18n()

  const props = defineProps<{
    totalCount: number
    completedToday: number
    completionRate: number
  }>()

  const statItems = computed<StatsCardItem[]>(() => [
    { label: t('habits.stats.total'), value: props.totalCount, emoji: '📋' },
    { label: t('habits.stats.completedToday'), value: props.completedToday, emoji: '✅' },
    { label: t('habits.stats.completionRate'), value: `${props.completionRate}%`, emoji: '📊' },
  ])
</script>
