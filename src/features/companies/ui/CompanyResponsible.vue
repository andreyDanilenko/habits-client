<template>
  <div>
    <h3 class="text-(--text-sm) font-medium text-text-secondary mb-(--spacing-1)">
      Ответственный
    </h3>
    <p class="text-(--text-sm) text-text-muted">
      {{ ownerId ? 'ID ' + ownerId : '—' }}
    </p>
  </div>
</template>

<script setup lang="ts">
  defineProps<{
    ownerId?: string | null
  }>()
</script>
