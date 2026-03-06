<template>
  <DetailListSection
    :title="title"
    :subtitle="subtitle"
    :empty-text="emptyText"
    :loading="loading"
    :items="deals ?? []"
  >
    <template #actions>
      <slot name="actions" />
    </template>
    <template #default="{ items: slotItems }">
      <ul class="space-y-(--spacing-2)">
        <li
          v-for="deal in (slotItems as Deal[])"
          :key="deal.id"
          class="flex items-center justify-between gap-(--spacing-4) py-(--spacing-2) border-b border-border-light"
        >
          <router-link
            :to="{ name: 'CrmDealDetail', params: { id: deal.id } }"
            class="text-primary-default hover:underline text-(--text-sm)"
          >
            {{ deal.name }}
          </router-link>
          <span class="text-(--text-sm) font-medium text-primary-default">
            {{ formatDealMoney(deal.budget, deal.currency) }}
          </span>
        </li>
      </ul>
    </template>
  </DetailListSection>
</template>

<script setup lang="ts">
  import DetailListSection from './DetailListSection.vue'
  import { formatDealMoney } from '@/features/deals/lib/format'
  import type { Deal } from '@/entities/deal'

  defineProps<{
    title: string
    subtitle?: string
    emptyText: string
    loading?: boolean
    deals?: Deal[] | null
  }>()
</script>
