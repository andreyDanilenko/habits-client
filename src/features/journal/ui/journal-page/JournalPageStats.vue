<template>
  <StatsCards :items="statItems" />
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { StatsCards } from '@/shared/ui'
  import type { StatsCardItem } from '@/shared/ui'
  import { useAppI18n } from '@/shared/lib/i18n'

  const props = defineProps<{
    totalCount: number
    monthlyCount: number
    averageMood: string
    averageMoodEmoji: string
  }>()

  const { t } = useAppI18n()

  const statItems = computed<StatsCardItem[]>(() => [
    { label: t('journal.stats.totalEntries'), value: props.totalCount, emoji: '📝' },
    { label: t('journal.stats.thisMonth'), value: props.monthlyCount, emoji: '📅' },
    {
      label: t('journal.stats.averageMood'),
      value: props.averageMood,
      emoji: props.averageMoodEmoji,
    },
  ])
</script>
