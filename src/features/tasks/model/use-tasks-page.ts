import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useWorkspaceStore } from '@/entities/workspace'
import { useUserStore } from '@/entities/user'
import { taskService } from '@/entities/task'
import type {
  Task,
  CreateTaskDto,
  UpdateTaskDto,
  TaskStatus,
  TaskPriority,
  TaskType,
} from '@/entities/task'
import { workspaceService } from '@/entities/workspace'
import { formatDateRu, useDebounceFn } from '@/shared/lib'
import { useTasksKanban } from './use-tasks-kanban'

export function useTasksPage() {
  const route = useRoute()
  const router = useRouter()
  const workspaceStore = useWorkspaceStore()
  const userStore = useUserStore()
  const tasks = ref<Task[]>([])
  const members = ref<{ id: string; name: string; email: string }[]>([])
  const loading = ref(true)
  const saving = ref(false)
  const showModal = ref(false)
  const showDetailModal = ref(false)
  const showDeleteModal = ref(false)
  const editingTask = ref<Task | null>(null)
  const detailTask = ref<Task | null>(null)
  const deleteTarget = ref<Task | null>(null)

  const statusFilter = ref<string>((route.query.status as string) || '')
  const priorityFilter = ref<string>((route.query.priority as string) || '')
  const typeFilter = ref<string>((route.query.type as string) || '')
  const assigneeFilter = ref<string>((route.query.assigneeId as string) || '')
  const searchQuery = ref<string>((route.query.search as string) || '')
  const searchDisplay = ref<string>((route.query.search as string) || '')
  const myTasksOnly = ref<boolean>(route.query.my === 'true' || route.query.my === '1')
  const overdueOnly = ref<boolean>(route.query.overdue === 'true' || route.query.overdue === '1')

  const workspaceId = computed(() => workspaceStore.currentWorkspace?.id ?? '')
  const currentUserId = computed(() => userStore.currentUser?.id ?? '')

  const assigneeOptions = computed(() => {
    const opts = members.value.map((m) => ({ value: m.id, label: m.name || m.email }))
    if (opts.length === 0 && currentUserId.value) {
      opts.push({ value: currentUserId.value, label: 'Текущий пользователь' })
    }
    return opts
  })

  function syncFiltersToUrl() {
    const q: Record<string, string> = {}
    if (statusFilter.value) q.status = statusFilter.value
    if (priorityFilter.value) q.priority = priorityFilter.value
    if (typeFilter.value) q.type = typeFilter.value
    if (assigneeFilter.value) q.assigneeId = assigneeFilter.value
    if (searchQuery.value) q.search = searchQuery.value
    if (myTasksOnly.value) q.my = 'true'
    if (overdueOnly.value) q.overdue = 'true'
    router.replace({ query: q })
  }

  watch(
    [
      statusFilter,
      priorityFilter,
      typeFilter,
      assigneeFilter,
      searchQuery,
      myTasksOnly,
      overdueOnly,
    ],
    syncFiltersToUrl,
    { deep: true },
  )

  watch(
    () => route.query,
    (q) => {
      statusFilter.value = (q.status as string) || ''
      priorityFilter.value = (q.priority as string) || ''
      typeFilter.value = (q.type as string) || ''
      assigneeFilter.value = (q.assigneeId as string) || ''
      const s = (q.search as string) || ''
      searchQuery.value = s
      searchDisplay.value = s
      myTasksOnly.value = q.my === 'true' || q.my === '1'
      overdueOnly.value = q.overdue === 'true' || q.overdue === '1'
    },
    { immediate: true },
  )

  async function fetchTasks() {
    if (!workspaceId.value) {
      tasks.value = []
      loading.value = false
      return
    }
    loading.value = true
    try {
      const assigneeId = myTasksOnly.value ? currentUserId.value : assigneeFilter.value || undefined
      const list = await taskService.getList({
        workspaceId: workspaceId.value,
        status: (statusFilter.value || undefined) as TaskStatus | undefined,
        priority: (priorityFilter.value || undefined) as TaskPriority | undefined,
        type: (typeFilter.value || undefined) as TaskType | undefined,
        assigneeId: assigneeId || undefined,
        parentId: 'root',
        overdue: overdueOnly.value || undefined,
        search: searchQuery.value || undefined,
      })
      tasks.value = list
    } catch (e) {
      console.error('Failed to fetch tasks:', e)
      tasks.value = []
    } finally {
      loading.value = false
    }
  }

  async function fetchMembers() {
    if (!workspaceId.value) return
    try {
      const list = await workspaceService.getWorkspaceMembers(workspaceId.value)
      members.value = list.map((m) => ({ id: m.id, name: m.name, email: m.email }))
    } catch (e) {
      console.error('Failed to fetch members:', e)
      members.value = []
    }
  }

  function openCreate() {
    editingTask.value = null
    creatingSubtaskFor.value = null
    showModal.value = true
  }

  function viewTask(task: Task) {
    detailTask.value = task
    showDetailModal.value = true
  }

  function openEdit(task: Task) {
    showDetailModal.value = false
    detailTask.value = null
    editingTask.value = task
    creatingSubtaskFor.value = null
    showModal.value = true
  }

  const creatingSubtaskFor = ref<Task | null>(null)
  const subtasksRefreshKey = ref(0)

  function openAddSubtask(parentTask: Task) {
    creatingSubtaskFor.value = parentTask
    editingTask.value = null
    showModal.value = true
  }

  const parentTaskForSubtask = ref<Task | null>(null)

  function viewSubtask(task: Task) {
    parentTaskForSubtask.value =
      task.parentId && detailTask.value?.id === task.parentId ? detailTask.value : null
    detailTask.value = task
    showDetailModal.value = true
  }

  async function viewParent(parentId: string) {
    if (!workspaceId.value) return
    try {
      const parent = await taskService.getById(workspaceId.value, parentId)
      detailTask.value = parent
      parentTaskForSubtask.value = null
      showDetailModal.value = true
    } catch (e) {
      console.error('Failed to fetch parent task:', e)
    }
  }

  async function viewLinkedTask(taskId: string) {
    if (!workspaceId.value) return
    try {
      const t = await taskService.getById(workspaceId.value, taskId)
      detailTask.value = t
      parentTaskForSubtask.value = null
      showDetailModal.value = true
    } catch (e) {
      console.error('Failed to fetch linked task:', e)
    }
  }

  function onTaskUpdated(updated: Task) {
    if (detailTask.value?.id === updated.id) {
      detailTask.value = updated
    }
    tasks.value = tasks.value.map((t) => (t.id === updated.id ? updated : t))
  }

  function refreshSubtasks() {
    subtasksRefreshKey.value++
  }

  function closeDetailModal() {
    showDetailModal.value = false
    detailTask.value = null
    parentTaskForSubtask.value = null
  }

  function closeModal() {
    showModal.value = false
    editingTask.value = null
    creatingSubtaskFor.value = null
  }

  function confirmDelete(task: Task) {
    deleteTarget.value = task
    showDeleteModal.value = true
  }

  function closeDeleteModal() {
    showDeleteModal.value = false
    deleteTarget.value = null
  }

  async function saveTask(form: Partial<CreateTaskDto & UpdateTaskDto>) {
    if (!workspaceId.value) return
    saving.value = true
    try {
      if (editingTask.value) {
        const updatePayload: UpdateTaskDto = {
          ...form,
          status: form.status as UpdateTaskDto['status'],
          duration: form.duration,
        }
        await taskService.update(workspaceId.value, editingTask.value.id, updatePayload)
      } else {
        const dto: CreateTaskDto = {
          title: form.title!,
          description: form.description,
          type: (form.type as CreateTaskDto['type']) ?? 'task',
          priority: (form.priority as CreateTaskDto['priority']) ?? 'medium',
          status: form.status as CreateTaskDto['status'],
          dueDate: form.dueDate!,
          dueTime: form.dueTime,
          assigneeId: form.assigneeId ?? currentUserId.value,
          parentId: form.parentId ?? creatingSubtaskFor.value?.id,
          entities: form.entities,
          duration: form.duration,
        }
        await taskService.create(workspaceId.value, dto)
      }
      const wasSubtask = !!creatingSubtaskFor.value
      closeModal()
      creatingSubtaskFor.value = null
      refreshSubtasks()
      if (!wasSubtask) await fetchTasks()
    } catch (e) {
      console.error('Failed to save task:', e)
      throw e
    } finally {
      saving.value = false
    }
  }

  async function doDelete() {
    const task = deleteTarget.value
    if (!task || !workspaceId.value) return
    try {
      await taskService.delete(workspaceId.value, task.id)
      closeDeleteModal()
      closeDetailModal()
      await fetchTasks()
    } catch (e) {
      console.error('Failed to delete task:', e)
    }
  }

  async function completeTask(task: Task, note?: string) {
    if (!workspaceId.value) return
    try {
      await taskService.complete(workspaceId.value, task.id, note)
      closeDetailModal()
      await fetchTasks()
    } catch (e) {
      console.error('Failed to complete task:', e)
    }
  }

  function formatDate(s: string) {
    if (!s) return ''
    return formatDateRu(s, 'd MMM yyyy')
  }

  function formatDateTime(s: string) {
    if (!s) return ''
    return formatDateRu(s, 'd MMM yyyy HH:mm')
  }

  onMounted(() => {
    fetchMembers()
  })
  watch(
    workspaceId,
    () => {
      fetchTasks()
      fetchMembers()
    },
    { immediate: true },
  )
  const debouncedFetchForSearch = useDebounceFn(fetchTasks, 400)
  watch(
    [
      statusFilter,
      priorityFilter,
      typeFilter,
      assigneeFilter,
      myTasksOnly,
      overdueOnly,
      currentUserId,
    ],
    fetchTasks,
  )
  watch(searchQuery, () => debouncedFetchForSearch())

  async function reopenTask(task: Task) {
    if (!workspaceId.value) return
    try {
      await taskService.reopen(workspaceId.value, task.id)
      closeDetailModal()
      await fetchTasks()
    } catch (e) {
      console.error('Failed to reopen task:', e)
    }
  }

  async function startTask(task: Task) {
    if (!workspaceId.value) return
    try {
      await taskService.update(workspaceId.value, task.id, { status: 'in_progress' })
      await fetchTasks()
    } catch (e) {
      console.error('Failed to start task:', e)
    }
  }

  async function updateTaskStatus(taskId: string, status: string) {
    if (!workspaceId.value) return
    const task = tasks.value.find((t) => t.id === taskId)
    if (!task) return
    const prevStatus = task.status
    tasks.value = tasks.value.map((t) =>
      t.id === taskId ? { ...t, status: status as TaskStatus } : t,
    )
    try {
      await taskService.update(workspaceId.value, taskId, { status: status as TaskStatus })
      await fetchTasks()
    } catch (e) {
      tasks.value = tasks.value.map((t) => (t.id === taskId ? { ...t, status: prevStatus } : t))
      throw e
    }
  }

  const viewMode = ref<'list' | 'kanban'>('list')
  const kanban = useTasksKanban(tasks, updateTaskStatus)

  return {
    tasks,
    members,
    assigneeOptions,
    loading,
    saving,
    showModal,
    showDetailModal,
    showDeleteModal,
    editingTask,
    detailTask,
    deleteTarget,
    statusFilter,
    priorityFilter,
    typeFilter,
    assigneeFilter,
    searchQuery,
    searchDisplay,
    myTasksOnly,
    overdueOnly,
    workspaceId,
    currentUserId,
    fetchTasks,
    openCreate,
    viewTask,
    openEdit,
    openAddSubtask,
    viewSubtask,
    viewParent,
    viewLinkedTask,
    onTaskUpdated,
    parentTaskForSubtask,
    creatingSubtaskFor,
    subtasksRefreshKey,
    closeModal,
    closeDetailModal,
    closeDeleteModal,
    saveTask,
    confirmDelete,
    doDelete,
    completeTask,
    reopenTask,
    startTask,
    formatDate,
    formatDateTime,
    viewMode,
    kanbanColumns: kanban.kanbanColumns,
    savingTaskIds: kanban.savingTaskIds,
    handleTaskMove: kanban.handleTaskMove,
  }
}
