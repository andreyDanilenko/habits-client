import type { Ref } from 'vue'
import type { TaskComment } from '@/entities/task'

export interface CommentContext {
  getReplies: (parentId: string) => TaskComment[]
  getVisibleReplies: (parentId: string) => TaskComment[]
  getVisibleRepliesCount: (parentId: string) => number
  hasMoreReplies: (parentId: string) => boolean
  showMoreReplies: (parentId: string) => void
  getCreatorName: (userId: string) => string
  getInitials: (userId: string) => string
  formatRelativeTime: (date: string) => string
  canDeleteComment: (c: TaskComment) => boolean
  canEditTask: boolean
  commentMenuOpen: Ref<string | null>
  toggleCommentMenu: (id: string) => void
  editingCommentId: Ref<string | null>
  editCommentBody: Ref<string>
  setEditCommentBody: (v: string) => void
  startEditComment: (c: TaskComment) => void
  saveEditComment: (c: TaskComment) => Promise<void>
  cancelEditComment: () => void
  isRepliesExpanded: (id: string) => boolean
  expandReplies: (id: string) => void
  collapseReplies: (id: string) => void
  replyCountLabel: (count: number) => string
  replyToCommentId: Ref<string | null>
  replyCommentBody: Ref<string>
  setReplyCommentBody: (v: string) => void
  toggleReplyForm: (id: string) => void
  addReply: (parent: TaskComment) => Promise<void>
  deleteComment: (c: TaskComment) => Promise<void>
  commentSaving: Ref<boolean>
  isCommentEmpty: (html: string) => boolean
}
