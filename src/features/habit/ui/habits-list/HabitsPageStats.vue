<template>
  <StatsCards :items="statItems" />
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { StatsCards } from '@/shared/ui'
  import type { StatsCardItem } from '@/shared/ui'

  const props = defineProps<{
    totalCount: number
    completedToday: number
    completionRate: number
  }>()

  const statItems = computed<StatsCardItem[]>(() => [
    { label: 'Всего привычек', value: props.totalCount, emoji: '📋' },
    { label: 'Выполнено сегодня', value: props.completedToday, emoji: '✅' },
    { label: 'Процент выполнения', value: `${props.completionRate}%`, emoji: '📊' },
  ])
</script>
