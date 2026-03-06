<template>
  <div>
    <div class="flex items-center justify-between gap-(--spacing-4) mb-(--spacing-4)">
      <h3 class="text-(--text-sm) font-medium text-text-secondary">
        {{ title }}
        <span v-if="subtitle" class="ml-(--spacing-2) font-normal text-text-primary">
          {{ subtitle }}
        </span>
      </h3>
      <div v-if="$slots.actions" class="flex gap-(--spacing-2)">
        <slot name="actions" />
      </div>
    </div>
    <div
      v-if="loading"
      class="text-text-muted text-(--text-sm) py-(--spacing-4)"
    >
      Загрузка…
    </div>
    <div
      v-else-if="!items?.length"
      class="text-text-muted text-(--text-sm) py-(--spacing-4)"
    >
      {{ emptyText }}
    </div>
    <slot v-else :items="items" />
  </div>
</template>

<script setup lang="ts">
  defineProps<{
    title: string
    subtitle?: string
    emptyText: string
    loading?: boolean
    items?: unknown[] | null
  }>()
</script>
