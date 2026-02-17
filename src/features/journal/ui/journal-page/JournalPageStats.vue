<template>
  <StatsCards :items="statItems" />
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { StatsCards } from '@/shared/ui'
  import type { StatsCardItem } from '@/shared/ui'

  const props = defineProps<{
    totalCount: number
    monthlyCount: number
    averageMood: string
    averageMoodEmoji: string
  }>()

  const statItems = computed<StatsCardItem[]>(() => [
    { label: 'Всего записей', value: props.totalCount, emoji: '📝' },
    { label: 'За этот месяц', value: props.monthlyCount, emoji: '📅' },
    {
      label: 'Среднее настроение',
      value: props.averageMood,
      emoji: props.averageMoodEmoji,
    },
  ])
</script>
