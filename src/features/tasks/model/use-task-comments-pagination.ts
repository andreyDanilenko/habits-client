import type { Ref } from 'vue'
import { ref, computed } from 'vue'
import type { TaskComment } from '@/entities/task'
import {
  INITIAL_ROOT_COMMENTS,
  ROOT_COMMENTS_PAGE_SIZE,
  INITIAL_REPLIES,
  REPLIES_PAGE_SIZE,
} from './task-comments-constants'

export function useTaskCommentsPagination(comments: Ref<TaskComment[]>) {
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

  function showMoreComments() {
    visibleCommentsCount.value = Math.min(
      visibleCommentsCount.value + ROOT_COMMENTS_PAGE_SIZE,
      rootComments.value.length,
    )
  }

  function resetPagination() {
    visibleCommentsCount.value = INITIAL_ROOT_COMMENTS
    repliesExpanded.value = new Set()
    visibleRepliesCount.value = {}
  }

  return {
    visibleCommentsCount,
    rootComments,
    visibleRootComments,
    hasMoreComments,
    showMoreComments,
    getReplies,
    getVisibleReplies,
    getVisibleRepliesCount,
    hasMoreReplies,
    showMoreReplies,
    isRepliesExpanded,
    expandReplies,
    collapseReplies,
    resetPagination,
  }
}
