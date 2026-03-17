import { ref, computed, watch } from 'vue'
import { useUserStore } from '@/entities/user'
import { taskService } from '@/entities/task'
import { workspaceService } from '@/entities/workspace'
import type { Task, CreateTaskDto } from '@/entities/task'
import { formatDateRu } from '@/shared/lib'

export interface UseTaskEntityPanelProps {
  workspaceId: string
  entityType: string
  entityId: string
  entityName?: string
}

export function useTaskEntityPanel(props: UseTaskEntityPanelProps) {
  const userStore = useUserStore()
  const tasks = ref<Task[]>([])
  const members = ref<{ id: string; name: string; email: string }[]>([])
  const loading = ref(true)
  const saving = ref(false)
  const showModal = ref(false)
  const showDeleteModal = ref(false)
  const editingTask = ref<Task | null>(null)
  const deleteTarget = ref<Task | null>(null)

  const currentUserId = computed(() => userStore.currentUser?.id ?? '')
  const assigneeOptions = computed(() => {
    const opts = members.value.map((m) => ({ value: m.id, label: m.name || m.email }))
    if (opts.length === 0 && currentUserId.value) {
      opts.push({ value: currentUserId.value, label: 'Текущий пользователь' })
    }
    return opts
  })

  const defaultEntities = computed(() => [
    {
      entityType: props.entityType,
      entityId: props.entityId,
      entityName: props.entityName,
    },
  ])

  async function fetchTasks() {
    if (!props.workspaceId || !props.entityType || !props.entityId) {
      tasks.value = []
      loading.value = false
      return
    }
    loading.value = true
    try {
      tasks.value = await taskService.getList({
        workspaceId: props.workspaceId,
        entityType: props.entityType,
        entityId: props.entityId,
        parentId: 'root',
      })
    } catch (e) {
      console.error('Failed to fetch tasks:', e)
      tasks.value = []
    } finally {
      loading.value = false
    }
  }

  async function fetchMembers() {
    if (!props.workspaceId) return
    try {
      const list = await workspaceService.getWorkspaceMembers(props.workspaceId)
      members.value = list.map((m) => ({ id: m.id, name: m.name, email: m.email }))
    } catch (e) {
      console.error('Failed to fetch members:', e)
      members.value = []
    }
  }

  function openCreate() {
    editingTask.value = null
    showModal.value = true
  }

  function openEdit(task: Task) {
    editingTask.value = task
    showModal.value = true
  }

  function closeModal() {
    showModal.value = false
    editingTask.value = null
  }

  function confirmDelete(task: Task) {
    deleteTarget.value = task
    showDeleteModal.value = true
  }

  function closeDeleteModal() {
    showDeleteModal.value = false
    deleteTarget.value = null
  }

  async function saveTask(form: Partial<CreateTaskDto>) {
    if (!props.workspaceId) return
    saving.value = true
    try {
      if (editingTask.value) {
        await taskService.update(props.workspaceId, editingTask.value.id, form as any)
      } else {
        const dto: CreateTaskDto = {
          title: form.title!,
          description: form.description,
          type: (form.type as CreateTaskDto['type']) ?? 'other',
          priority: (form.priority as CreateTaskDto['priority']) ?? 'medium',
          dueDate: form.dueDate!,
          dueTime: form.dueTime,
          assigneeId: form.assigneeId ?? currentUserId.value,
          entities: defaultEntities.value,
        }
        await taskService.create(props.workspaceId, dto)
      }
      closeModal()
      await fetchTasks()
    } catch (e) {
      console.error('Failed to save task:', e)
      throw e
    } finally {
      saving.value = false
    }
  }

  async function doDelete() {
    const task = deleteTarget.value
    if (!task || !props.workspaceId) return
    try {
      await taskService.delete(props.workspaceId, task.id)
      closeDeleteModal()
      await fetchTasks()
    } catch (e) {
      console.error('Failed to delete task:', e)
    }
  }

  async function completeTask(task: Task) {
    if (!props.workspaceId) return
    try {
      await taskService.complete(props.workspaceId, task.id)
      await fetchTasks()
    } catch (e) {
      console.error('Failed to complete task:', e)
    }
  }

  async function reopenTask(task: Task) {
    if (!props.workspaceId) return
    try {
      await taskService.reopen(props.workspaceId, task.id)
      await fetchTasks()
    } catch (e) {
      console.error('Failed to reopen task:', e)
    }
  }

  function formatDate(s: string) {
    if (!s) return ''
    return formatDateRu(s, 'd MMM yyyy')
  }

  watch(
    () => [props.workspaceId, props.entityType, props.entityId],
    () => {
      fetchTasks()
      fetchMembers()
    },
    { immediate: true },
  )

  return {
    tasks,
    assigneeOptions,
    loading,
    saving,
    showModal,
    showDeleteModal,
    editingTask,
    deleteTarget,
    currentUserId,
    defaultEntities,
    fetchTasks,
    openCreate,
    openEdit,
    closeModal,
    closeDeleteModal,
    saveTask,
    confirmDelete,
    doDelete,
    completeTask,
    reopenTask,
    formatDate,
  }
}
