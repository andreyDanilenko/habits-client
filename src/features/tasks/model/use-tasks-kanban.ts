import { ref, watch, type Ref } from 'vue'
import type { Task } from '@/entities/task'
import type { KanbanColumnModel } from '@/shared/ui'

const TASK_STATUS_COLUMNS: { id: string; title: string; color?: string }[] = [
  { id: 'pending', title: 'К выполнению', color: '#94a3b8' },
  { id: 'in_progress', title: 'В работе', color: '#3b82f6' },
  { id: 'completed', title: 'Выполнена', color: '#22c55e' },
  { id: 'cancelled', title: 'Отменена', color: '#94a3b8' },
]

export function useTasksKanban(
  tasks: Ref<Task[]>,
  updateTaskStatus: (taskId: string, status: string) => Promise<void>,
) {
  const kanbanColumns = ref<KanbanColumnModel<Task>[]>([])
  const savingTaskIds = ref<Set<string>>(new Set())

  function buildKanbanColumns(): KanbanColumnModel<Task>[] {
    const list = tasks.value ?? []
    const seenIds = new Set<string>()
    const unique: Task[] = []
    for (const t of list) {
      if (seenIds.has(t.id)) continue
      seenIds.add(t.id)
      unique.push(t)
    }

    return TASK_STATUS_COLUMNS.map((col) => ({
      id: col.id,
      title: col.title,
      color: col.color,
      items: unique.filter((t) => t.status === col.id),
      meta: {},
    }))
  }

  function syncKanbanColumnsInPlace() {
    const list = tasks.value ?? []
    const seenIds = new Set<string>()
    const unique: Task[] = []
    for (const t of list) {
      if (seenIds.has(t.id)) continue
      seenIds.add(t.id)
      unique.push(t)
    }

    const current = kanbanColumns.value
    if (current.length === TASK_STATUS_COLUMNS.length) {
      for (let i = 0; i < TASK_STATUS_COLUMNS.length; i++) {
        const col = TASK_STATUS_COLUMNS[i]
        current[i].title = col.title
        current[i].color = col.color
        current[i].items = unique.filter((t) => t.status === col.id)
      }
      return
    }
    kanbanColumns.value = buildKanbanColumns()
  }

  watch(tasks, () => syncKanbanColumnsInPlace(), { immediate: true })

  async function handleTaskMove(payload: { item: unknown; toColumnId?: string }) {
    const task = payload.item as Task
    const toStatus = payload.toColumnId
    if (!toStatus || !task?.id || task.status === toStatus) return

    savingTaskIds.value = new Set(savingTaskIds.value).add(task.id)

    try {
      await updateTaskStatus(task.id, toStatus)
    } catch {
      syncKanbanColumnsInPlace()
    } finally {
      const next = new Set(savingTaskIds.value)
      next.delete(task.id)
      savingTaskIds.value = next
    }
  }

  return {
    kanbanColumns,
    savingTaskIds,
    handleTaskMove,
  }
}
