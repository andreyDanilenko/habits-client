import { ref, computed, watch, provide } from 'vue'
import { taskService } from '@/entities/task'
import { formatRelativeTime } from '@/shared/lib'
import { isRichContentEmpty } from '@/shared/lib/rich-content'
import type { Task, TaskComment } from '@/entities/task'
import type { CommentContext } from '../ui/comment-context'

/** Сколько корневых комментариев показывать изначально. Должно быть < ROOT_COMMENTS_PAGE_SIZE, иначе кнопка «Показать ещё» не появится. */
const INITIAL_ROOT_COMMENTS = 2
const ROOT_COMMENTS_PAGE_SIZE = 10
/** Сколько ответов показывать изначально в каждой ветке. */
const INITIAL_REPLIES = 2
const REPLIES_PAGE_SIZE = 5

export function useTaskComments(
  task: { value: Task | null },
  workspaceId: { value: string },
  currentUserId: { value: string },
  assigneeOptions: { value: { value: string; label: string }[] },
  canEditTask: { value: boolean },
  onUpdated?: () => void,
) {
  const comments = ref<TaskComment[]>([])
  const commentsLoading = ref(false)
  const newCommentBody = ref('')
  const commentSaving = ref(false)
  const commentMenuOpen = ref<string | null>(null)
  const editingCommentId = ref<string | null>(null)
  const editCommentBody = ref('')
  const replyToCommentId = ref<string | null>(null)
  const replyCommentBody = ref('')
  const visibleCommentsCount = ref(INITIAL_ROOT_COMMENTS)
  const repliesExpanded = ref<Set<string>>(new Set())
  const visibleRepliesCount = ref<Record<string, number>>({})

  const rootComments = computed(() => comments.value.filter((c) => !c.parentId))
  const visibleRootComments = computed(() =>
    rootComments.value.slice(0, visibleCommentsCount.value),
  )
  const hasMoreComments = computed(() => rootComments.value.length > visibleCommentsCount.value)

  function getReplies(parentId: string) {
    return comments.value.filter((c) => c.parentId === parentId)
  }

  function getVisibleReplies(parentId: string) {
    const all = getReplies(parentId)
    const limit = visibleRepliesCount.value[parentId] ?? INITIAL_REPLIES
    return all.slice(0, limit)
  }

  function getVisibleRepliesCount(parentId: string) {
    return visibleRepliesCount.value[parentId] ?? INITIAL_REPLIES
  }

  function hasMoreReplies(parentId: string) {
    const all = getReplies(parentId)
    const limit = getVisibleRepliesCount(parentId)
    return all.length > limit
  }

  function showMoreReplies(parentId: string) {
    const all = getReplies(parentId)
    const current = getVisibleRepliesCount(parentId)
    const next = Math.min(current + REPLIES_PAGE_SIZE, all.length)
    visibleRepliesCount.value = {
      ...visibleRepliesCount.value,
      [parentId]: next,
    }
  }

  function getCreatorName(userId: string) {
    const opt = assigneeOptions.value.find((o) => o.value === userId)
    return opt?.label ?? 'Пользователь'
  }

  function getInitials(userId: string) {
    const name = getCreatorName(userId)
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
  }

  function canDeleteComment(c: TaskComment) {
    return c.createdBy === currentUserId.value
  }

  function isRepliesExpanded(commentId: string) {
    return repliesExpanded.value.has(commentId)
  }

  function expandReplies(commentId: string) {
    repliesExpanded.value = new Set([...repliesExpanded.value, commentId])
  }

  function collapseReplies(commentId: string) {
    const next = new Set(repliesExpanded.value)
    next.delete(commentId)
    repliesExpanded.value = next
    const { [commentId]: _, ...rest } = visibleRepliesCount.value
    visibleRepliesCount.value = rest
  }

  function replyCountLabel(count: number) {
    if (count === 1) return 'ответ'
    if (count >= 2 && count <= 4) return 'ответа'
    return 'ответов'
  }

  function toggleReplyForm(commentId: string) {
    if (replyToCommentId.value === commentId) {
      replyToCommentId.value = null
      replyCommentBody.value = ''
    } else {
      replyToCommentId.value = commentId
      expandReplies(commentId)
    }
  }

  function toggleCommentMenu(commentId: string) {
    commentMenuOpen.value = commentMenuOpen.value === commentId ? null : commentId
  }

  function startEditComment(c: TaskComment) {
    editingCommentId.value = c.id
    editCommentBody.value = c.body
  }

  function cancelEditComment() {
    editingCommentId.value = null
    editCommentBody.value = ''
  }

  async function fetchComments() {
    if (!task.value) return
    commentsLoading.value = true
    try {
      comments.value = await taskService.getComments(workspaceId.value, task.value.id)
    } catch (e) {
      console.error('Failed to fetch comments:', e)
      comments.value = []
    } finally {
      commentsLoading.value = false
    }
  }

  async function addComment() {
    if (!task.value || isRichContentEmpty(newCommentBody.value)) return
    commentSaving.value = true
    try {
      const created = await taskService.createComment(
        workspaceId.value,
        task.value.id,
        newCommentBody.value,
      )
      newCommentBody.value = ''
      const normalized = { ...created, parentId: created.parentId ?? (created as { parent_id?: string }).parent_id }
      comments.value = [...comments.value, normalized]
      onUpdated?.()
    } catch (e) {
      console.error('Failed to add comment:', e)
    } finally {
      commentSaving.value = false
    }
  }

  async function addReply(parent: TaskComment) {
    if (!task.value || isRichContentEmpty(replyCommentBody.value)) return
    commentSaving.value = true
    try {
      const created = await taskService.createComment(
        workspaceId.value,
        task.value.id,
        replyCommentBody.value,
        parent.id,
      )
      replyCommentBody.value = ''
      replyToCommentId.value = null
      const normalized = {
        ...created,
        parentId: created.parentId ?? (created as { parent_id?: string }).parent_id ?? parent.id,
      }
      comments.value = [...comments.value, normalized]
      onUpdated?.()
    } catch (e) {
      console.error('Failed to add comment:', e)
    } finally {
      commentSaving.value = false
    }
  }

  async function saveEditComment(c: TaskComment) {
    if (!task.value || isRichContentEmpty(editCommentBody.value)) return
    commentSaving.value = true
    try {
      await taskService.updateComment(workspaceId.value, task.value.id, c.id, editCommentBody.value)
      cancelEditComment()
      await fetchComments()
      onUpdated?.()
    } catch (e) {
      console.error('Failed to update comment:', e)
    } finally {
      commentSaving.value = false
    }
  }

  async function deleteComment(c: TaskComment) {
    if (!task.value) return
    try {
      await taskService.deleteComment(workspaceId.value, task.value.id, c.id)
      await fetchComments()
      onUpdated?.()
    } catch (e) {
      console.error('Failed to delete comment:', e)
    }
  }

  function showMoreComments() {
    visibleCommentsCount.value = Math.min(
      visibleCommentsCount.value + ROOT_COMMENTS_PAGE_SIZE,
      rootComments.value.length,
    )
  }

  watch(
    () => task.value?.id,
    (id) => {
      if (id) {
        fetchComments()
        visibleCommentsCount.value = INITIAL_ROOT_COMMENTS
        repliesExpanded.value = new Set()
        visibleRepliesCount.value = {}
      } else {
        comments.value = []
      }
    },
    { immediate: true },
  )

  const commentContext: CommentContext = {
    getReplies,
    getVisibleReplies,
    getVisibleRepliesCount,
    hasMoreReplies,
    showMoreReplies,
    getCreatorName,
    getInitials,
    formatRelativeTime,
    canDeleteComment,
    get canEditTask() {
      return canEditTask.value
    },
    commentMenuOpen,
    toggleCommentMenu,
    editingCommentId,
    editCommentBody,
    setEditCommentBody: (v) => {
      editCommentBody.value = v
    },
    startEditComment,
    saveEditComment,
    cancelEditComment,
    isRepliesExpanded,
    expandReplies,
    collapseReplies,
    replyCountLabel,
    replyToCommentId,
    replyCommentBody,
    setReplyCommentBody: (v) => {
      replyCommentBody.value = v
    },
    toggleReplyForm,
    addReply,
    deleteComment,
    commentSaving,
    isCommentEmpty: isRichContentEmpty,
  }

  provide('commentContext', commentContext)

  function handleCommentMenuClickOutside(e: MouseEvent) {
    const target = e.target as HTMLElement
    if (!target.closest('.CommentCard__Menu')) {
      commentMenuOpen.value = null
    }
  }

  return {
    comments,
    commentsLoading,
    newCommentBody,
    commentSaving,
    rootComments,
    visibleRootComments,
    visibleCommentsCount,
    hasMoreComments,
    showMoreComments,
    addComment,
    fetchComments,
    isRichContentEmpty,
    handleCommentMenuClickOutside,
  }
}
