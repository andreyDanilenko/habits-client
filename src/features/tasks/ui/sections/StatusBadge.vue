<template>
  <span
    class="inline-flex items-center px-1.5 py-0.5 rounded-full text-[11px] font-medium shrink-0"
    :class="statusClass(status)"
  >
    {{ statusLabel(status) }}
  </span>
</template>

<script setup lang="ts">
  import { statusClass, statusLabel } from '@/entities/task'

  defineProps<{
    status: string
  }>()
</script>
