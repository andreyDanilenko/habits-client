<template>
  <div v-if="legalAddress || actualAddress">
    <h3 class="text-(--text-sm) font-medium text-text-secondary mb-(--spacing-2)">Адреса</h3>
    <dl class="space-y-(--spacing-2) text-(--text-sm)">
      <div v-if="legalAddress" class="flex gap-(--spacing-2)">
        <dt class="text-text-muted w-28">Юридический:</dt>
        <dd class="text-text-primary">{{ formatAddress(legalAddress) }}</dd>
      </div>
      <div v-if="actualAddress" class="flex gap-(--spacing-2)">
        <dt class="text-text-muted w-28">Фактический:</dt>
        <dd class="text-text-primary">{{ formatAddress(actualAddress) }}</dd>
      </div>
    </dl>
  </div>
</template>

<script setup lang="ts">
  import { formatCompanyAddress } from '../lib/format'
  import type { CompanyAddress } from '@/entities/company'

  defineProps<{
    legalAddress?: CompanyAddress | null
    actualAddress?: CompanyAddress | null
  }>()

  const formatAddress = formatCompanyAddress
</script>
