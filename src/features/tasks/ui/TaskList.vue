<template>
  <ul class="space-y-(--spacing-3)" v-auto-animate>
    <li
      v-for="task in tasks"
      :key="task.id"
      class="p-(--spacing-4) rounded-(--radius-md) border border-border-light hover:bg-bg-secondary flex justify-between items-start gap-(--spacing-4)"
    >
      <div class="min-w-0 flex-1 cursor-pointer" @click="$emit('view', task)">
        <div class="flex flex-wrap items-center gap-(--spacing-2)">
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
          <span
            v-if="task.status === 'completed'"
            class="inline-flex items-center px-(--spacing-2) py-(--spacing-1) rounded-(--radius-sm) text-(--text-xs) bg-success-light text-success-default"
          >
            Выполнена
          </span>
        </div>
        <h3 class="font-medium text-text-primary truncate mt-(--spacing-1)">{{ task.title }}</h3>
        <p v-if="task.description" class="mt-(--spacing-1) text-(--text-sm) text-text-secondary line-clamp-2">
          {{ task.description }}
        </p>
        <p class="mt-(--spacing-1) text-(--text-xs) text-text-muted">
          {{ formatDate(task.dueDate) }}
          <span v-if="assigneeName(task)" class="ml-(--spacing-2)">→ {{ assigneeName(task) }}</span>
        </p>
      </div>
      <div v-if="canShowActions" class="flex-shrink-0" @click.stop>
        <Tooltip trigger="click" placement="bottom" variant="dropdown">
          <template #trigger>
            <Button variant="ghost" size="md" class="!p-2">
              <CogIcon class="w-5 h-5 text-text-muted hover:text-text-secondary" />
            </Button>
          </template>
          <div class="w-48 bg-bg-primary rounded-lg shadow-card border border-border-default py-1">
            <PermissionGuard :permission="TASKS_PERMISSIONS.taskUpdate">
              <Button
                v-if="task.status === 'pending'"
                variant="ghost"
                size="md"
                custom-class="w-full justify-start !px-4 !py-2 text-text-primary hover:bg-bg-tertiary"
                @click="$emit('start', task)"
              >
                В работу
              </Button>
              <Button
                v-else-if="task.status !== 'completed'"
                variant="ghost"
                size="md"
                custom-class="w-full justify-start !px-4 !py-2 text-text-primary hover:bg-bg-tertiary"
                @click="$emit('complete', task)"
              >
                Выполнить
              </Button>
              <Button
                v-else
                variant="ghost"
                size="md"
                custom-class="w-full justify-start !px-4 !py-2 text-text-primary hover:bg-bg-tertiary"
                @click="$emit('reopen', task)"
              >
                Вернуть
              </Button>
              <Button
                variant="ghost"
                size="md"
                custom-class="w-full justify-start !px-4 !py-2 text-text-primary hover:bg-bg-tertiary"
                @click="$emit('edit', task)"
              >
                Изменить
              </Button>
            </PermissionGuard>
            <PermissionGuard :permission="TASKS_PERMISSIONS.taskDelete">
              <Button
                variant="ghost"
                size="md"
                custom-class="w-full justify-start !px-4 !py-2 text-error-default hover:bg-error-light"
                @click="$emit('delete', task)"
              >
                Удалить
              </Button>
            </PermissionGuard>
          </div>
        </Tooltip>
      </div>
    </li>
  </ul>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { Button, Tooltip } from '@/shared/ui'
  import { CogIcon } from '@/shared/ui/icon'
  import { PermissionGuard, usePermissions } from '@/features/permissions'
  import { TASKS_PERMISSIONS } from '@/features/permissions/config'
  import type { Task } from '@/entities/task'

  const { can } = usePermissions()
  const canShowActions = computed(
    () => can(TASKS_PERMISSIONS.taskUpdate) || can(TASKS_PERMISSIONS.taskDelete),
  )

  const props = defineProps<{
    tasks: Task[]
    assigneeOptions?: { value: string; label: string }[]
    formatDate: (s: string) => string
  }>()

  defineEmits<{
    view: [task: Task]
    edit: [task: Task]
    delete: [task: Task]
    start: [task: Task]
    complete: [task: Task]
    reopen: [task: Task]
  }>()

  function priorityClass(priority: string) {
    const map: Record<string, string> = {
      low: 'bg-bg-tertiary text-text-secondary',
      medium: 'bg-info-light text-info-default',
      high: 'bg-warning-light text-warning-default',
      critical: 'bg-error-light text-error-default',
    }
    return map[priority] ?? map.medium
  }

  function priorityLabel(priority: string) {
    const map: Record<string, string> = {
      low: 'Низкий',
      medium: 'Средний',
      high: 'Высокий',
      critical: 'Критический',
    }
    return map[priority] ?? priority
  }

  function typeLabel(type: string) {
    const map: Record<string, string> = {
      task: 'Задача',
      bug: 'Ошибка',
      feature: 'Функция',
      meeting: 'Встреча',
      call: 'Звонок',
      email: 'Email',
      lunch: 'Обед',
      other: 'Другое',
    }
    return map[type] ?? type
  }

  function assigneeName(task: Task) {
    const opts = props.assigneeOptions ?? []
    const opt = opts.find((o) => o.value === task.assigneeId)
    return opt?.label ?? ''
  }
</script>
