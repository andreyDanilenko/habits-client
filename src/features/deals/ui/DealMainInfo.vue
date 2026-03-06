<template>
  <section class="space-y-(--spacing-6)">
    <div>
      <h3 class="text-(--text-sm) font-medium text-text-secondary mb-(--spacing-2)">
        Основная информация
      </h3>
      <dl class="grid gap-(--spacing-4) sm:grid-cols-2 text-(--text-sm)">
        <div>
          <dt class="text-text-muted w-28">Контакт</dt>
          <dd class="mt-(--spacing-1) text-text-primary">
            <router-link
              v-if="deal.contactId"
              :to="{ name: 'CrmContactDetail', params: { id: deal.contactId } }"
              class="text-primary-default hover:underline"
            >
              {{ contactName || 'Контакт' }}
            </router-link>
            <span v-else class="text-text-muted">Не привязан</span>
          </dd>
        </div>
        <div>
          <dt class="text-text-muted w-28">Компания</dt>
          <dd class="mt-(--spacing-1) text-text-primary">
            <router-link
              v-if="deal.companyId"
              :to="{ name: 'CrmCompanyDetail', params: { id: deal.companyId } }"
              class="text-primary-default hover:underline"
            >
              {{ companyName || 'Компания' }}
            </router-link>
            <span v-else class="text-text-muted">Не привязана</span>
          </dd>
        </div>
        <div class="sm:col-span-2">
          <dt class="text-text-muted w-28">Описание</dt>
          <dd class="mt-(--spacing-1) text-text-primary whitespace-pre-wrap">
            {{ deal.description || '—' }}
          </dd>
        </div>
        <div>
          <dt class="text-text-muted w-28">Плановая дата закрытия</dt>
          <dd class="mt-(--spacing-1) text-text-primary">
            {{ formatDealDate(deal.expectedCloseDate) }}
          </dd>
        </div>
        <div>
          <dt class="text-text-muted w-28">Источник</dt>
          <dd class="mt-(--spacing-1) text-text-primary">
            {{ deal.source || '—' }}
          </dd>
        </div>
        <div v-if="deal.tags?.length" class="sm:col-span-2">
          <dt class="text-text-muted w-28 mb-(--spacing-1)">Теги</dt>
          <dd class="flex flex-wrap gap-(--spacing-1)">
            <span
              v-for="tag in deal.tags"
              :key="tag"
              class="px-(--spacing-2) py-(--spacing-0-5) rounded bg-bg-tertiary text-text-secondary"
            >
              {{ tag }}
            </span>
          </dd>
        </div>
      </dl>
    </div>
  </section>
</template>

<script setup lang="ts">
  import { formatDealDate } from '../lib/format'
  import type { Deal } from '@/entities/deal'

  defineProps<{
    deal: Deal
    contactName?: string
    companyName?: string
  }>()
</script>
