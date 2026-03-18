import { api, API_ENDPOINTS } from '@/shared/api'
import type {
  Task,
  TaskComment,
  CreateTaskDto,
  UpdateTaskDto,
  TaskFilters,
} from '@/entities/task/types/task'

export interface TasksListParams extends TaskFilters {
  workspaceId: string
}

export interface TasksListResponse {
  tasks: Task[]
}

export const taskService = {
  getList: async (params: TasksListParams): Promise<Task[]> => {
    const q = new URLSearchParams()
    if (params.status) q.set('status', params.status)
    if (params.priority) q.set('priority', params.priority)
    if (params.type) q.set('type', params.type)
    if (params.assigneeId) q.set('assigneeId', params.assigneeId)
    if (params.entityType) q.set('entityType', params.entityType)
    if (params.entityId) q.set('entityId', params.entityId)
    if (params.parentId) q.set('parentId', params.parentId)
    if (params.overdue) q.set('overdue', 'true')
    if (params.search) q.set('search', params.search)
    if (params.page != null) q.set('page', String(params.page))
    if (params.limit != null) q.set('limit', String(params.limit))
    const query = q.toString()
    const url = query
      ? `${API_ENDPOINTS.TASKS.LIST(params.workspaceId)}?${query}`
      : API_ENDPOINTS.TASKS.LIST(params.workspaceId)
    const res = await api.get<TasksListResponse>(url)
    return res.tasks ?? []
  },

  getById: async (workspaceId: string, id: string): Promise<Task> => {
    return api.get<Task>(API_ENDPOINTS.TASKS.DETAIL(workspaceId, id))
  },

  create: async (workspaceId: string, data: CreateTaskDto): Promise<Task> => {
    return api.post<Task>(API_ENDPOINTS.TASKS.LIST(workspaceId), data)
  },

  update: async (
    workspaceId: string,
    id: string,
    data: UpdateTaskDto,
  ): Promise<Task> => {
    return api.patch<Task>(API_ENDPOINTS.TASKS.DETAIL(workspaceId, id), data)
  },

  delete: async (workspaceId: string, id: string): Promise<void> => {
    await api.delete(API_ENDPOINTS.TASKS.DETAIL(workspaceId, id))
  },

  complete: async (
    workspaceId: string,
    id: string,
    note?: string,
  ): Promise<Task> => {
    return api.post<Task>(
      API_ENDPOINTS.TASKS.COMPLETE(workspaceId, id),
      note ? { note } : {},
    )
  },

  reopen: async (workspaceId: string, id: string): Promise<Task> => {
    return api.post<Task>(API_ENDPOINTS.TASKS.REOPEN(workspaceId, id), {})
  },

  getComments: async (
    workspaceId: string,
    taskId: string,
  ): Promise<TaskComment[]> => {
    const res = await api.get<{ comments?: TaskComment[] } | TaskComment[]>(
      API_ENDPOINTS.TASKS.COMMENTS(workspaceId, taskId),
    )
    const raw = Array.isArray(res) ? res : (res?.comments ?? [])
    return raw.map((c) => ({
      ...c,
      parentId: c.parentId ?? (c as { parent_id?: string }).parent_id ?? undefined,
    }))
  },

  createComment: async (
    workspaceId: string,
    taskId: string,
    body: string,
    parentId?: string,
  ): Promise<TaskComment> => {
    return api.post<TaskComment>(
      API_ENDPOINTS.TASKS.COMMENTS(workspaceId, taskId),
      { body, parentId: parentId || undefined },
    )
  },

  updateComment: async (
    workspaceId: string,
    taskId: string,
    commentId: string,
    body: string,
  ): Promise<TaskComment> => {
    return api.patch<TaskComment>(
      API_ENDPOINTS.TASKS.COMMENT(workspaceId, taskId, commentId),
      { body },
    )
  },

  deleteComment: async (
    workspaceId: string,
    taskId: string,
    commentId: string,
  ): Promise<void> => {
    await api.delete(
      API_ENDPOINTS.TASKS.COMMENT(workspaceId, taskId, commentId),
    )
  },
}
