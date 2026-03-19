<template>
  <span
    class="inline-flex items-center px-1.5 py-0.5 rounded-full text-[11px] font-medium shrink-0"
    :class="typeClass(type)"
  >
    {{ typeLabel(type) }}
  </span>
</template>

<script setup lang="ts">
  import { typeClass, typeLabel } from '@/entities/task'

  defineProps<{
    type: string
  }>()
</script>
