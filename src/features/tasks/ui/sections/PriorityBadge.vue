<template>
  <span
    class="inline-flex items-center px-1.5 py-0.5 rounded-full text-[11px] font-medium shrink-0"
    :class="priorityClass(priority)"
  >
    {{ priorityLabel(priority) }}
  </span>
</template>

<script setup lang="ts">
  import { priorityClass, priorityLabel } from '@/entities/task'

  defineProps<{
    priority: string
  }>()
</script>
