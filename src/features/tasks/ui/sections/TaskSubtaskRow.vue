<template>
  <li
    class="TaskSubtaskRow flex items-center justify-between gap-(--spacing-2) py-(--spacing-2) px-(--spacing-3) rounded-(--radius-sm) cursor-pointer min-w-0"
    @click="$emit('click', task)"
  >
    <div class="flex items-center gap-(--spacing-2) min-w-0 flex-1">
      <PriorityBadge :priority="task.priority" />
      <StatusBadge :status="task.status" />
      <span class="text-(--text-xs) text-text-primary truncate">{{ task.title }}</span>
    </div>
    <span class="text-[11px] text-text-muted shrink-0">{{ formatDate(task.dueDate) }}</span>
  </li>
</template>

<script setup lang="ts">
  import { PriorityBadge, StatusBadge } from './index'
  import type { Task } from '@/entities/task'

  defineProps<{
    task: Task
    formatDate: (s: string) => string
  }>()

  defineEmits<{
    click: [task: Task]
  }>()
</script>

<style scoped>
  @media (hover: hover) {
    .TaskSubtaskRow:hover {
      background-color: var(--color-bg-tertiary);
    }
  }
</style>
