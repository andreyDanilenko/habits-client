<template>
  <div
    class="DealKanbanCard rounded-lg border border-border-default bg-bg-primary p-3 cursor-grab active:cursor-grabbing shadow-sm hover:shadow transition-shadow text-left relative"
    :class="{ 'DealKanbanCard--saving': saving }"
    @click.stop="$emit('click', deal)"
    @contextmenu.prevent="onContextMenu"
  >
    <div
      v-if="saving"
      class="absolute inset-0 rounded-lg bg-bg-primary/80 flex items-center justify-center z-10 transition-opacity"
      aria-hidden
    >
      <span class="text-xs text-text-muted">Сохранение…</span>
    </div>
    <div class="font-semibold text-text-primary truncate">{{ deal.name }}</div>
    <div class="mt-1 text-sm font-medium text-primary-default">
      {{ formatMoney(deal.budget, deal.currency) }}
    </div>
    <div class="mt-1 text-xs text-text-muted truncate">
      {{ companyOrContact }}
    </div>
    <div class="mt-2 flex items-center justify-between gap-2">
      <span class="text-xs text-text-muted flex items-center gap-1">
        <span
          v-if="deal.ownerId"
          class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-bg-tertiary text-xs font-medium"
          :title="deal.ownerId"
        >
          {{ ownerInitials }}
        </span>
      </span>
      <span
        v-if="deal.expectedCloseDate"
        :class="['text-xs', isOverdue ? 'text-danger-default font-medium' : 'text-text-muted']"
      >
        {{ formatDate(deal.expectedCloseDate) }}
      </span>
    </div>
    <div v-if="deal.tags?.length" class="mt-2 flex flex-wrap gap-1">
      <span
        v-for="tag in deal.tags.slice(0, 3)"
        :key="tag"
        class="inline-block px-1.5 py-0.5 rounded text-xs bg-bg-tertiary text-text-secondary"
      >
        {{ tag }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import type { Deal } from '@/entities/deal'

  const props = defineProps<{
    deal: Deal
    companyOrContactName?: string
    /** Блокировка карточки на время сохранения этапа (без перезагрузки доски) */
    saving?: boolean
  }>()

  const emit = defineEmits<{
    click: [deal: Deal]
    'context-menu': [evt: MouseEvent, deal: Deal]
  }>()

  const companyOrContact = computed(() => props.companyOrContactName ?? '—')

  const ownerInitials = computed(() => {
    const id = props.deal.ownerId ?? ''
    return id.slice(0, 2).toUpperCase() || '?'
  })

  const isOverdue = computed(() => {
    const d = props.deal.expectedCloseDate
    if (!d) return false
    return new Date(d) < new Date() && props.deal.status === 'open'
  })

  function formatMoney(value: number, currency: string): string {
    return (
      new Intl.NumberFormat('ru-RU', {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value) + (currency === 'RUB' ? ' ₽' : ` ${currency}`)
    )
  }

  function formatDate(iso: string): string {
    const d = new Date(iso)
    const day = d.getDate()
    const months = 'янв фев мар апр май июн июл авг сен окт ноя дек'.split(' ')
    return `${day} ${months[d.getMonth()]}`
  }

  function onContextMenu(evt: MouseEvent) {
    emit('context-menu', evt, props.deal)
  }
</script>

<style scoped>
  .DealKanbanCard--saving {
    pointer-events: none;
  }
</style>
