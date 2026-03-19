<template>
  <li
    :class="[
      'flex justify-between gap-(--spacing-4) rounded-(--radius-md) border border-border-light bg-bg-primary hover:bg-bg-secondary transition-colors',
      variant === 'compact'
        ? 'items-center py-(--spacing-3) px-(--spacing-4) gap-(--spacing-3)'
        : 'items-start p-(--spacing-4)',
    ]"
  >
    <div class="min-w-0 flex-1 cursor-pointer" @click="$emit('click', task)">
      <div
        :class="[
          'flex gap-(--spacing-2)',
          variant === 'full' ? 'flex-wrap items-center' : 'items-center',
        ]"
      >
        <PriorityBadge :priority="task.priority" />
        <StatusBadge :status="task.status" />
        <TypeBadge v-if="variant === 'full'" :type="task.type" />
      </div>
      <component
        :is="variant === 'compact' ? 'span' : 'h3'"
        class="font-medium text-text-primary block truncate mt-(--spacing-1)"
      >
        {{ task.title }}
      </component>
      <p
        v-if="variant === 'full' && task.description"
        class="mt-(--spacing-1) text-(--text-sm) text-text-secondary line-clamp-2"
      >
        {{ task.description }}
      </p>
      <p
        :class="[
          'mt-(--spacing-1) text-text-muted',
          variant === 'compact' ? 'text-(--text-sm)' : 'text-(--text-xs)',
        ]"
      >
        {{ formatDate(task.dueDate) }}
        <span v-if="variant === 'full' && assigneeName" class="ml-(--spacing-2)"
          >→ {{ assigneeName }}</span
        >
      </p>
    </div>
    <div v-if="$slots.actions" class="shrink-0" @click.stop>
      <slot name="actions" :task="task" />
    </div>
  </li>
</template>

<script setup lang="ts">
  import { PriorityBadge, StatusBadge, TypeBadge } from './sections'
  import type { Task } from '@/entities/task'

  defineProps<{
    task: Task
    formatDate: (s: string) => string
    assigneeName?: string
    variant?: 'compact' | 'full'
  }>()

  defineEmits<{
    click: [task: Task]
  }>()
</script>
