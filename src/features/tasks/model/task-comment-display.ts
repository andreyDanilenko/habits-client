import type { TaskCommentCreatedBy } from '@/entities/task'
import { DEFAULT_COMMENT_AUTHOR_LABEL } from './task-comments-constants'

export type AssigneeOption = { value: string; label: string }

export function getCommentCreatorId(createdBy: string | TaskCommentCreatedBy): string {
  return typeof createdBy === 'string' ? createdBy : createdBy.id
}

export function getCommentCreatorName(
  createdBy: string | TaskCommentCreatedBy,
  assigneeOptions: AssigneeOption[],
): string {
  if (typeof createdBy !== 'string' && createdBy?.name) {
    return createdBy.name
  }
  const userId = getCommentCreatorId(createdBy)
  const opt = assigneeOptions.find((o) => o.value === userId)
  return opt?.label ?? DEFAULT_COMMENT_AUTHOR_LABEL
}

export function getCommentInitials(
  createdBy: string | TaskCommentCreatedBy,
  assigneeOptions: AssigneeOption[],
): string {
  const name = getCommentCreatorName(createdBy, assigneeOptions)
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

export function getCommentAvatarUrl(
  createdBy: string | TaskCommentCreatedBy,
  apiBase: string,
): string | undefined {
  if (typeof createdBy !== 'string' && createdBy?.avatarUrl) {
    return `${apiBase}${createdBy.avatarUrl}`
  }
  return undefined
}
