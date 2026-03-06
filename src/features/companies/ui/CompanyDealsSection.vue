<template>
  <DealsListSection
    title="Сделки компании"
    :subtitle="deals?.length ? `— общая сумма: ${formatDealMoney(dealsSum, 'RUB')}` : undefined"
    empty-text="Нет сделок по этой компании."
    :loading="loading"
    :deals="deals"
  />
</template>

<script setup lang="ts">
  import { DealsListSection } from '@/shared/ui'
  import { formatDealMoney } from '@/features/deals/lib/format'
  import type { Deal } from '@/entities/deal'

  defineProps<{
    deals: Deal[] | null
    loading?: boolean
    dealsSum: number
  }>()
</script>
