<template>
  <div class="space-y-4">
    <div v-if="loading && tasks.length === 0" class="flex justify-center py-12">
      <Spinner class="size-8 text-primary-default" />
    </div>
    <div v-else-if="columnsModel.length === 0" class="text-center py-12 text-text-muted">
      Нет задач.
    </div>
    <KanbanBoard
      v-else
      v-model:columns="columnsModel"
      :item-key="(t) => (t as Task).id"
      dnd-group="tasks"
      :disabled="!canMove"
      @move="handleTaskMove"
    >
      <template #column-header="{ column }">
        <div class="flex items-center justify-between gap-2 w-full">
          <span class="font-medium text-text-primary">{{ column.title }}</span>
          <span class="text-sm text-text-muted">{{ column.items.length }}</span>
        </div>
      </template>
      <template #card="{ item }">
        <TaskKanbanCard
          :task="(item as Task)"
          :assignee-options="assigneeOptions"
          :format-date="formatDate"
          :saving="savingTaskIds.has((item as Task).id)"
          @click="$emit('view', item as Task)"
        />
      </template>
    </KanbanBoard>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { KanbanBoard, Spinner } from '@/shared/ui'
  import { usePermissions } from '@/features/permissions'
  import { TASKS_PERMISSIONS } from '@/features/permissions/config'
  import TaskKanbanCard from './TaskKanbanCard.vue'
  import type { Task } from '@/entities/task'
  import type { KanbanColumnModel } from '@/shared/ui'

  const props = defineProps<{
    tasks: Task[]
    savingTaskIds: Set<string>
    assigneeOptions: { value: string; label: string }[]
    formatDate: (s: string) => string
    loading: boolean
  }>()

  const columnsModel = defineModel<KanbanColumnModel<Task>[]>('columns', { required: true })

  const emit = defineEmits<{
    view: [task: Task]
    move: [payload: { item: unknown; toColumnId?: string }]
  }>()

  const { can } = usePermissions()
  const canMove = computed(() => can(TASKS_PERMISSIONS.taskUpdate))

  function handleTaskMove(payload: { item: unknown; toColumnId?: string }) {
    emit('move', payload)
  }
</script>
