<template>
  <div
    class="TaskKanbanCard rounded-lg border border-border-default bg-bg-primary p-3 cursor-grab active:cursor-grabbing shadow-sm hover:shadow transition-shadow text-left relative"
    :class="{ 'TaskKanbanCard--saving': saving }"
    @click.stop="$emit('click', task)"
  >
    <div
      v-if="saving"
      class="absolute inset-0 rounded-lg bg-bg-primary/80 flex items-center justify-center z-10 transition-opacity"
      aria-hidden
    >
      <span class="text-xs text-text-muted">Сохранение…</span>
    </div>
    <div class="flex flex-wrap items-center gap-(--spacing-1)">
      <span
        class="inline-flex items-center px-(--spacing-2) py-(--spacing-1) rounded-(--radius-sm) text-(--text-xs) font-medium"
        :class="priorityClass(task.priority)"
      >
        {{ priorityLabel(task.priority) }}
      </span>
      <span
        class="inline-flex items-center px-(--spacing-2) py-(--spacing-1) rounded-(--radius-sm) text-(--text-xs) bg-bg-tertiary text-text-secondary"
      >
        {{ typeLabel(task.type) }}
      </span>
    </div>
    <div class="font-medium text-text-primary truncate mt-(--spacing-1)">{{ task.title }}</div>
    <p v-if="task.description" class="mt-(--spacing-1) text-(--text-sm) text-text-secondary line-clamp-2">
      {{ task.description }}
    </p>
    <p class="mt-(--spacing-1) text-(--text-xs) text-text-muted">
      {{ formatDate(task.dueDate) }}
      <span v-if="assigneeName" class="ml-(--spacing-2)">→ {{ assigneeName }}</span>
    </p>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import type { Task } from '@/entities/task'
  import { priorityClass, priorityLabel, typeLabel } from '../lib/task-labels'

  const props = defineProps<{
    task: Task
    assigneeOptions?: { value: string; label: string }[]
    formatDate: (s: string) => string
    saving?: boolean
  }>()

  defineEmits<{
    click: [task: Task]
  }>()

  const assigneeName = computed(() => {
    const opts = props.assigneeOptions ?? []
    const opt = opts.find((o) => o.value === props.task.assigneeId)
    return opt?.label ?? ''
  })
</script>

<style scoped>
  .TaskKanbanCard--saving {
    pointer-events: none;
  }
</style>
