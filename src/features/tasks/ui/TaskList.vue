<template>
  <ul class="space-y-(--spacing-3)" v-auto-animate>
    <TaskCard
      v-for="task in tasks"
      :key="task.id"
      :task="task"
      :format-date="formatDate"
      :assignee-name="assigneeName(task)"
      variant="full"
      @click="$emit('view', task)"
    >
      <template v-if="canShowActions" #actions="{ task: t }">
        <Tooltip trigger="click" placement="bottom" variant="dropdown">
          <template #trigger>
            <Button variant="ghost" size="md" class="!p-2">
              <CogIcon class="w-5 h-5 text-text-muted hover:text-text-secondary" />
            </Button>
          </template>
          <div class="w-48 bg-bg-primary rounded-lg shadow-card border border-border-default py-1">
            <PermissionGuard :permission="TASKS_PERMISSIONS.taskUpdate">
              <Button
                v-if="t.status === 'pending'"
                variant="ghost"
                size="md"
                custom-class="w-full justify-start !px-4 !py-2 text-text-primary hover:bg-bg-tertiary"
                @click="$emit('start', t)"
              >
                В работу
              </Button>
              <Button
                v-else-if="t.status !== 'completed'"
                variant="ghost"
                size="md"
                custom-class="w-full justify-start !px-4 !py-2 text-text-primary hover:bg-bg-tertiary"
                @click="$emit('complete', t)"
              >
                Выполнить
              </Button>
              <Button
                v-else
                variant="ghost"
                size="md"
                custom-class="w-full justify-start !px-4 !py-2 text-text-primary hover:bg-bg-tertiary"
                @click="$emit('reopen', t)"
              >
                Вернуть
              </Button>
              <Button
                variant="ghost"
                size="md"
                custom-class="w-full justify-start !px-4 !py-2 text-text-primary hover:bg-bg-tertiary"
                @click="$emit('edit', t)"
              >
                Изменить
              </Button>
            </PermissionGuard>
            <PermissionGuard :permission="TASKS_PERMISSIONS.taskDelete">
              <Button
                variant="ghost"
                size="md"
                custom-class="w-full justify-start !px-4 !py-2 text-error-default hover:bg-error-light"
                @click="$emit('delete', t)"
              >
                Удалить
              </Button>
            </PermissionGuard>
          </div>
        </Tooltip>
      </template>
    </TaskCard>
  </ul>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { Button, Tooltip } from '@/shared/ui'
  import { CogIcon } from '@/shared/ui/icon'
  import { PermissionGuard, usePermissions } from '@/features/permissions'
  import { TASKS_PERMISSIONS } from '@/features/permissions/config'
  import TaskCard from './TaskCard.vue'
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

  function assigneeName(task: Task) {
    const opts = props.assigneeOptions ?? []
    const opt = opts.find((o) => o.value === task.assigneeId)
    return opt?.label ?? ''
  }
</script>
