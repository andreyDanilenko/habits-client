/** Приоритет задачи */
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical'

/** Статус задачи */
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled'

/** Тип задачи */
export type TaskType = 'task' | 'bug' | 'feature' | 'meeting' | 'call' | 'email' | 'lunch' | 'other'

/** Связь задачи с сущностью (crm_deal, crm_contact, crm_company) */
export interface TaskEntityLink {
  entityType: string
  entityId: string
  entityName?: string
}

/** Пункт чеклиста */
export interface TaskChecklistItem {
  id: string
  text: string
  done: boolean
}

/** Задача */
export interface Task {
  id: string
  workspaceId: string
  title: string
  description?: string
  type: TaskType
  priority: TaskPriority
  status: TaskStatus
  dueDate: string
  dueTime?: string
  reminderDate?: string
  completedAt?: string
  completedBy?: string
  completionNote?: string
  duration?: number
  assigneeId: string
  parentId?: string
  createdBy: string
  createdAt: string
  updatedAt: string
  spentMinutes?: number
  spentSeconds?: number
  entities?: TaskEntityLink[]
  /** Теги (пока без backend) */
  tags?: string[]
  /** Чеклист (пока без backend) */
  checklist?: TaskChecklistItem[]
}

/** DTO создания задачи */
export interface CreateTaskDto {
  title: string
  description?: string
  type: TaskType
  priority: TaskPriority
  status?: TaskStatus
  dueDate: string
  dueTime?: string
  reminderDate?: string
  duration?: number
  assigneeId: string
  parentId?: string
  entities?: TaskEntityLink[]
}

/** DTO обновления задачи */
export interface UpdateTaskDto {
  title?: string
  description?: string
  type?: TaskType
  priority?: TaskPriority
  status?: TaskStatus
  dueDate?: string
  dueTime?: string
  reminderDate?: string
  duration?: number
  spentMinutes?: number
  spentSeconds?: number
  assigneeId?: string
  tags?: string[]
  entities?: TaskEntityLink[]
}

/** Комментарий к задаче */
export interface TaskComment {
  id: string
  taskId: string
  parentId?: string
  body: string
  createdBy: string
  createdAt: string
}

/** Фильтры списка задач */
export interface TaskFilters {
  status?: TaskStatus
  priority?: TaskPriority
  type?: TaskType
  assigneeId?: string
  entityType?: string
  entityId?: string
  parentId?: string
  overdue?: boolean
  search?: string
  page?: number
  limit?: number
}
