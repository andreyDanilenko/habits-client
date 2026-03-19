import type { Ref } from 'vue'
import { ref, watch } from 'vue'
import { formatRelativeTime } from '@/shared/lib'
import { isRichContentEmpty } from '@/shared/lib/rich-content'
import type { Task, TaskComment } from '@/entities/task'
import type { CommentContext } from '../ui/comment-context'
import {
  getCommentAvatarUrl,
  getCommentCreatorId,
  getCommentCreatorName,
  getCommentInitials,
} from './task-comment-display'
import { useTaskCommentUi } from './use-task-comment-ui'
import { useTaskCommentsList } from './use-task-comments-list'
import { useTaskCommentsPagination } from './use-task-comments-pagination'

function replyCountLabel(count: number) {
  if (count === 1) return 'ответ'
  if (count >= 2 && count <= 4) return 'ответа'
  return 'ответов'
}

export function useTaskComments(
  task: Ref<Task | null>,
  workspaceId: Ref<string>,
  currentUserId: Ref<string>,
  assigneeOptions: Ref<{ value: string; label: string }[]>,
  canEditTask: Ref<boolean>,
  onUpdated?: () => void,
) {
  const newCommentBody = ref('')
  const commentFormKey = ref(0)
  const apiBase = import.meta.env.VITE_API_URL ?? ''

  const list = useTaskCommentsList(task, workspaceId, onUpdated)
  const pagination = useTaskCommentsPagination(list.comments)
  const ui = useTaskCommentUi(pagination.expandReplies)

  watch(
    () => task.value?.id,
    (id) => {
      if (id) {
        pagination.resetPagination()
        void list.fetchComments()
      } else {
        list.comments.value = []
      }
    },
    { immediate: true },
  )

  async function addComment() {
    const ok = await list.addComment(newCommentBody.value)
    if (ok) {
      newCommentBody.value = ''
      commentFormKey.value++
    }
  }

  async function addReply(parent: TaskComment) {
    const ok = await list.addReply(parent.id, ui.replyCommentBody.value)
    if (ok) {
      ui.replyCommentBody.value = ''
      ui.replyToCommentId.value = null
    }
  }

  async function saveEditComment(c: TaskComment) {
    if (isRichContentEmpty(ui.editCommentBody.value)) return
    const ok = await list.saveCommentEdit(c.id, ui.editCommentBody.value)
    if (ok) ui.cancelEditComment()
  }

  async function deleteComment(c: TaskComment) {
    await list.deleteCommentById(c.id)
  }

  function canDeleteComment(c: TaskComment) {
    return getCommentCreatorId(c.createdBy) === currentUserId.value
  }

  const commentContext: CommentContext = {
    getReplies: pagination.getReplies,
    getVisibleReplies: pagination.getVisibleReplies,
    getVisibleRepliesCount: pagination.getVisibleRepliesCount,
    hasMoreReplies: pagination.hasMoreReplies,
    showMoreReplies: pagination.showMoreReplies,
    getCreatorName: (createdBy) => getCommentCreatorName(createdBy, assigneeOptions.value),
    getInitials: (createdBy) => getCommentInitials(createdBy, assigneeOptions.value),
    getAvatarUrl: (createdBy) => getCommentAvatarUrl(createdBy, apiBase),
    formatRelativeTime,
    canDeleteComment,
    get canEditTask() {
      return canEditTask.value
    },
    commentMenuOpen: ui.commentMenuOpen,
    toggleCommentMenu: ui.toggleCommentMenu,
    editingCommentId: ui.editingCommentId,
    editCommentBody: ui.editCommentBody,
    setEditCommentBody: (v) => {
      ui.editCommentBody.value = v
    },
    startEditComment: ui.startEditComment,
    saveEditComment,
    cancelEditComment: ui.cancelEditComment,
    isRepliesExpanded: pagination.isRepliesExpanded,
    expandReplies: pagination.expandReplies,
    collapseReplies: pagination.collapseReplies,
    replyCountLabel,
    replyToCommentId: ui.replyToCommentId,
    replyCommentBody: ui.replyCommentBody,
    setReplyCommentBody: (v) => {
      ui.replyCommentBody.value = v
    },
    toggleReplyForm: ui.toggleReplyForm,
    addReply,
    deleteComment,
    commentSaving: list.commentSaving,
    isCommentEmpty: isRichContentEmpty,
  }

  function handleCommentMenuClickOutside(e: MouseEvent) {
    const target = e.target as HTMLElement
    if (!target.closest('.CommentCard__Menu')) {
      ui.commentMenuOpen.value = null
    }
  }

  return {
    commentContext,
    comments: list.comments,
    commentsLoading: list.commentsLoading,
    newCommentBody,
    commentFormKey,
    commentSaving: list.commentSaving,
    rootComments: pagination.rootComments,
    visibleRootComments: pagination.visibleRootComments,
    visibleCommentsCount: pagination.visibleCommentsCount,
    hasMoreComments: pagination.hasMoreComments,
    showMoreComments: pagination.showMoreComments,
    addComment,
    fetchComments: list.fetchComments,
    isRichContentEmpty,
    handleCommentMenuClickOutside,
  }
}
