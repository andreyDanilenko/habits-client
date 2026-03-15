<template>
  <div class="sidebar-accordion flex flex-col gap-(--spacing-2)">
    <button
      type="button"
      class="accordion-trigger w-full flex items-center justify-between gap-(--spacing-2) px-(--spacing-3) py-(--spacing-2) rounded-(--radius-md) text-left text-(--text-sm) font-medium text-text-primary hover:bg-bg-tertiary transition-colors"
      :aria-expanded="isOpen"
      :aria-controls="`accordion-${id}`"
      :id="`accordion-trigger-${id}`"
      @click="$emit('toggle')"
    >
      <slot name="trigger">
        <span>{{ title }}</span>
      </slot>
      <ChevronDownIcon
        class="w-4 h-4 text-text-muted flex-shrink-0 transition-transform duration-200"
        :class="{ 'rotate-180': isOpen }"
      />
    </button>
    <div
      :id="`accordion-${id}`"
      class="accordion-content"
      :class="{ 'accordion-content--open': isOpen }"
      role="region"
      :aria-labelledby="`accordion-trigger-${id}`"
      :inert="!isOpen"
    >
      <div class="accordion-inner">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ChevronDownIcon } from '@/shared/ui/icon'

  interface Props {
    id: string
    title?: string
    isOpen: boolean
  }

  withDefaults(defineProps<Props>(), {
    title: '',
  })

  defineEmits<{
    toggle: []
  }>()
</script>

<style scoped>
  .accordion-content {
    display: grid;
    grid-template-rows: 0fr;
    transition:
      grid-template-rows 0.3s ease-out,
      visibility 0s linear 0.3s;
    overflow: hidden;
    visibility: hidden;
    pointer-events: none;
  }

  .accordion-content--open {
    grid-template-rows: 1fr;
    transition:
      grid-template-rows 0.3s ease-out,
      visibility 0s linear 0s;
    visibility: visible;
    pointer-events: auto;
  }

  .accordion-inner {
    min-height: 0;
    overflow: hidden;
    padding: 0 var(--spacing-2) var(--spacing-2);
  }
</style>
