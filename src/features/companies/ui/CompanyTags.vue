<template>
  <div v-if="tags?.length">
    <h3 class="text-(--text-sm) font-medium text-text-secondary mb-(--spacing-2)">Теги</h3>
    <div class="flex flex-wrap gap-(--spacing-2)">
      <span
        v-for="tag in tags"
        :key="tag"
        class="px-(--spacing-2) py-(--spacing-0-5) rounded bg-bg-tertiary text-text-secondary text-(--text-sm)"
      >
        {{ tag }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
  defineProps<{
    tags?: string[] | null
  }>()
</script>
