<template>
  <button
    type="button"
    class="w-full rounded-(--radius-md) border px-(--spacing-3) py-(--spacing-2) text-left transition-colors text-(--text-sm) focus:outline-none focus:ring-1 focus:ring-primary-default focus:ring-inset"
    :class="
      selected
        ? 'border-primary-default bg-primary-light text-primary-dark'
        : 'border-border-default bg-bg-secondary text-text-primary hover:bg-bg-tertiary'
    "
    @click="$emit('click')"
  >
    <div class="flex items-center justify-between gap-(--spacing-2)">
      <div class="flex items-center gap-(--spacing-2) min-w-0">
        <slot name="leading" />
        <span class="truncate font-medium text-inherit">
          {{ title }}
        </span>
        <slot name="badge" />
      </div>
      <span v-if="trailing" class="text-(--text-xs) text-text-muted shrink-0">
        {{ trailing }}
      </span>
    </div>
  </button>
</template>

<script setup lang="ts">
  defineProps<{
    title: string
    selected?: boolean
    trailing?: string
  }>()

  defineEmits<{
    click: []
  }>()
</script>
