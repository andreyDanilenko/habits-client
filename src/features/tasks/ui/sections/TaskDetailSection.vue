<template>
  <div class="TaskDetailSection" :class="{ 'TaskDetailSection--placeholder': placeholder }">
    <div
      v-if="title || $slots.action"
      class="flex items-center justify-between gap-(--spacing-2) mb-(--spacing-2)"
    >
      <h4 v-if="title" class="TaskDetailSection__Title">{{ title }}</h4>
      <slot name="action" />
    </div>
    <slot />
  </div>
</template>

<script setup lang="ts">
  defineProps<{
    title?: string
    placeholder?: boolean
  }>()
</script>

<style scoped>
  .TaskDetailSection {
    border: 1px solid var(--color-border-light);
    border-radius: var(--radius-md);
    padding: var(--spacing-4);
  }

  .TaskDetailSection--placeholder {
    background-color: var(--color-bg-tertiary);
  }

  .TaskDetailSection__Title {
    font-size: var(--text-xs);
    font-weight: 500;
    color: var(--color-text-secondary);
    margin: 0;
  }
</style>
