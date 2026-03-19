<template>
  <Tooltip trigger="click" placement="bottom" variant="dropdown">
    <template #trigger>
      <button
        type="button"
        class="inline-flex items-center px-1.5 py-0.5 rounded-full text-[11px] font-medium shrink-0 cursor-pointer transition-opacity hover:opacity-90 disabled:opacity-50"
        :class="priorityClass(priority)"
        :disabled="saving"
      >
        {{ priorityLabel(priority) }}
      </button>
    </template>
    <div class="w-40 bg-bg-primary rounded-lg shadow-card border border-border-default py-1">
      <button
        v-for="opt in priorityOptions"
        :key="opt.value"
        type="button"
        class="w-full text-left px-3 py-1.5 text-(--text-xs) text-text-primary hover:bg-bg-tertiary transition-colors"
        :class="{ 'bg-bg-tertiary': priority === opt.value }"
        @click="$emit('change', opt.value)"
      >
        {{ opt.label }}
      </button>
    </div>
  </Tooltip>
</template>

<script setup lang="ts">
  import { priorityClass, priorityLabel } from '@/entities/task'
  import { Tooltip } from '@/shared/ui'
  import type { TaskPriority } from '@/entities/task'

  defineProps<{
    priority: string
    saving?: boolean
  }>()

  defineEmits<{
    change: [priority: TaskPriority]
  }>()

  const priorityOptions: { value: TaskPriority; label: string }[] = [
    { value: 'low', label: 'Низкий' },
    { value: 'medium', label: 'Средний' },
    { value: 'high', label: 'Высокий' },
    { value: 'critical', label: 'Критический' },
  ]
</script>
