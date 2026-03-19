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

  update: async (workspaceId: string, id: string, data: UpdateTaskDto): Promise<Task> => {
    return api.patch<Task>(API_ENDPOINTS.TASKS.DETAIL(workspaceId, id), data)
  },

  delete: async (workspaceId: string, id: string): Promise<void> => {
    await api.delete(API_ENDPOINTS.TASKS.DETAIL(workspaceId, id))
  },

  complete: async (workspaceId: string, id: string, note?: string): Promise<Task> => {
    return api.post<Task>(API_ENDPOINTS.TASKS.COMPLETE(workspaceId, id), note ? { note } : {})
  },

  reopen: async (workspaceId: string, id: string): Promise<Task> => {
    return api.post<Task>(API_ENDPOINTS.TASKS.REOPEN(workspaceId, id), {})
  },

  getComments: async (workspaceId: string, taskId: string): Promise<TaskComment[]> => {
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
    return api.post<TaskComment>(API_ENDPOINTS.TASKS.COMMENTS(workspaceId, taskId), {
      body,
      parentId: parentId || undefined,
    })
  },

  updateComment: async (
    workspaceId: string,
    taskId: string,
    commentId: string,
    body: string,
  ): Promise<TaskComment> => {
    return api.patch<TaskComment>(API_ENDPOINTS.TASKS.COMMENT(workspaceId, taskId, commentId), {
      body,
    })
  },

  deleteComment: async (workspaceId: string, taskId: string, commentId: string): Promise<void> => {
    await api.delete(API_ENDPOINTS.TASKS.COMMENT(workspaceId, taskId, commentId))
  },

  getTaskLinks: async (
    workspaceId: string,
    taskId: string,
  ): Promise<{ id: string; linkedTaskId: string; linkType: string; linkedTitle: string; linkedPriority: string }[]> => {
    const res = await api.get<{ links?: Array<{
      id: string
      linkedTaskId: string
      linkType: string
      linkedTitle: string
      linkedPriority: string
    }> }>(API_ENDPOINTS.TASKS.LINKS(workspaceId, taskId))
    const raw = res?.links ?? []
    return raw
  },

  addTaskLink: async (
    workspaceId: string,
    currentTaskId: string,
    linkedTaskId: string,
    linkType: 'blocks' | 'blocked_by',
  ) => {
    if (linkType === 'blocks') {
      return api.post(API_ENDPOINTS.TASKS.LINKS(workspaceId, currentTaskId), {
        linkedTaskId,
        linkType: 'blocks',
      })
    }
    // blocked_by: linked task blocks us → (linkedTaskId, currentTaskId, 'blocks')
    return api.post(API_ENDPOINTS.TASKS.LINKS(workspaceId, linkedTaskId), {
      linkedTaskId: currentTaskId,
      linkType: 'blocks',
    })
  },

  deleteTaskLink: async (
    workspaceId: string,
    taskId: string,
    linkId: string,
  ): Promise<void> => {
    await api.delete(API_ENDPOINTS.TASKS.LINK(workspaceId, taskId, linkId))
  },

  getAttachments: async (
    workspaceId: string,
    taskId: string,
  ): Promise<{ id: string; fileName: string; fileSize?: number; url: string; mimeType?: string }[]> => {
    const res = await api.get<{ attachments?: Array<{
      id: string
      fileName: string
      fileSize?: number
      url: string
      mimeType?: string
    }> }>(API_ENDPOINTS.TASKS.ATTACHMENTS(workspaceId, taskId))
    const raw = res?.attachments ?? []
    const baseUrl = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')
    return raw.map((a) => ({
      id: a.id,
      fileName: a.fileName,
      fileSize: a.fileSize,
      url: a.url ? baseUrl + (a.url.startsWith('/') ? a.url : '/' + a.url) : '',
      mimeType: a.mimeType,
    }))
  },

  uploadAttachment: async (
    workspaceId: string,
    taskId: string,
    file: File,
  ): Promise<{ id: string; fileName: string; fileSize?: number; url: string; mimeType?: string }> => {
    const formData = new FormData()
    formData.append('file', file)
    const res = await api.post<{
      id: string
      fileName: string
      fileSize?: number
      url: string
      mimeType?: string
    }>(API_ENDPOINTS.TASKS.ATTACHMENTS(workspaceId, taskId), formData, {
      headers: { 'Content-Type': undefined } as Record<string, unknown>,
    })
    const baseUrl = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')
    return {
      id: res.id,
      fileName: res.fileName,
      fileSize: res.fileSize,
      url: res.url ? baseUrl + (res.url.startsWith('/') ? res.url : '/' + res.url) : '',
      mimeType: res.mimeType,
    }
  },

  deleteAttachment: async (
    workspaceId: string,
    taskId: string,
    attachmentId: string,
  ): Promise<void> => {
    await api.delete(API_ENDPOINTS.TASKS.ATTACHMENT(workspaceId, taskId, attachmentId))
  },

  getPreviewToken: async (
    workspaceId: string,
    taskId: string,
    attachmentId: string,
  ): Promise<{ token: string; url: string; expiresIn: number }> => {
    const res = await api.get<{ token?: string; url?: string; expiresIn?: number }>(
      API_ENDPOINTS.TASKS.ATTACHMENT_PREVIEW_TOKEN(workspaceId, taskId, attachmentId),
    )
    const baseUrl = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')
    const url = res.url ? baseUrl + (res.url.startsWith('/') ? res.url : '/' + res.url) : ''
    return {
      token: res.token ?? '',
      url,
      expiresIn: res.expiresIn ?? 300,
    }
  },

  getTaskActivities: async (
    workspaceId: string,
    taskId: string,
    limit = 50,
    offset = 0,
  ): Promise<{ activities: TaskActivity[]; total: number }> => {
    const url = `${API_ENDPOINTS.TASKS.ACTIVITIES(workspaceId, taskId)}?limit=${limit}&offset=${offset}`
    const res = await api.get<{ activities?: TaskActivity[]; total?: number }>(url)
    return {
      activities: res?.activities ?? [],
      total: res?.total ?? 0,
    }
  },
}

export interface TaskActivity {
  id: string
  userId: string
  userName?: string
  type: string
  entityType: string
  entityId: string
  title: string
  emoji?: string
  createdAt: string
}
